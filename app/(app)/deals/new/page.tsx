import { requireUser } from "@/lib/auth"
import { getActiveLegalTemplate } from "@/lib/legal"
import {
  FREE_DEALS_PER_MONTH,
  LEGAL_THRESHOLD_EUR_FALLBACK,
} from "@/lib/config"
import { createClient } from "@/lib/supabase/server"
import type { Brand } from "@/types/database"
import { DealWizard } from "@/components/deal-wizard"

export const metadata = { title: "Nouveau partenariat" }

export default async function NewDealPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString()

  const [{ data: brands }, { data: sub }, { count }, legal] = await Promise.all(
    [
      supabase
        .from("brands")
        .select("*")
        .is("deleted_at", null)
        .order("name", { ascending: true }),
      supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("created_at", startOfMonth),
      getActiveLegalTemplate(),
    ]
  )

  const threshold = Number(legal?.threshold_eur ?? LEGAL_THRESHOLD_EUR_FALLBACK)
  const disclaimer = legal?.clauses.disclaimer ?? ""
  const plan = sub?.plan ?? "free"
  const atLimit = plan === "free" && (count ?? 0) >= FREE_DEALS_PER_MONTH

  return (
    <DealWizard
      brands={(brands as Brand[]) ?? []}
      userId={user.id}
      threshold={threshold}
      disclaimer={disclaimer}
      atLimit={atLimit}
    />
  )
}
