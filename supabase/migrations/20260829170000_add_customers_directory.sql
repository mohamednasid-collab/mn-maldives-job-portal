create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  phone text,
  email text,
  contact_person text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index customers_normalized_name_key
  on public.customers (lower(btrim(name)));

create trigger customers_set_updated_at
before update on public.customers
for each row execute function private.set_updated_at();

alter table public.customers enable row level security;

revoke all on public.customers from anon, authenticated;
grant select, insert, update on public.customers to authenticated;

create policy "Active users can view customers"
on public.customers for select to authenticated
using (private.is_active_user());

create policy "Active users can create customers"
on public.customers for insert to authenticated
with check (private.is_active_user() and created_by = auth.uid());

create policy "Active users can update customers"
on public.customers for update to authenticated
using (private.is_active_user())
with check (private.is_active_user());

alter table public.jobs
  add column customer_id uuid references public.customers(id) on delete restrict;

create index jobs_customer_id_idx on public.jobs(customer_id);

insert into public.customers (name, phone, email, contact_person, created_by)
select source.customer_name,
       source.customer_phone,
       source.customer_email,
       source.contact_person,
       source.owner_id
from (
  select distinct on (lower(btrim(j.customer_name)))
    btrim(j.customer_name) as customer_name,
    nullif(btrim(j.customer_phone), '') as customer_phone,
    nullif(btrim(j.customer_email), '') as customer_email,
    nullif(btrim(j.contact_person), '') as contact_person,
    j.owner_id
  from public.jobs j
  where btrim(j.customer_name) <> ''
  order by lower(btrim(j.customer_name)), j.updated_at desc
) source
on conflict do nothing;

update public.jobs j
set customer_id = c.id
from public.customers c
where j.customer_id is null
  and lower(btrim(j.customer_name)) = lower(btrim(c.name));
