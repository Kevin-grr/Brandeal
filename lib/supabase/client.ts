import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database"

/**
 * Client Supabase côté navigateur (composants client).
 * Utilise la clé anon publique — protégé par les policies RLS.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
