-- =============================================================================
-- ContratCréateur — Numérotation séquentielle des factures (sans trou)
-- La fonction sérialise la génération du numéro PAR UTILISATEUR via un verrou
-- transactionnel (pg_advisory_xact_lock), puis insère la facture dans la même
-- transaction → pas de race condition, séquence continue.
-- Format : FACT-{année}-{séquence sur 4 chiffres}.
-- =============================================================================

create or replace function public.create_invoice(
  p_deal_id uuid,
  p_amount_ht numeric,
  p_vat_rate numeric,
  p_vat_mention text
)
returns public.invoices
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_year int := extract(year from current_date)::int;
  v_seq int;
  v_number text;
  v_row public.invoices;
begin
  if v_user is null then
    raise exception 'Non authentifié';
  end if;

  -- Verrou transactionnel par utilisateur : sérialise les générations
  -- concurrentes pour ce même user (libéré en fin de transaction).
  perform pg_advisory_xact_lock(hashtext(v_user::text || ':invoice'));

  -- Prochaine séquence pour l'année en cours (max existant + 1).
  select coalesce(
    max((regexp_replace(invoice_number, '^FACT-' || v_year || '-', ''))::int),
    0
  ) + 1
  into v_seq
  from public.invoices
  where user_id = v_user
    and invoice_number like 'FACT-' || v_year || '-%';

  v_number := 'FACT-' || v_year || '-' || lpad(v_seq::text, 4, '0');

  insert into public.invoices (
    user_id, deal_id, invoice_number, amount_ht, vat_rate, vat_mention, status
  )
  values (
    v_user, p_deal_id, v_number, p_amount_ht, coalesce(p_vat_rate, 0),
    p_vat_mention, 'draft'
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_invoice(uuid, numeric, numeric, text)
  to authenticated;

comment on function public.create_invoice is
  'Crée une facture avec un numéro séquentiel continu par utilisateur (verrou transactionnel anti-race). Format FACT-{année}-{0000}.';
