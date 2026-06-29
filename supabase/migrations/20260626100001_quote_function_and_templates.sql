-- =============================================================================
-- Brandeal — Numérotation des devis + seed bibliothèque de modèles
-- =============================================================================

-- --- Numérotation séquentielle des devis (même principe que les factures) ----
create or replace function public.create_quote(
  p_brand_id uuid,
  p_deal_id uuid,
  p_amount_ht numeric,
  p_vat_rate numeric,
  p_vat_mention text,
  p_valid_until date,
  p_notes text
)
returns public.quotes
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_year int := extract(year from current_date)::int;
  v_seq int;
  v_number text;
  v_row public.quotes;
begin
  if v_user is null then
    raise exception 'Non authentifié';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_user::text || ':quote'));

  select coalesce(
    max((regexp_replace(quote_number, '^DEV-' || v_year || '-', ''))::int),
    0
  ) + 1
  into v_seq
  from public.quotes
  where user_id = v_user
    and quote_number like 'DEV-' || v_year || '-%';

  v_number := 'DEV-' || v_year || '-' || lpad(v_seq::text, 4, '0');

  insert into public.quotes (
    user_id, brand_id, deal_id, quote_number, amount_ht, vat_rate,
    vat_mention, valid_until, notes, status
  )
  values (
    v_user, p_brand_id, p_deal_id, v_number, p_amount_ht, coalesce(p_vat_rate, 0),
    p_vat_mention, p_valid_until, p_notes, 'draft'
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_quote(uuid, uuid, numeric, numeric, text, date, text)
  to authenticated;

comment on function public.create_quote is
  'Crée un devis avec un numéro séquentiel continu par utilisateur. Format DEV-{année}-{0000}.';

-- --- Seed : bibliothèque de modèles de contrats ------------------------------
insert into public.contract_templates (kind, name, description, icon, defaults, sort_order)
values
  (
    'partnership',
    'Partenariat simple',
    'Collaboration ponctuelle : la marque rémunère un ou plusieurs contenus sponsorisés.',
    'handshake',
    '{"exclusivity": false, "ip_rights_duration": "12 mois"}'::jsonb,
    1
  ),
  (
    'ugc',
    'UGC (User Generated Content)',
    'Création de contenu cédé à la marque pour ses propres canaux, sans diffusion sur votre compte.',
    'video',
    '{"exclusivity": false, "ip_rights_duration": "Durée déterminée", "content_type": "UGC"}'::jsonb,
    2
  ),
  (
    'affiliation',
    'Affiliation',
    'Rémunération à la performance (code promo, lien tracké, commission sur ventes).',
    'percent',
    '{"exclusivity": false, "ip_rights_duration": "Le temps de la campagne"}'::jsonb,
    3
  ),
  (
    'ambassador',
    'Ambassadeur de marque',
    'Engagement sur la durée : plusieurs contenus, présence régulière, souvent avec exclusivité.',
    'star',
    '{"exclusivity": true, "exclusivity_details": "Secteur concurrent de la marque", "ip_rights_duration": "Durée du contrat + 6 mois"}'::jsonb,
    4
  ),
  (
    'exclusivity',
    'Exclusivité',
    'Vous vous engagez à ne pas collaborer avec des marques concurrentes pendant une période définie.',
    'lock',
    '{"exclusivity": true, "exclusivity_details": "Marques concurrentes du même secteur", "ip_rights_duration": "12 mois"}'::jsonb,
    5
  ),
  (
    'event',
    'Événement',
    'Présence à un événement, couverture live, story ou reportage en échange d''une rémunération.',
    'calendar',
    '{"exclusivity": false, "ip_rights_duration": "6 mois", "content_type": "Story / Live"}'::jsonb,
    6
  ),
  (
    'licensing',
    'Cession de droits',
    'Cession étendue des droits d''exploitation de vos contenus à la marque (réutilisation publicitaire).',
    'scroll',
    '{"exclusivity": false, "ip_rights_duration": "À négocier — cession étendue"}'::jsonb,
    7
  )
on conflict (kind) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  defaults = excluded.defaults,
  sort_order = excluded.sort_order;
