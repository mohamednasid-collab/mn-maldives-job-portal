alter table public.financial_documents
  add column advance_payment numeric(14,2) not null default 0
    check (advance_payment >= 0),
  add column voided_at timestamptz,
  add column void_reason text,
  add column voided_by uuid references public.profiles(id),
  add constraint financial_documents_void_details_check check (
    (voided_at is null and void_reason is null and voided_by is null)
    or (
      voided_at is not null
      and nullif(pg_catalog.btrim(void_reason), '') is not null
      and voided_by is not null
    )
  ),
  add constraint financial_documents_advance_invoice_only_check check (
    document_type = 'invoice'::public.document_type or advance_payment = 0
  );

create table public.invoice_deletion_audit (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null,
  document_number text not null,
  job_id uuid,
  customer_name text not null,
  invoice_total numeric(14,2) not null,
  advance_payment numeric(14,2) not null default 0,
  reason text not null check (nullif(pg_catalog.btrim(reason), '') is not null),
  deleted_by uuid not null references public.profiles(id),
  deleted_at timestamptz not null default now()
);

alter table public.invoice_deletion_audit enable row level security;
revoke all on table public.invoice_deletion_audit from anon, authenticated;
grant select, insert on table public.invoice_deletion_audit to authenticated;

create policy invoice_deletion_audit_select_finance
on public.invoice_deletion_audit for select to authenticated
using (
  private.is_active_user()
  and coalesce(private.current_user_role()::text, '') in ('super_admin', 'admin', 'finance')
);

create policy invoice_deletion_audit_insert_finance
on public.invoice_deletion_audit for insert to authenticated
with check (
  private.is_active_user()
  and coalesce(private.current_user_role()::text, '') in ('super_admin', 'admin', 'finance')
  and deleted_by = (select auth.uid())
);

create index invoice_deletion_audit_deleted_at_idx
on public.invoice_deletion_audit (deleted_at desc);
create index invoice_deletion_audit_deleted_by_idx
on public.invoice_deletion_audit (deleted_by);
create index financial_documents_voided_by_idx
on public.financial_documents (voided_by) where voided_by is not null;

drop index if exists public.financial_documents_one_invoice_per_job_idx;
create unique index financial_documents_one_invoice_per_job_idx
on public.financial_documents (job_id)
where document_type = 'invoice' and job_id is not null and voided_at is null;

create or replace function private.protect_paid_invoice()
returns trigger language plpgsql set search_path = '' as $$
declare payment_exists boolean;
begin
  if tg_op = 'DELETE' then
    if old.document_type = 'invoice'::public.document_type
       and (
         old.advance_payment > 0
         or exists (select 1 from public.payments where invoice_id = old.id)
       ) then
      raise exception 'An invoice with a recorded payment cannot be deleted';
    end if;
    return old;
  end if;

  if new.document_type = 'invoice'::public.document_type then
    select exists (select 1 from public.payments where invoice_id = old.id)
    into payment_exists;

    if (old.advance_payment > 0 or payment_exists) and row(
      new.document_type, new.document_number, new.status,
      new.source_quotation_id, new.job_id, new.customer_name,
      new.customer_address, new.subject, new.issue_date, new.due_date,
      new.terms, new.discount_percent, new.advance_payment, new.notes,
      new.voided_at, new.void_reason, new.voided_by
    ) is distinct from row(
      old.document_type, old.document_number, old.status,
      old.source_quotation_id, old.job_id, old.customer_name,
      old.customer_address, old.subject, old.issue_date, old.due_date,
      old.terms, old.discount_percent, old.advance_payment, old.notes,
      old.voided_at, old.void_reason, old.voided_by
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
    select 1
    from public.financial_documents document
    where document.id = target_document_id
      and document.document_type = 'invoice'
      and (
        document.advance_payment > 0
        or exists (
          select 1 from public.payments payment where payment.invoice_id = document.id
        )
      )
  ) then
    raise exception 'Items on an invoice with a recorded payment cannot be edited';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

