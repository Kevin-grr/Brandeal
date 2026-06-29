import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  Brand,
  Contract,
  ContractSignature,
  Deal,
  Profile,
} from "@/types/database"

export interface ShareContext {
  token: string
  deal: Deal
  brand: Brand | null
  creator: Profile | null
  contract: Contract | null
  signatures: ContractSignature[]
}

/**
 * Résout un token de partage côté serveur (service role). Renvoie null si le
 * token est inconnu, révoqué ou expiré. Ne renvoie QUE les données nécessaires
 * à l'espace marque — jamais de données sensibles non liées au deal.
 */
export async function resolveShareToken(
  token: string
): Promise<ShareContext | null> {
  const admin = createAdminClient()

  const { data: tok } = await admin
    .from("brand_share_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle()

  if (!tok || tok.revoked_at) return null
  if (tok.expires_at && new Date(tok.expires_at) < new Date()) return null

  const { data: deal } = await admin
    .from("deals")
    .select("*")
    .eq("id", tok.deal_id)
    .is("deleted_at", null)
    .maybeSingle<Deal>()
  if (!deal) return null

  const [{ data: brand }, { data: creator }, { data: contract }] =
    await Promise.all([
      admin.from("brands").select("*").eq("id", deal.brand_id).maybeSingle<Brand>(),
      admin
        .from("profiles")
        .select("*")
        .eq("id", deal.user_id)
        .maybeSingle<Profile>(),
      admin
        .from("contracts")
        .select("*")
        .eq("deal_id", deal.id)
        .is("deleted_at", null)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle<Contract>(),
    ])

  const { data: signatures } = await admin
    .from("contract_signatures")
    .select("*")
    .eq("deal_id", deal.id)

  // Trace la consultation (sans bloquer en cas d'erreur).
  await admin
    .from("brand_share_tokens")
    .update({ last_viewed_at: new Date().toISOString() })
    .eq("token", token)

  return {
    token,
    deal,
    brand: brand ?? null,
    creator: creator ?? null,
    contract: contract ?? null,
    signatures: (signatures as ContractSignature[]) ?? [],
  }
}
