-- =============================================================================
-- ContratCréateur — Buckets Supabase Storage (PDF générés)
-- Buckets privés. Convention de chemin : {user_id}/{...}.pdf
-- RLS : un utilisateur n'accède qu'aux objets de son propre dossier.
-- Pas de policy DELETE (cohérent avec le garde-fou de conservation).
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('contracts', 'contracts', false),
  ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- --- contracts ---------------------------------------------------------------
create policy "contracts_storage_select_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'contracts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "contracts_storage_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'contracts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "contracts_storage_update_own" on storage.objects
  for update to authenticated using (
    bucket_id = 'contracts' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- --- invoices ----------------------------------------------------------------
create policy "invoices_storage_select_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "invoices_storage_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "invoices_storage_update_own" on storage.objects
  for update to authenticated using (
    bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text
  );