create or replace function private.validate_invoice_advance()
returns trigger language plpgsql set search_path = '' as $$
declare invoice_total numeric(14,2);
begin
  if new.document_type = 'invoice'::public.document_type and new.advance_payment > 0 then
    select coalesce(sum(item.quantity * item.rate), 0)
           * (1 - new.discount_percent / 100)
    into invoice_total
    from public.financial_document_items item
    where item.document_id = new.id;
    if new.advance_payment > invoice_total then
      raise exception 'Advance payment exceeds the invoice total';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists validate_invoice_advance on public.financial_documents;
create trigger validate_invoice_advance
before insert or update of advance_payment, discount_percent on public.financial_documents
for each row execute function private.validate_invoice_advance();

create or replace function private.require_invoice_lifecycle_reason()
returns trigger language plpgsql set search_path = '' as $$
declare expected_reason text;
begin
  if tg_op = 'DELETE' then
    if old.document_type = 'invoice'::public.document_type then
      expected_reason := pg_catalog.current_setting('app.invoice_delete_reason', true);
      if nullif(pg_catalog.btrim(expected_reason), '') is null then
        raise exception 'Use the invoice delete action and provide a reason';
      end if;
    end if;
    return old;
  end if;

  if old.voided_at is not null and row(new.voided_at, new.void_reason, new.voided_by)
     is distinct from row(old.voided_at, old.void_reason, old.voided_by) then
    raise exception 'Void details cannot be changed';
  end if;
  if old.voided_at is null and new.voided_at is not null then
    expected_reason := pg_catalog.current_setting('app.invoice_void_reason', true);
    if nullif(pg_catalog.btrim(expected_reason), '') is null
       or pg_catalog.btrim(new.void_reason) is distinct from pg_catalog.btrim(expected_reason)
       or new.voided_by is distinct from (select auth.uid()) then
      raise exception 'Use the invoice void action and provide a reason';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists require_invoice_lifecycle_reason on public.financial_documents;
create trigger require_invoice_lifecycle_reason
before update of voided_at, void_reason, voided_by or delete on public.financial_documents
for each row execute function private.require_invoice_lifecycle_reason();

create or replace function private.validate_invoice_payment()
returns trigger language plpgsql set search_path = '' as $$
declare
  invoice_type public.document_type;
  invoice_total numeric(14,2);
  invoice_advance numeric(14,2);
  invoice_voided_at timestamptz;
  existing_total numeric(14,2);
begin
  perform 1 from public.financial_documents where id = new.invoice_id for update;

  select document.document_type,
         coalesce(sum(item.quantity * item.rate), 0) * (1 - document.discount_percent / 100),
         document.advance_payment,
         document.voided_at
    into invoice_type, invoice_total, invoice_advance, invoice_voided_at
    from public.financial_documents document
    left join public.financial_document_items item on item.document_id = document.id
   where document.id = new.invoice_id
   group by document.id;

  if invoice_type is distinct from 'invoice'::public.document_type then
    raise exception 'Payments must be linked to an invoice';
  end if;
  if invoice_voided_at is not null then
    raise exception 'Payments cannot be recorded against a voided invoice';
  end if;

  select coalesce(sum(amount), 0) into existing_total
    from public.payments
   where invoice_id = new.invoice_id and id is distinct from new.id;

  if invoice_advance + existing_total + new.amount > invoice_total then
    raise exception 'Payment exceeds the invoice balance';
  end if;
  return new;
end $$;

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
        and document.voided_at is null
    )
  into has_invoice;

  if new.status in ('delivered', 'completed') then
    if has_invoice then new.status := 'completed';
    else new.status := 'incomplete';
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
      and document.voided_at is null
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
after insert or update of document_type, job_id, voided_at or delete on public.financial_documents
for each row execute function private.sync_job_invoice_status();

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
  where document.job_id = target_job_id
    and document.document_type = 'invoice'
    and document.voided_at is null
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
      issue_date, due_date, terms, discount_percent, advance_payment, amount_paid, notes
    ) values (
      'invoice', '', 'draft', target_job_id, target_job.customer_name,
      target_job.description, current_date, target_job.due_date,
      'Due on Receipt', 0, 0, 0, target_job.notes
    ) returning id, document_number into created_id, created_number;
  exception when unique_violation then
    select document.id, document.document_number
    into existing_id, existing_number
    from public.financial_documents document
    where document.job_id = target_job_id
      and document.document_type = 'invoice'
      and document.voided_at is null
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

