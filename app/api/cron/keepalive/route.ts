import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Ping périodique pour éviter la mise en pause automatique du projet
 * Supabase (plan gratuit) après 7 jours d'inactivité. Protégé par CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
  }

  const admin = createAdminClient()
  const { error } = await admin.from("profiles").select("id").limit(1)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() })
}
