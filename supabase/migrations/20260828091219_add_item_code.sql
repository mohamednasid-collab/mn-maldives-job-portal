alter table public.items
add column code text not null
check (char_length(btrim(code)) between 1 and 50);

-- Item codes must remain unique regardless of spacing or letter case.
create unique index items_normalized_code_key
on public.items (lower(btrim(code)));
