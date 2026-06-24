-- =============================================================================
-- ContratCréateur — Row Level Security
-- Principe : accès restreint au propriétaire (user_id = auth.uid()).
-- Garde-fou : pas de policy DELETE → les suppressions physiques sont bloquées
-- pour le client (seul le service role peut purger). L'app fait du soft delete.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.deals enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.legal_template_versions enable row level security;

-- --- profiles ----------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- --- brands ------------------------------------------------------------------
create policy "brands_select_own" on public.brands
  for select to authenticated using (user_id = auth.uid());
create policy "brands_insert_own" on public.brands
  for insert to authenticated with check (user_id = auth.uid());
create policy "brands_update_own" on public.brands
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --- deals -------------------------------------------------------------------
create policy "deals_select_own" on public.deals
  for select to authenticated using (user_id = auth.uid());
create policy "deals_insert_own" on public.deals
  for insert to authenticated with check (user_id = auth.uid());
create policy "deals_update_own" on public.deals
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --- contracts (propriété via le deal lié) -----------------------------------
create policy "contracts_select_own" on public.contracts
  for select to authenticated using (
    exists (select 1 from public.deals d where d.id = contracts.deal_id and d.user_id = auth.uid())
  );
create policy "contracts_insert_own" on public.contracts
  for insert to authenticated with check (
    exists (select 1 from public.deals d where d.id = contracts.deal_id and d.user_id = auth.uid())
  );
create policy "contracts_update_own" on public.contracts
  for update to authenticated using (
    exists (select 1 from public.deals d where d.id = contracts.deal_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.deals d where d.id = contracts.deal_id and d.user_id = auth.uid())
  );

-- --- invoices ----------------------------------------------------------------
create policy "invoices_select_own" on public.invoices
  for select to authenticated using (user_id = auth.uid());
create policy "invoices_insert_own" on public.invoices
  for insert to authenticated with check (user_id = auth.uid());
create policy "invoices_update_own" on public.invoices
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --- subscriptions -----------------------------------------------------------
-- Lecture + création (plan free) par le propriétaire. Les MISES À JOUR de plan
-- ne passent QUE par le webhook Stripe (service role) → un utilisateur ne peut
-- pas se passer Pro en éditant sa ligne.
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "subscriptions_insert_own" on public.subscriptions
  for insert to authenticated with check (user_id = auth.uid() and plan = 'free');

-- --- legal_template_versions (référence partagée, lecture seule côté client) --
create policy "legal_templates_read_all" on public.legal_template_versions
  for select to authenticated, anon using (true);
