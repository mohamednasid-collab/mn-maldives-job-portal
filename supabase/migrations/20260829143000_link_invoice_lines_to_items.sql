alter table public.financial_document_items
add column if not exists item_id uuid references public.items(id) on delete restrict;

create index if not exists financial_document_items_item_idx
on public.financial_document_items (item_id);

update public.financial_document_items document_item
set item_id = item.id
from public.items item
where document_item.item_id is null
  and pg_catalog.btrim(pg_catalog.split_part(document_item.description, ' - ', 1)) = item.code;

create or replace function private.link_financial_document_catalog_item()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  catalog_code text;
  catalog_name text;
begin
  if new.item_id is null then
    select item.id into new.item_id
    from public.items item
    where item.code = pg_catalog.btrim(pg_catalog.split_part(new.description, ' - ', 1))
    limit 1;
  end if;

  if new.item_id is not null then
    select item.code, item.name into catalog_code, catalog_name
    from public.items item
    where item.id = new.item_id;

    if not found then
      raise exception 'Select an item from the Items database';
    end if;

    new.description := catalog_code || ' - ' || catalog_name;
  end if;

  return new;
end
$$;

drop trigger if exists link_financial_document_catalog_item
on public.financial_document_items;

create trigger link_financial_document_catalog_item
before insert or update of item_id, description
on public.financial_document_items
for each row execute function private.link_financial_document_catalog_item();