create or replace function public.void_invoice(target_invoice_id uuid, reason text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare target_invoice public.financial_documents%rowtype;
begin
  if not private.is_active_user()
     or coalesce(private.current_user_role()::text, '') not in ('super_admin', 'admin', 'finance') then
    raise exception 'You do not have permission to void invoices';
  end if;
  if nullif(pg_catalog.btrim(reason), '') is null then
    raise exception 'A reason is required to void an invoice';
  end if;

  select * into target_invoice
  from public.financial_documents
  where id = target_invoice_id and document_type = 'invoice'
  for update;
  if not found then raise exception 'Invoice not found'; end if;
  if target_invoice.voided_at is not null then raise exception 'Invoice is already voided'; end if;
  if target_invoice.advance_payment > 0
     or exists (select 1 from public.payments where invoice_id = target_invoice.id) then
    raise exception 'An invoice with a recorded payment cannot be voided';
  end if;

  perform pg_catalog.set_config('app.invoice_void_reason', pg_catalog.btrim(reason), true);
  update public.financial_documents
  set voided_at = now(), void_reason = pg_catalog.btrim(reason), voided_by = (select auth.uid())
  where id = target_invoice.id;

  if target_invoice.job_id is not null then
    update public.jobs set invoice_number = null
    where id = target_invoice.job_id and invoice_number = target_invoice.document_number;
  end if;
end
$$;

create or replace function public.delete_invoice(target_invoice_id uuid, reason text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_invoice public.financial_documents%rowtype;
  target_total numeric(14,2);
begin
  if not private.is_active_user()
     or coalesce(private.current_user_role()::text, '') not in ('super_admin', 'admin', 'finance') then
    raise exception 'You do not have permission to delete invoices';
  end if;
  if nullif(pg_catalog.btrim(reason), '') is null then
    raise exception 'A reason is required to delete an invoice';
  end if;

  select * into target_invoice
  from public.financial_documents
  where id = target_invoice_id and document_type = 'invoice'
  for update;
  if not found then raise exception 'Invoice not found'; end if;
  if target_invoice.advance_payment > 0
     or exists (select 1 from public.payments where invoice_id = target_invoice.id) then
    raise exception 'An invoice with a recorded payment cannot be deleted';
  end if;

  select coalesce(sum(item.quantity * item.rate), 0)
         * (1 - target_invoice.discount_percent / 100)
  into target_total
  from public.financial_document_items item
  where item.document_id = target_invoice.id;

  insert into public.invoice_deletion_audit (
    invoice_id, document_number, job_id, customer_name, invoice_total,
    advance_payment, reason, deleted_by
  ) values (
    target_invoice.id, target_invoice.document_number, target_invoice.job_id,
    target_invoice.customer_name, target_total, target_invoice.advance_payment,
    pg_catalog.btrim(reason), (select auth.uid())
  );

  perform pg_catalog.set_config('app.invoice_delete_reason', pg_catalog.btrim(reason), true);
  delete from public.financial_documents where id = target_invoice.id;
  if target_invoice.job_id is not null then
    update public.jobs set invoice_number = null
    where id = target_invoice.job_id and invoice_number = target_invoice.document_number;
  end if;
end
$$;

revoke all on function public.create_production_invoice(uuid) from public, anon;
grant execute on function public.create_production_invoice(uuid) to authenticated;
revoke all on function public.void_invoice(uuid, text) from public, anon;
grant execute on function public.void_invoice(uuid, text) to authenticated;
revoke all on function public.delete_invoice(uuid, text) from public, anon;
grant execute on function public.delete_invoice(uuid, text) to authenticated;
