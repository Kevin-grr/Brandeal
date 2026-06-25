import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Brand } from "@/types/database"
import { BrandsManager } from "@/components/brands-manager"

export const metadata = { title: "Marques" }

export default async function BrandsPage() {
  await requireUser()
  const supabase = await createClient()
  const { data } = await supabase
    .from("brands")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  return <BrandsManager brands={(data as Brand[]) ?? []} />
}
