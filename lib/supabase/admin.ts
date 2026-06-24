import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

/**
 * Client Supabase "service role" — contourne les policies RLS.
 * À n'utiliser QUE côté serveur (webhooks Stripe, numérotation séquentielle des
 * factures dans une transaction, etc.). Ne jamais l'exposer au navigateur.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
