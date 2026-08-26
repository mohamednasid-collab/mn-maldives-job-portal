create type public.document_type as enum ('quotation', 'invoice');

create sequence public.quotation_number_seq start with 86;
create sequence public.invoice_number_seq start with 216;
create sequence public.expense_number_seq start with 1;

create table public.financial_documents (
  id uuid primary key default gen_random_uuid(),
  document_type public.document_type not null,
  document_number text not null unique,
  job_id uuid references public.jobs(id) on delete set null,
  customer_name text not null,
  customer_address text,
  subject text,
  issue_date date not null default current_date,
  due_date date,
  terms text not null default 'Due on Receipt',
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0),
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.financial_document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.financial_documents(id) on delete cascade,
  position integer not null default 1,
  description text not null,
  detail text,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  rate numeric(14,2) not null default 0 check (rate >= 0),
  unique (document_id, position)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_number text not null unique,
  expense_date date not null default current_date,
  job_id uuid references public.jobs(id) on delete set null,
  category text not null,
  vendor text,
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text,
  reference text,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.assign_financial_number()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.document_number is null or new.document_number = '' then
    if new.document_type = 'quotation' then
      new.document_number := 'MNQ-' || pg_catalog.to_char(new.issue_date, 'YY') || pg_catalog.lpad(pg_catalog.nextval('public.quotation_number_seq')::text, 4, '0');
    else
      new.document_number := 'MNINV-' || pg_catalog.to_char(new.issue_date, 'YY') || pg_catalog.lpad(pg_catalog.nextval('public.invoice_number_seq')::text, 4, '0');
    end if;
  end if;
  return new;
end $$;

create or replace function private.assign_expense_number()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.expense_number is null or new.expense_number = '' then
    new.expense_number := 'MNE-' || pg_catalog.to_char(new.expense_date, 'YY') || pg_catalog.lpad(pg_catalog.nextval('public.expense_number_seq')::text, 4, '0');
  end if;
  return new;
end $$;

create trigger assign_financial_number before insert on public.financial_documents for each row execute function private.assign_financial_number();
create trigger assign_expense_number before insert on public.expenses for each row execute function private.assign_expense_number();
create trigger financial_documents_updated_at before update on public.financial_documents for each row execute function private.set_updated_at();
create trigger expenses_updated_at before update on public.expenses for each row execute function private.set_updated_at();

alter table public.financial_documents enable row level security;
alter table public.financial_document_items enable row level security;
alter table public.expenses enable row level security;

create policy financial_documents_all_users on public.financial_documents for all to authenticated using (private.is_active_user()) with check (private.is_active_user());
create policy financial_document_items_all_users on public.financial_document_items for all to authenticated using (private.is_active_user()) with check (private.is_active_user());
create policy expenses_all_users on public.expenses for all to authenticated using (private.is_active_user()) with check (private.is_active_user());

grant select, insert, update, delete on public.financial_documents, public.financial_document_items, public.expenses to authenticated;
grant usage, select on sequence public.quotation_number_seq, public.invoice_number_seq, public.expense_number_seq to authenticated;

create index financial_documents_job_idx on public.financial_documents(job_id);
create index financial_document_items_document_idx on public.financial_document_items(document_id);
create index expenses_job_idx on public.expenses(job_id);
create index expenses_date_idx on public.expenses(expense_date desc);
