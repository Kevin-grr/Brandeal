-- =============================================================================
-- Brandeal — Bucket Storage pour les devis (PDF générés)
-- Même convention que contracts/invoices : bucket privé, {user_id}/{...}.pdf
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('quotes', 'quotes', false)
on conflict (id) do nothing;

create policy "quotes_storage_select_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'quotes' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "quotes_storage_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'quotes' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "quotes_storage_update_own" on storage.objects
  for update to authenticated using (
    bucket_id = 'quotes' and (storage.foldername(name))[1] = auth.uid()::text
  );
