create table public.job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (job_id, item_id)
);

alter table public.job_items enable row level security;

create policy job_items_read on public.job_items
for select to authenticated
using (private.is_active_user());

create policy job_items_insert on public.job_items
for insert to authenticated
with check (private.current_user_role() in ('super_admin', 'admin', 'finance'));

create policy job_items_update on public.job_items
for update to authenticated
using (private.current_user_role() in ('super_admin', 'admin', 'finance'))
with check (private.current_user_role() in ('super_admin', 'admin', 'finance'));

create policy job_items_delete on public.job_items
for delete to authenticated
using (private.current_user_role() in ('super_admin', 'admin', 'finance'));

revoke all on public.job_items from anon;
grant select, insert, update, delete on public.job_items to authenticated;

create index job_items_item_idx on public.job_items (item_id);
create index job_items_created_by_idx on public.job_items (created_by);
