create unique index if not exists financial_documents_one_invoice_per_job_idx
on public.financial_documents (job_id)
where document_type = 'invoice' and job_id is not null;

create or replace function public.create_production_invoice(target_job_id uuid)
returns table (invoice_id uuid, invoice_number text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_job public.jobs%rowtype;
  existing_id uuid;
  existing_number text;
  created_id uuid;
  created_number text;
begin
  if not private.is_active_user()
     or coalesce(private.current_user_role()::text, '') not in ('super_admin', 'admin', 'finance') then
    raise exception 'You do not have permission to create a production invoice';
  end if;

  select * into target_job from public.jobs where id = target_job_id;
  if not found then raise exception 'Job not found'; end if;
  if target_job.status <> 'production'::public.job_status then
    raise exception 'An automatic invoice can only be created for a production job';
  end if;

  select document.id, document.document_number
  into existing_id, existing_number
  from public.financial_documents document
  where document.job_id = target_job_id and document.document_type = 'invoice'
  limit 1;

  if existing_id is not null then
    update public.jobs set invoice_number = existing_number
    where id = target_job_id and invoice_number is distinct from existing_number;
    return query select existing_id, existing_number;
    return;
  end if;

  if not exists (select 1 from public.job_items where job_id = target_job_id) then
    raise exception 'Select at least one production item before creating the invoice';
  end if;

  begin
    insert into public.financial_documents (
      document_type, document_number, status, job_id, customer_name, subject,
      issue_date, due_date, terms, discount_percent, amount_paid, notes
    ) values (
      'invoice', '', 'draft', target_job_id, target_job.customer_name,
      target_job.description, current_date, target_job.due_date,
      'Due on Receipt', 0, 0, target_job.notes
    ) returning id, document_number into created_id, created_number;
  exception when unique_violation then
    select document.id, document.document_number
    into existing_id, existing_number
    from public.financial_documents document
    where document.job_id = target_job_id and document.document_type = 'invoice'
    limit 1;
    return query select existing_id, existing_number;
    return;
  end;

  insert into public.financial_document_items (
    document_id, position, description, detail, quantity, rate
  )
  select created_id,
         row_number() over (order by job_item.created_at, job_item.id)::integer,
         item.code || ' - ' || item.name,
         item.description,
         job_item.quantity,
         item.rate
  from public.job_items job_item
  join public.items item on item.id = job_item.item_id
  where job_item.job_id = target_job_id;

  update public.jobs set invoice_number = created_number where id = target_job_id;
  return query select created_id, created_number;
end
$$;

revoke all on function public.create_production_invoice(uuid) from public, anon;
grant execute on function public.create_production_invoice(uuid) to authenticated;

create or replace function private.protect_paid_invoice()
returns trigger language plpgsql set search_path = '' as $$
declare payment_exists boolean;
begin
  if tg_op = 'DELETE' then
    if old.document_type = 'invoice'::public.document_type
       and exists (select 1 from public.payments where invoice_id = old.id) then
      raise exception 'An invoice with a recorded payment cannot be deleted';
    end if;
    return old;
  end if;

  if new.document_type = 'invoice'::public.document_type then
    select exists (select 1 from public.payments where invoice_id = old.id)
    into payment_exists;

    if payment_exists and row(
      new.document_type, new.document_number, new.status,
      new.source_quotation_id, new.job_id, new.customer_name,
      new.customer_address, new.subject, new.issue_date, new.due_date,
      new.terms, new.discount_percent, new.notes
    ) is distinct from row(
      old.document_type, old.document_number, old.status,
      old.source_quotation_id, old.job_id, old.customer_name,
      old.customer_address, old.subject, old.issue_date, old.due_date,
      old.terms, old.discount_percent, old.notes
    ) then
      raise exception 'An invoice with a recorded payment cannot be edited';
    end if;

    select coalesce(sum(payment.amount), 0) into new.amount_paid
    from public.payments payment where payment.invoice_id = old.id;
  end if;
  return new;
end
$$;

create or replace function private.protect_paid_invoice_item()
returns trigger language plpgsql set search_path = '' as $$
declare target_document_id uuid;
begin
  target_document_id := case when tg_op = 'DELETE' then old.document_id else new.document_id end;
  if exists (
    select 1 from public.financial_documents document
    join public.payments payment on payment.invoice_id = document.id
    where document.id = target_document_id and document.document_type = 'invoice'
  ) then
    raise exception 'Items on an invoice with a recorded payment cannot be edited';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

drop trigger if exists protect_paid_invoice on public.financial_documents;
create trigger protect_paid_invoice
before update or delete on public.financial_documents
for each row execute function private.protect_paid_invoice();

drop trigger if exists protect_paid_invoice_item on public.financial_document_items;
create trigger protect_paid_invoice_item
before insert or update or delete on public.financial_document_items
for each row execute function private.protect_paid_invoice_item();
