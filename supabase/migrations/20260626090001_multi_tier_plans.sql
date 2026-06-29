-- =============================================================================
-- Migration : passage à 4 plans (free / creator / studio / expert)
-- Remplace l'ancien check (free, pro) par les 4 niveaux tarifaires.
-- =============================================================================

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
    check (plan in ('free', 'creator', 'studio', 'expert'));

-- Mise à jour des lignes éventuelles en 'pro' vers 'creator' (rétrocompat).
update public.subscriptions
  set plan = 'creator'
  where plan = 'pro';
