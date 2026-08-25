create extension if not exists pgcrypto;
create schema if not exists private;
grant usage on schema private to authenticated;

create type public.app_role as enum ('super_admin', 'admin', 'finance', 'staff');
create type public.job_status as enum ('initial', 'design', 'production', 'shipped', 'delivered', 'unpaid', 'completed');
create type public.payment_status as enum ('unpaid', 'part_paid', 'paid');
create type public.task_status as enum ('todo', 'in_progress', 'done');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null unique,
  role public.app_role not null default 'staff',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.factories (
  id text primary key check (id = lower(id)),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence public.job_number_seq start with 1000;

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 160),
  customer_phone text,
  description text not null check (char_length(description) between 2 and 2000),
  status public.job_status not null default 'initial',
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  designer_name text,
  factory_id text references public.factories(id) on delete set null,
  next_task text,
  quotation_number text unique,
  invoice_number text unique,
  invoice_total numeric(12,2) not null default 0 check (invoice_total >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  payment_status public.payment_status not null default 'unpaid',
  due_date date,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_paid <= invoice_total)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 300),
  assigned_to uuid references public.profiles(id) on delete set null,
  status public.task_status not null default 'todo',
  due_date date,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_activity (
  id bigint generated always as identity primary key,
  job_id uuid not null references public.jobs(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  action text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  kind text not null check (kind in ('artwork','quotation','invoice','delivery','other')),
  uploaded_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

insert into public.factories (id, name) values
  ('swift','SWIFT'), ('dayout','DAYOUT'), ('inuk','INUK'), ('captain','CAPTAIN'), ('inc9000','INC9000');

create or replace function private.current_user_role()
returns public.app_role language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) and active = true $$;
create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.profiles where id = (select auth.uid()) and active = true) $$;
revoke all on function private.current_user_role() from public, anon;
revoke all on function private.is_active_user() from public, anon;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_active_user() to authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), split_part(new.email,'@',1)), new.email);
  return new;
end $$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger jobs_updated_at before update on public.jobs for each row execute function private.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function private.set_updated_at();

create or replace function private.assign_job_number()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.job_number is null or new.job_number = '' then
    new.job_number := 'MN-' || extract(year from current_date)::text || '-' || lpad(nextval('public.job_number_seq')::text, 4, '0');
  end if;
  return new;
end $$;
create trigger assign_job_number before insert on public.jobs for each row execute function private.assign_job_number();

create or replace function private.enforce_job_rules()
returns trigger language plpgsql set search_path = '' as $$
declare user_role public.app_role;
begin
  if tg_op = 'INSERT' and (select auth.uid()) is not null then
    user_role := private.current_user_role();
    if user_role = 'admin' and (
      new.quotation_number is not null or new.invoice_number is not null or new.invoice_total <> 0 or
      new.amount_paid <> 0 or new.due_date is not null
    ) then raise exception 'Administrators may not create finance records'; end if;
  end if;

  if new.amount_paid = new.invoice_total and new.invoice_total > 0 then new.payment_status := 'paid';
  elsif new.amount_paid > 0 then new.payment_status := 'part_paid';
  else new.payment_status := 'unpaid'; end if;

  if new.status = 'delivered' then
    if new.payment_status = 'paid' then new.status := 'completed'; else new.status := 'unpaid'; end if;
  elsif new.status = 'completed' and new.payment_status <> 'paid' then
    raise exception 'A job cannot be completed until fully paid';
  end if;

  if tg_op = 'UPDATE' and (select auth.uid()) is not null then
    user_role := private.current_user_role();
    if user_role = 'finance' and (
      new.customer_name is distinct from old.customer_name or new.customer_phone is distinct from old.customer_phone or
      new.description is distinct from old.description or new.assigned_admin_id is distinct from old.assigned_admin_id or
      new.designer_name is distinct from old.designer_name or new.factory_id is distinct from old.factory_id or
      new.next_task is distinct from old.next_task
    ) then raise exception 'Finance users may only change finance, notes, and workflow fields'; end if;
    if user_role = 'admin' and (
      new.quotation_number is distinct from old.quotation_number or new.invoice_number is distinct from old.invoice_number or
      new.invoice_total is distinct from old.invoice_total or new.amount_paid is distinct from old.amount_paid or
      new.due_date is distinct from old.due_date
    ) then raise exception 'Administrators may not change finance fields'; end if;
  end if;
  return new;
