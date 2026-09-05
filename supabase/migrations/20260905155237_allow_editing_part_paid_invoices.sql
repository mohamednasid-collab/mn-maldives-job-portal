create or replace function private.protect_paid_invoice()
returns trigger language plpgsql set search_path = '' as $$
declare
  payment_total numeric(14,2);
  invoice_total numeric(14,2);
  atomic_edit_id text;
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
    select coalesce(sum(payment.amount), 0)
    into payment_total
    from public.payments payment
    where payment.invoice_id = old.id;

    select coalesce(sum(item.quantity * item.rate), 0)
           * (1 - old.discount_percent / 100)
    into invoice_total
    from public.financial_document_items item
    where item.document_id = old.id;

    atomic_edit_id := pg_catalog.current_setting('app.invoice_atomic_edit', true);
    if atomic_edit_id is distinct from old.id::text
       and invoice_total > 0
       and old.advance_payment + payment_total >= invoice_total
       and row(
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
      raise exception 'A fully paid invoice cannot be edited';
    end if;

    select coalesce(sum(payment.amount), 0) into new.amount_paid
    from public.payments payment where payment.invoice_id = old.id;
  end if;
  return new;
end
$$;

create or replace function private.protect_paid_invoice_item()
returns trigger language plpgsql set search_path = '' as $$
declare
  target_document_id uuid;
  target_document public.financial_documents%rowtype;
  payment_total numeric(14,2);
  invoice_subtotal numeric(14,2);
  projected_subtotal numeric(14,2);
begin
  target_document_id := case when tg_op = 'DELETE' then old.document_id else new.document_id end;
  select * into target_document
  from public.financial_documents
  where id = target_document_id;

  if not found or target_document.document_type <> 'invoice'::public.document_type then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if pg_catalog.current_setting('app.invoice_atomic_edit', true) = target_document_id::text then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select coalesce(sum(payment.amount), 0)
  into payment_total
  from public.payments payment
  where payment.invoice_id = target_document_id;

  select coalesce(sum(item.quantity * item.rate), 0)
  into invoice_subtotal
  from public.financial_document_items item
  where item.document_id = target_document_id;

  if invoice_subtotal > 0
     and target_document.advance_payment + payment_total
         >= invoice_subtotal * (1 - target_document.discount_percent / 100) then
    raise exception 'Items on a fully paid invoice cannot be edited';
  end if;

  projected_subtotal := invoice_subtotal;
  if tg_op in ('UPDATE', 'DELETE') and old.document_id = target_document_id then
    projected_subtotal := projected_subtotal - old.quantity * old.rate;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.document_id = target_document_id then
    projected_subtotal := projected_subtotal + new.quantity * new.rate;
  end if;

  if target_document.advance_payment + payment_total
     > projected_subtotal * (1 - target_document.discount_percent / 100) then
    raise exception 'Invoice total cannot be lower than payments received';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end
$$;

create or replace function private.validate_invoice_advance()
returns trigger language plpgsql set search_path = '' as $$
declare
  invoice_total numeric(14,2);
  payment_total numeric(14,2);
begin
  if new.document_type = 'invoice'::public.document_type
     and pg_catalog.current_setting('app.invoice_atomic_edit', true) is distinct from new.id::text then
    select coalesce(sum(item.quantity * item.rate), 0)
           * (1 - new.discount_percent / 100)
    into invoice_total
    from public.financial_document_items item
    where item.document_id = new.id;

    select coalesce(sum(payment.amount), 0)
    into payment_total
    from public.payments payment
    where payment.invoice_id = new.id;

    if new.advance_payment + payment_total > invoice_total then
      raise exception 'Invoice total cannot be lower than payments received';
    end if;
  end if;
  return new;
end
$$;

create or replace function public.update_invoice(
  target_invoice_id uuid,
  invoice_job_id uuid,
  invoice_customer_name text,
  invoice_customer_address text,
  invoice_subject text,
  invoice_issue_date date,
  invoice_due_date date,
  invoice_terms text,
  invoice_discount_percent numeric,
  invoice_advance_payment numeric,
  invoice_notes text,
  invoice_items jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_invoice public.financial_documents%rowtype;
  payment_total numeric(14,2);
  current_total numeric(14,2);
  updated_subtotal numeric(14,2);
  updated_total numeric(14,2);
begin
  if not private.is_active_user() then
    raise exception 'You do not have permission to edit invoices';
  end if;

  select * into target_invoice
  from public.financial_documents
  where id = target_invoice_id and document_type = 'invoice'
  for update;
  if not found then raise exception 'Invoice not found'; end if;
  if target_invoice.voided_at is not null then raise exception 'A voided invoice cannot be edited'; end if;

  select coalesce(sum(payment.amount), 0)
  into payment_total
  from public.payments payment
  where payment.invoice_id = target_invoice_id;

  select coalesce(sum(item.quantity * item.rate), 0)
         * (1 - target_invoice.discount_percent / 100)
  into current_total
  from public.financial_document_items item
  where item.document_id = target_invoice_id;

  if current_total > 0
     and target_invoice.advance_payment + payment_total >= current_total then
    raise exception 'A fully paid invoice cannot be edited';
  end if;

  if nullif(pg_catalog.btrim(invoice_customer_name), '') is null then
    raise exception 'Customer name is required';
  end if;
  if invoice_issue_date is null then raise exception 'Invoice date is required'; end if;
  if invoice_discount_percent is null or invoice_discount_percent < 0 or invoice_discount_percent > 100 then
    raise exception 'Discount must be between 0 and 100';
  end if;
  if invoice_advance_payment is null or invoice_advance_payment < 0 then
    raise exception 'Advance payment cannot be negative';
  end if;
  if invoice_items is null
     or pg_catalog.jsonb_typeof(invoice_items) <> 'array'
     or pg_catalog.jsonb_array_length(invoice_items) = 0 then
    raise exception 'At least one invoice item is required';
  end if;
  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(invoice_items) item
    where nullif(pg_catalog.btrim(item ->> 'item_id'), '') is null
      or nullif(pg_catalog.btrim(item ->> 'description'), '') is null
      or nullif(pg_catalog.btrim(item ->> 'quantity'), '') is null
      or nullif(pg_catalog.btrim(item ->> 'rate'), '') is null
      or (item ->> 'quantity')::numeric <= 0
      or (item ->> 'rate')::numeric < 0
  ) then
    raise exception 'Every invoice item must have an item, description, positive quantity and non-negative rate';
  end if;

  select coalesce(sum((item ->> 'quantity')::numeric * (item ->> 'rate')::numeric), 0)
  into updated_subtotal
  from pg_catalog.jsonb_array_elements(invoice_items) item;
  updated_total := updated_subtotal * (1 - invoice_discount_percent / 100);

  if invoice_advance_payment + payment_total > updated_total then
    raise exception 'Invoice total cannot be lower than payments received';
  end if;

  perform pg_catalog.set_config('app.invoice_atomic_edit', target_invoice_id::text, true);

  update public.financial_documents
  set job_id = invoice_job_id,
      customer_name = pg_catalog.btrim(invoice_customer_name),
      customer_address = invoice_customer_address,
      subject = invoice_subject,
      issue_date = invoice_issue_date,
      due_date = invoice_due_date,
      terms = coalesce(nullif(pg_catalog.btrim(invoice_terms), ''), 'Due on Receipt'),
      discount_percent = invoice_discount_percent,
      advance_payment = invoice_advance_payment,
      notes = invoice_notes
  where id = target_invoice_id;

  delete from public.financial_document_items where document_id = target_invoice_id;

  insert into public.financial_document_items (
    document_id, item_id, position, description, detail, quantity, rate
  )
  select target_invoice_id,
         (item.value ->> 'item_id')::uuid,
         item.ordinality::integer,
         pg_catalog.btrim(item.value ->> 'description'),
         nullif(item.value ->> 'detail', ''),
         (item.value ->> 'quantity')::numeric,
         (item.value ->> 'rate')::numeric
  from pg_catalog.jsonb_array_elements(invoice_items) with ordinality as item(value, ordinality);

  perform pg_catalog.set_config('app.invoice_atomic_edit', '', true);
end
$$;

revoke all on function public.update_invoice(
  uuid, uuid, text, text, text, date, date, text, numeric, numeric, text, jsonb
) from public, anon;
grant execute on function public.update_invoice(
  uuid, uuid, text, text, text, date, date, text, numeric, numeric, text, jsonb
) to authenticated;
