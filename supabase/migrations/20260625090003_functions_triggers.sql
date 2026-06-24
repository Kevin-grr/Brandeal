-- =============================================================================
-- ContratCréateur — Fonctions & triggers
-- =============================================================================

-- --- updated_at automatique --------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_deals_updated_at on public.deals;
create trigger trg_deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- --- Cœur de la logique de seuil légal ---------------------------------------
-- Somme (rémunération numéraire + valeur des avantages en nature) pour tous les
-- deals NON annulés et NON supprimés d'un utilisateur, avec une marque donnée,
-- sur une année donnée (basée sur start_date).
-- À utiliser PARTOUT où le seuil de 1 000 € doit être vérifié.
create or replace function public.get_brand_yearly_total(
  p_user_id uuid,
  p_brand_id uuid,
  p_year int
)
returns numeric
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    sum(coalesce(cash_amount_eur, 0) + coalesce(in_kind_value_eur, 0)),
    0
  )::numeric(10,2)
  from public.deals
  where user_id = p_user_id
    and brand_id = p_brand_id
    and deleted_at is null
    and status <> 'cancelled'
    and start_date is not null
    and extract(year from start_date) = p_year;
$$;

comment on function public.get_brand_yearly_total is
  'Total cumulé (cash + avantages en nature) par marque et par année pour un user. Exclut les deals annulés et supprimés. Base de l''alerte du seuil légal.';
