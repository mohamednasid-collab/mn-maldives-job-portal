grant update on public.items to authenticated;

create policy items_admin_update on public.items
for update to authenticated
using (private.current_user_role() in ('super_admin', 'admin'))
with check (private.current_user_role() in ('super_admin', 'admin'));
