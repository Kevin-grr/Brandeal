import { NextResponse } from "next/server"

import { STORAGE_BUCKETS } from "@/lib/config"
import { getActiveLegalTemplate } from "@/lib/legal"
import { generateInvoicePdf } from "@/lib/pdf/generateInvoice"
import { createClient } from "@/lib/supabase/server"
import type { Brand, Deal, Invoice, Plan, Profile } from "@/types/database"

export const runtime = "nodejs"

export async function POST(
  _req: Request,
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

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Deal>()
  if (!deal) {
    return NextResponse.json(
      { error: "Partenariat introuvable." },
      { status: 404 }
    )
  }

  if (deal.status !== "signed" && deal.status !== "paid") {
    return NextResponse.json(
      { error: "La facture n'est disponible qu'à partir du statut « Signé »." },
      { status: 400 }
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>()
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 400 })
  }
  if (!profile.siret) {
    return NextResponse.json(
      {
        error:
          "Votre SIRET est requis pour générer une facture. Complétez-le dans vos paramètres.",
        code: "NO_SIRET",
      },
      { status: 400 }
    )
  }

  const [{ data: brand }, legal] = await Promise.all([
    supabase
      .from("brands")
      .select("*")
      .eq("id", deal.brand_id)
      .maybeSingle<Brand>(),
    getActiveLegalTemplate(),
  ])
  if (!legal) {
    return NextResponse.json(
      { error: "Template légal introuvable." },
      { status: 400 }
    )
  }

  const isFranchise = !profile.is_vat_applicable
  const rate = isFranchise ? 0 : 20
  const vatMention = isFranchise
    ? legal.clauses.invoice.vat_franchise_mention
    : `TVA ${rate}%`
  const amountHt = Number(deal.cash_amount_eur ?? 0)

  // Numérotation séquentielle atomique (verrou transactionnel côté Postgres).
  const { data: invoice, error: rpcErr } = await supabase.rpc(
    "create_invoice",
    {
      p_deal_id: deal.id,
      p_amount_ht: amountHt,
      p_vat_rate: rate,
      p_vat_mention: vatMention,
    }
  )
  if (rpcErr || !invoice) {
    return NextResponse.json(
      { error: rpcErr?.message ?? "Création de la facture impossible." },
      { status: 500 }
    )
  }
  const inv = invoice as Invoice

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle()
  const plan: Plan = (sub?.plan as Plan) ?? "free"

  let buffer: Buffer
  try {
    buffer = await generateInvoicePdf({
      invoice: inv,
      deal,
      brand: brand ?? null,
      profile,
      legal,
      plan,
    })
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de génération du PDF : ${(e as Error).message}` },
      { status: 500 }
    )
  }

  const path = `${user.id}/${inv.id}.pdf`
  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.invoices)
    .upload(path, buffer, { contentType: "application/pdf", upsert: true })
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const { error: updErr } = await supabase
    .from("invoices")
    .update({ pdf_storage_path: path })
    .eq("id", inv.id)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, invoiceNumber: inv.invoice_number })
}
