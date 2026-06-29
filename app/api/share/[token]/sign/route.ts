import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { resolveShareToken } from "@/lib/share-access"

export const runtime = "nodejs"

/**
 * Enregistre la signature de la marque (annonceur) depuis l'espace public.
 * Passe par le service role (la marque n'a pas de compte). On ne stocke que la
 * preuve de signature — aucune donnée bancaire.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const ctx = await resolveShareToken(token)
  if (!ctx) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 404 })
  }
  if (!ctx.contract) {
    return NextResponse.json(
      { error: "Aucun contrat à signer pour ce partenariat." },
      { status: 400 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as {
    signerName?: string
    signerEmail?: string
    signatureData?: string
  }
  if (!body.signerName || !body.signatureData) {
    return NextResponse.json(
      { error: "Nom et signature requis." },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

  // Évite les doublons : une signature annonceur par contrat.
  const already = ctx.signatures.find((s) => s.signer_role === "advertiser")
  if (already) {
    return NextResponse.json({ error: "Contrat déjà signé." }, { status: 409 })
  }

  const { error } = await admin.from("contract_signatures").insert({
    contract_id: ctx.contract.id,
    deal_id: ctx.deal.id,
    signer_role: "advertiser",
    signer_name: body.signerName,
    signer_email: body.signerEmail ?? null,
    signature_data: body.signatureData,
    provider: "native",
    signed_ip: ip,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Marque le deal comme signé.
  await admin
    .from("deals")
    .update({ status: "signed", signed_at: new Date().toISOString() })
    .eq("id", ctx.deal.id)

  return NextResponse.json({ ok: true })
}
