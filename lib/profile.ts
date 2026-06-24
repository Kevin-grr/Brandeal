import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database"

/** Retourne le profil de l'utilisateur courant, ou null s'il n'a pas onboardé. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return data
}
