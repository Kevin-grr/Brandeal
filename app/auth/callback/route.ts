import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

/**
 * Callback d'authentification : échange le code (confirmation email ou OAuth
 * Google) contre une session, puis redirige vers `next` (défaut /dashboard).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
