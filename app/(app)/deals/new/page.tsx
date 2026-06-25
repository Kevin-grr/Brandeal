import { requireUser } from "@/lib/auth"
import { getActiveLegalTemplate } from "@/lib/legal"
import { LEGAL_THRESHOLD_EUR_FALLBACK } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"
import type { Brand } from "@/types/database"
import { DealWizard } from "@/components/deal-wizard"

export const metadata = { title: "Nouveau partenariat" }

export default async function NewDealPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true })

  const legal = await getActiveLegalTemplate()
  const threshold = Number(legal?.threshold_eur ?? LEGAL_THRESHOLD_EUR_FALLBACK)
  const disclaimer = legal?.clauses.disclaimer ?? ""

  return (
    <DealWizard
      brands={(brands as Brand[]) ?? []}
      userId={user.id}
      threshold={threshold}
      disclaimer={disclaimer}
    />
  )
}