end $$;
create trigger enforce_job_rules before insert or update on public.jobs for each row execute function private.enforce_job_rules();

create or replace function private.enforce_task_rules()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and private.current_user_role() = 'staff' and (
    new.job_id is distinct from old.job_id or new.title is distinct from old.title or
    new.assigned_to is distinct from old.assigned_to or new.due_date is distinct from old.due_date
  ) then raise exception 'Staff users may only update the status of their assigned tasks'; end if;
  return new;
end $$;
create trigger enforce_task_rules before update on public.tasks for each row execute function private.enforce_task_rules();

create or replace function private.log_job_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.job_activity(job_id, changed_by, action, changes)
  values (coalesce(new.id,old.id), (select auth.uid()), lower(tg_op),
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) - 'notes' end);
  return coalesce(new,old);
end $$;
revoke all on function private.log_job_activity() from public, anon, authenticated;
create trigger log_job_activity after insert or update or delete on public.jobs for each row execute function private.log_job_activity();

alter table public.profiles enable row level security;
alter table public.factories enable row level security;
alter table public.jobs enable row level security;
alter table public.tasks enable row level security;
alter table public.job_activity enable row level security;
alter table public.attachments enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (private.is_active_user());
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid()) and active) with check (id = (select auth.uid()) and active);
create policy factories_read on public.factories for select to authenticated using (private.is_active_user());
create policy factories_admin_write on public.factories for all to authenticated using (private.current_user_role() = 'super_admin') with check (private.current_user_role() = 'super_admin');
create policy jobs_read on public.jobs for select to authenticated using (private.is_active_user());
create policy jobs_insert on public.jobs for insert to authenticated with check (private.current_user_role() in ('super_admin','admin'));
create policy jobs_update on public.jobs for update to authenticated using (private.current_user_role() in ('super_admin','admin','finance')) with check (private.current_user_role() in ('super_admin','admin','finance'));
create policy jobs_delete on public.jobs for delete to authenticated using (private.current_user_role() = 'super_admin');
create policy tasks_read on public.tasks for select to authenticated using (private.is_active_user());
create policy tasks_insert on public.tasks for insert to authenticated with check (private.current_user_role() in ('super_admin','admin'));
create policy tasks_update on public.tasks for update to authenticated using (private.current_user_role() in ('super_admin','admin') or assigned_to = (select auth.uid())) with check (private.current_user_role() in ('super_admin','admin') or assigned_to = (select auth.uid()));
create policy tasks_delete on public.tasks for delete to authenticated using (private.current_user_role() in ('super_admin','admin'));
create policy activity_read on public.job_activity for select to authenticated using (private.is_active_user());
create policy attachments_read on public.attachments for select to authenticated using (private.is_active_user());
create policy attachments_insert on public.attachments for insert to authenticated with check (private.is_active_user() and uploaded_by = (select auth.uid()));
create policy attachments_delete on public.attachments for delete to authenticated using (private.current_user_role() in ('super_admin','admin'));

revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select on public.profiles, public.factories, public.jobs, public.tasks, public.job_activity, public.attachments to authenticated;
grant insert on public.jobs, public.tasks, public.attachments to authenticated;
grant update on public.jobs, public.tasks to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant delete on public.jobs, public.tasks, public.attachments to authenticated;
grant usage, select on sequence public.job_number_seq to authenticated;

insert into storage.buckets (id, name, public) values ('job-files','job-files',false) on conflict (id) do nothing;
create policy job_files_read on storage.objects for select to authenticated using (bucket_id = 'job-files' and private.is_active_user());
create policy job_files_insert on storage.objects for insert to authenticated with check (bucket_id = 'job-files' and private.is_active_user());
create policy job_files_update on storage.objects for update to authenticated using (bucket_id = 'job-files' and owner_id = (select auth.uid()::text)) with check (bucket_id = 'job-files' and owner_id = (select auth.uid()::text));
create policy job_files_delete on storage.objects for delete to authenticated using (bucket_id = 'job-files' and private.current_user_role() in ('super_admin','admin'));

create index jobs_status_idx on public.jobs(status);
create index jobs_assigned_admin_idx on public.jobs(assigned_admin_id);
create index jobs_created_at_idx on public.jobs(created_at desc);
create index tasks_job_idx on public.tasks(job_id);
create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index activity_job_idx on public.job_activity(job_id, created_at desc);
