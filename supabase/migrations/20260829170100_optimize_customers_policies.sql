create index customers_created_by_idx on public.customers(created_by);

alter policy "Active users can create customers"
on public.customers
with check (
  private.is_active_user()
  and created_by = (select auth.uid())
);
