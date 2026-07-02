import { NextResponse } from "next/server"

import { STORAGE_BUCKETS } from "@/lib/config"
import { generateQuotePdf } from "@/lib/pdf/generateQuote"
import { createClient } from "@/lib/supabase/server"
import type { Brand, Plan, Profile, Quote } from "@/types/database"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    brand_id?: string
    label?: string
    amount_ht?: number
    valid_until?: string
    notes?: string
  }
  if (!body.brand_id || !body.label || body.amount_ht == null) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 })
  }

  // Vérifier que la marque appartient bien à cet utilisateur avant toute création.
  const { data: ownedBrand } = await supabase
    .from("brands")
    .select("id")
    .eq("id", body.brand_id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!ownedBrand) {
    return NextResponse.json({ error: "Marque introuvable." }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>()
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 400 })
  }

  const isFranchise = !profile.is_vat_applicable
  const rate = isFranchise ? 0 : 20
  const vatMention = isFranchise
    ? "TVA non applicable, article 293 B du CGI"
    : `TVA ${rate}%`

  // Numérotation séquentielle atomique (verrou Postgres).
  const { data: quoteRow, error: rpcErr } = await supabase.rpc("create_quote", {
    p_brand_id: body.brand_id,
    p_deal_id: null as unknown as string,
    p_amount_ht: body.amount_ht,
    p_vat_rate: rate,
    p_vat_mention: vatMention,
    p_valid_until: (body.valid_until || null) as unknown as string,
    p_notes: (body.notes || null) as unknown as string,
  })
  if (rpcErr || !quoteRow) {
    return NextResponse.json(
      { error: rpcErr?.message ?? "Création du devis impossible." },
      { status: 500 }
    )
  }
  const quote = quoteRow as Quote

  const [{ data: brand }, { data: sub }] = await Promise.all([
    supabase
      .from("brands")
      .select("*")
      .eq("id", body.brand_id)
      .maybeSingle<Brand>(),
    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])
  const plan: Plan = (sub?.plan as Plan) ?? "free"

  let buffer: Buffer
  try {
    buffer = await generateQuotePdf({
      quote,
      brand: brand ?? null,
      profile,
      label: body.label,
      plan,
    })
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de génération du PDF : ${(e as Error).message}` },
      { status: 500 }
    )
  }

  const path = `${user.id}/${quote.id}.pdf`
  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.quotes)
    .upload(path, buffer, { contentType: "application/pdf", upsert: true })
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  await supabase
    .from("quotes")
    .update({ pdf_storage_path: path })
    .eq("id", quote.id)

  return NextResponse.json({ ok: true, quoteNumber: quote.quote_number })
}
