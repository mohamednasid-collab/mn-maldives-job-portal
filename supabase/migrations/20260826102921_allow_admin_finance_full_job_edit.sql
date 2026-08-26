-- Administrators and finance users are trusted job editors. Keep user
-- management and deletion restricted to super administrators.

drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs
for insert to authenticated
with check (private.current_user_role() in ('super_admin', 'admin', 'finance'));

create or replace function private.enforce_job_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.amount_paid = new.invoice_total and new.invoice_total > 0 then
    new.payment_status := 'paid';
  elsif new.amount_paid > 0 then
    new.payment_status := 'part_paid';
  else
    new.payment_status := 'unpaid';
  end if;

  if new.status = 'delivered' then
    if new.payment_status = 'paid' then
      new.status := 'completed';
    else
      new.status := 'unpaid';
    end if;
  elsif new.status = 'completed' and new.payment_status <> 'paid' then
    raise exception 'A job cannot be completed until fully paid';
  end if;

  return new;
end
$$;
