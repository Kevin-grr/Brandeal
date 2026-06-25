import { createClient } from "@/lib/supabase/server"
import type { LegalClauses, LegalTemplateVersion } from "@/types/database"

export type ActiveLegalTemplate = LegalTemplateVersion & {
  clauses: LegalClauses
}

/** Retourne la version active du template légal, avec ses clauses typées. */
export async function getActiveLegalTemplate(): Promise<ActiveLegalTemplate | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("legal_template_versions")
    .select("*")
    .eq("is_active", true)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  return {
    ...(data as LegalTemplateVersion),
    clauses: data.mandatory_clauses as unknown as LegalClauses,
  }
}
