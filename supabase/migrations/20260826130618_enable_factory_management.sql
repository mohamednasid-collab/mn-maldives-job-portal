-- RLS already restricts factory writes to active super administrators.
-- Grant the underlying table privileges required by the Data API.
grant insert, update on public.factories to authenticated;
