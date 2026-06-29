import { randomBytes } from "crypto"
import { NextResponse } from "next/server"

import { SITE_URL } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

/** Crée (ou renvoie) un lien de partage pour l'espace marque d'un deal. */
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

  // Vérifie la propriété du deal (RLS le garantit déjà côté select).
  const { data: deal } = await supabase
    .from("deals")
    .select("id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()
  if (!deal) {
    return NextResponse.json({ error: "Partenariat introuvable." }, { status: 404 })
  }

  // Réutilise un token actif s'il en existe un.
  const { data: existing } = await supabase
    .from("brand_share_tokens")
    .select("token")
    .eq("deal_id", id)
    .is("revoked_at", null)
    .maybeSingle()

  let token = existing?.token
  if (!token) {
    token = randomBytes(24).toString("base64url")
    const { error } = await supabase.from("brand_share_tokens").insert({
      user_id: user.id,
      deal_id: id,
      token,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ url: `${SITE_URL}/share/${token}`, token })
}

/** Révoque tous les liens de partage actifs d'un deal. */
export async function DELETE(
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

  const { error } = await supabase
    .from("brand_share_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("deal_id", id)
    .is("revoked_at", null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
