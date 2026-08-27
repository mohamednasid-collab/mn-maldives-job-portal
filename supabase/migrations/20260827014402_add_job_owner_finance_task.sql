alter table public.jobs add column owner_id uuid references public.profiles(id) on delete set null default auth.uid();
update public.jobs set owner_id = created_by where owner_id is null;
alter table public.jobs alter column owner_id set not null;

alter table public.tasks add column notification_sent_at timestamptz;

create index jobs_owner_idx on public.jobs(owner_id);
create unique index tasks_one_finance_invoice_per_job_idx
  on public.tasks(job_id)
  where title = 'Create invoice and email customer';

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
for insert to authenticated
with check (private.current_user_role() in ('super_admin', 'admin', 'finance'));

create or replace function private.assign_finance_invoice_task()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  finance_user_id uuid;
begin
  if new.status = 'production'
     and (tg_op = 'INSERT' or old.status is distinct from 'production'::public.job_status) then
    select profile.id
      into finance_user_id
      from public.profiles profile
     where profile.role = 'finance'
       and profile.active
     order by profile.created_at
     limit 1;

    if finance_user_id is not null then
      insert into public.tasks (job_id, title, assigned_to, status, created_by)
      values (
        new.id,
        'Create invoice and email customer',
        finance_user_id,
        'todo',
        coalesce((select auth.uid()), new.created_by)
      )
      on conflict (job_id) where title = 'Create invoice and email customer'
      do nothing;
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists assign_finance_invoice_task on public.jobs;
create trigger assign_finance_invoice_task
after insert or update of status on public.jobs
for each row execute function private.assign_finance_invoice_task();
