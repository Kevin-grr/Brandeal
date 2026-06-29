import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import type { Deal, Quote } from "@/types/database"

export const runtime = "nodejs"

/**
 * Marque un devis comme accepté et le transforme en partenariat (deal)
 * pré-rempli — sans ressaisie. Renvoie l'id du deal créé pour rediriger vers
 * la génération de contrat puis de facture.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Quote>()
  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable." }, { status: 404 })
  }

  // Si un deal est déjà lié, on le réutilise.
  let dealId = quote.deal_id

  if (!dealId && quote.brand_id) {
    const { data: deal, error } = await supabase
      .from("deals")
      .insert({
        user_id: user.id,
        brand_id: quote.brand_id,
        title: `Partenariat — devis ${quote.quote_number}`,
        status: "draft",
        mission_description:
          quote.notes || `Prestation issue du devis ${quote.quote_number}.`,
        platforms: [],
        deliverables_count: 1,
        cash_amount_eur: quote.amount_ht,
        in_kind_value_eur: 0,
        ip_rights_duration: "12 mois",
        french_law_applicable: true,
      })
      .select()
      .single<Deal>()
    if (error || !deal) {
      return NextResponse.json(
        { error: error?.message ?? "Création du partenariat impossible." },
        { status: 500 }
      )
    }
    dealId = deal.id
  }

  await supabase
    .from("quotes")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      deal_id: dealId,
    })
    .eq("id", quote.id)

  return NextResponse.json({ ok: true, dealId })
}
