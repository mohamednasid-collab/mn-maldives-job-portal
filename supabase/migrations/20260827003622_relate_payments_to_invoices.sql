create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.financial_documents(id) on delete restrict,
  payment_date date not null default current_date,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text,
  reference text,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.validate_invoice_payment()
returns trigger language plpgsql set search_path = '' as $$
declare
  invoice_type public.document_type;
  invoice_total numeric(14,2);
  existing_total numeric(14,2);
begin
  perform 1 from public.financial_documents where id = new.invoice_id for update;

  select document_type,
         coalesce(sum(item.quantity * item.rate), 0) * (1 - document.discount_percent / 100)
    into invoice_type, invoice_total
    from public.financial_documents document
    left join public.financial_document_items item on item.document_id = document.id
   where document.id = new.invoice_id
   group by document.id;

  if invoice_type is distinct from 'invoice'::public.document_type then
    raise exception 'Payments must be linked to an invoice';
  end if;

  select coalesce(sum(amount), 0) into existing_total
    from public.payments
   where invoice_id = new.invoice_id and id is distinct from new.id;

  if existing_total + new.amount > invoice_total then
    raise exception 'Payment exceeds the invoice balance';
  end if;
  return new;
end $$;

create or replace function private.sync_invoice_payments()
returns trigger language plpgsql set search_path = '' as $$
begin
  update public.financial_documents
     set amount_paid = (select coalesce(sum(amount), 0) from public.payments where invoice_id = coalesce(new.invoice_id, old.invoice_id))
   where id = coalesce(new.invoice_id, old.invoice_id);

  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    update public.financial_documents
       set amount_paid = (select coalesce(sum(amount), 0) from public.payments where invoice_id = old.invoice_id)
     where id = old.invoice_id;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

create trigger validate_invoice_payment
before insert or update on public.payments
for each row execute function private.validate_invoice_payment();

create trigger sync_invoice_payments
after insert or update or delete on public.payments
for each row execute function private.sync_invoice_payments();

create trigger payments_updated_at
before update on public.payments
for each row execute function private.set_updated_at();

alter table public.payments enable row level security;
revoke all on table public.payments from anon, authenticated;
grant select, insert, update, delete on table public.payments to authenticated;

create policy payments_select_active on public.payments for select to authenticated using (private.is_active_user());
create policy payments_insert_active on public.payments for insert to authenticated with check (private.is_active_user());
create policy payments_update_active on public.payments for update to authenticated using (private.is_active_user()) with check (private.is_active_user());
create policy payments_delete_active on public.payments for delete to authenticated using (private.is_active_user());

create index payments_invoice_idx on public.payments(invoice_id);
create index payments_date_idx on public.payments(payment_date desc);
create index payments_created_by_idx on public.payments(created_by);

insert into public.payments (invoice_id, payment_date, amount, payment_method, notes, created_by)
select document.id, document.issue_date, document.amount_paid, 'Legacy entry',
       'Imported from the previous invoice payment field', document.created_by
  from public.financial_documents document
 where document.document_type = 'invoice'
   and document.amount_paid > 0
   and not exists (select 1 from public.payments payment where payment.invoice_id = document.id);
