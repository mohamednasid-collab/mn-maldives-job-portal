create sequence public.item_code_seq start with 7;

grant usage, select on sequence public.item_code_seq to authenticated;

create or replace function private.assign_item_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.code is null or pg_catalog.btrim(new.code) = '' then
    new.code := pg_catalog.lpad(
      pg_catalog.nextval('public.item_code_seq')::text,
      3,
      '0'
    );
  end if;
  return new;
end
$$;

create or replace function private.prevent_item_code_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.code is distinct from old.code then
    raise exception 'Item code cannot be changed';
  end if;
  return new;
end
$$;

create trigger assign_item_code
before insert on public.items
for each row execute function private.assign_item_code();

create trigger prevent_item_code_change
before update on public.items
for each row execute function private.prevent_item_code_change();
