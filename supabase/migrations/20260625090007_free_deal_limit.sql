-- =============================================================================
-- ContratCréateur — Limite plan gratuit : 2 deals / mois calendaire
-- Backstop côté base (impossible à contourner depuis le client). L'UI affiche
-- en plus un modal « Passez au Pro ». La règle (2) est une règle métier.
-- =============================================================================

create or replace function public.enforce_free_deal_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_count int;
begin
  select plan into v_plan
  from public.subscriptions
  where user_id = new.user_id;

  if coalesce(v_plan, 'free') = 'free' then
    select count(*) into v_count
    from public.deals
    where user_id = new.user_id
      and deleted_at is null
      and date_trunc('month', created_at) = date_trunc('month', now());

    if v_count >= 2 then
      raise exception 'FREE_DEAL_LIMIT'
        using errcode = 'P0001',
              hint = 'Passez au plan Pro pour des partenariats illimités.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_free_deal_limit on public.deals;
create trigger trg_enforce_free_deal_limit
  before insert on public.deals
  for each row execute function public.enforce_free_deal_limit();
