insert into public.factories (id, name, active)
values ('lanyardsrilanka', 'LANYARDSRILANKA', true)
on conflict (id) do update
set name = excluded.name,
    active = true;
