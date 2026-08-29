alter table public.jobs
add column if not exists contact_person text,
add column if not exists cancellation_reason text;

alter table public.jobs
drop constraint if exists jobs_cancellation_reason_required;

alter table public.jobs
add constraint jobs_cancellation_reason_required
check (
  status <> 'cancelled'
  or nullif(pg_catalog.btrim(cancellation_reason), '') is not null
);
