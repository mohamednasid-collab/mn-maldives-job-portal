create or replace function private.prevent_converted_quotation_edit()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.document_type = 'quotation' and exists (
    select 1 from public.financial_documents
    where source_quotation_id = old.id
  ) then
    raise exception 'A converted quotation cannot be edited';
  end if;
  return new;
end $$;

create or replace function private.prevent_converted_quotation_item_edit()
returns trigger language plpgsql set search_path = '' as $$
declare target_document_id uuid;
begin
  target_document_id := case when tg_op = 'DELETE' then old.document_id else new.document_id end;
  if exists (
    select 1
    from public.financial_documents quotation
    where quotation.id = target_document_id
      and quotation.document_type = 'quotation'
      and exists (
        select 1 from public.financial_documents invoice
        where invoice.source_quotation_id = quotation.id
      )
  ) then
    raise exception 'Items on a converted quotation cannot be edited';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;

create trigger prevent_converted_quotation_edit
before update on public.financial_documents
for each row execute function private.prevent_converted_quotation_edit();

create trigger prevent_converted_quotation_item_edit
before insert or update or delete on public.financial_document_items
for each row execute function private.prevent_converted_quotation_item_edit();
