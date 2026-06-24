import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

/** Retourne l'utilisateur authentifié, ou null. */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Exige une session : redirige vers /login sinon. */
export async function requireUser() {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}
