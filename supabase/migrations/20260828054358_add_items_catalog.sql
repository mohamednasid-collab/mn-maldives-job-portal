create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  rate numeric(14,2) not null check (rate >= 0),
  description text check (description is null or char_length(description) <= 2000),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Prevent duplicates even when spacing or letter case differs.
create unique index items_normalized_name_key on public.items (lower(btrim(name)));

alter table public.items enable row level security;

create policy items_read on public.items
for select to authenticated
using (private.is_active_user());

create policy items_admin_insert on public.items
for insert to authenticated
with check (private.current_user_role() in ('super_admin', 'admin'));

revoke all on public.items from anon;
grant select, insert on public.items to authenticated;
