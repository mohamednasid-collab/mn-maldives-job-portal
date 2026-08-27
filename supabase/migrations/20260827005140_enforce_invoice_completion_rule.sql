create or replace function private.enforce_job_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  has_invoice boolean;
begin
  if new.amount_paid = new.invoice_total and new.invoice_total > 0 then
    new.payment_status := 'paid';
  elsif new.amount_paid > 0 then
    new.payment_status := 'part_paid';
  else
    new.payment_status := 'unpaid';
  end if;

  select
    coalesce(nullif(pg_catalog.btrim(new.invoice_number), ''), '') <> ''
    or exists (
      select 1
      from public.financial_documents document
      where document.job_id = new.id
        and document.document_type = 'invoice'
    )
  into has_invoice;

  if new.status in ('delivered', 'completed') then
    if has_invoice then
      new.status := 'completed';
    else
      new.status := 'incomplete';
    end if;
  end if;

  return new;
end
$$;

create or replace function private.sync_job_invoice_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  affected_job_id uuid;
  has_invoice boolean;
begin
  affected_job_id := case when tg_op = 'DELETE' then old.job_id else new.job_id end;
  if affected_job_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select exists (
    select 1
    from public.financial_documents document
    where document.job_id = affected_job_id
      and document.document_type = 'invoice'
  ) into has_invoice;

  if has_invoice then
    update public.jobs set status = 'completed'
    where id = affected_job_id and status = 'incomplete';
  else
    update public.jobs set status = 'incomplete'
    where id = affected_job_id and status = 'completed';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

drop trigger if exists sync_job_invoice_status on public.financial_documents;
create trigger sync_job_invoice_status
after insert or update of document_type, job_id or delete on public.financial_documents
for each row execute function private.sync_job_invoice_status();

update public.jobs job
set status = case
  when coalesce(nullif(pg_catalog.btrim(job.invoice_number), ''), '') <> ''
    or exists (
      select 1 from public.financial_documents document
      where document.job_id = job.id and document.document_type = 'invoice'
    )
  then 'completed'::public.job_status
  else 'incomplete'::public.job_status
end
where job.status in ('delivered', 'unpaid', 'completed');
