import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

/**
 * Callback d'authentification : échange le code (confirmation email ou OAuth
 * Google) contre une session, puis redirige vers `next` (défaut /dashboard).
 */
const ALLOWED_REDIRECT_PREFIXES = [
  "/dashboard",
  "/deals",
  "/brands",
  "/quotes",
  "/finances",
  "/ai",
  "/plan",
  "/onboarding",
  "/settings",
]

function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard"
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard"
  const allowed = ALLOWED_REDIRECT_PREFIXES.some((p) => raw.startsWith(p))
  return allowed ? raw : "/dashboard"
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeRedirectPath(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin))
}
