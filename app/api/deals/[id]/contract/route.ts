import { NextResponse } from "next/server"

import { STORAGE_BUCKETS } from "@/lib/config"
import { getActiveLegalTemplate } from "@/lib/legal"
import { generateContractPdf } from "@/lib/pdf/generateContract"
import { createClient } from "@/lib/supabase/server"
import type { Brand, Deal, Plan, Profile } from "@/types/database"

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

  const [{ data: brand }, { data: profile }, legal] = await Promise.all([
    supabase
      .from("brands")
      .select("*")
      .eq("id", deal.brand_id)
      .maybeSingle<Brand>(),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>(),
    getActiveLegalTemplate(),
  ])
  if (!brand || !profile || !legal) {
    return NextResponse.json(
      { error: "Données manquantes (marque, profil ou template légal)." },
      { status: 400 }
    )
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle()
  const plan: Plan = (sub?.plan as Plan) ?? "free"

  // Numéro de version = nb de contrats déjà générés pour ce deal + 1.
  const { count } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", deal.id)
  const version = (count ?? 0) + 1
  const docRef = `${deal.id.slice(0, 8).toUpperCase()}-v${version}`

  let buffer: Buffer
  try {
    buffer = await generateContractPdf({
      deal,
      brand,
      profile,
      legal,
      plan,
      docRef,
      generatedAt: new Date(),
    })
  } catch (e) {
    return NextResponse.json(
      { error: `Échec de génération du PDF : ${(e as Error).message}` },
      { status: 500 }
    )
  }

  const path = `${user.id}/${deal.id}/v${version}.pdf`
  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKETS.contracts)
    .upload(path, buffer, { contentType: "application/pdf", upsert: true })
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const { error: insErr } = await supabase.from("contracts").insert({
    deal_id: deal.id,
    legal_template_version_id: legal.id,
    pdf_storage_path: path,
  })
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, version })
}
