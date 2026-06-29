import Link from "next/link"

import { getUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Plan } from "@/types/database"
import { PricingPlans } from "@/components/pricing-plans"

export const metadata = { title: "Tarifs" }

export default async function PricingPage() {
  const user = await getUser()
  let plan: Plan = "free"
  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle()
    plan = (data?.plan as Plan) ?? "free"
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Tarifs</h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-xl">
          Le suivi du seuil légal de 1 000 € est toujours gratuit. Choisissez
          le plan qui correspond à votre volume et vos besoins.
        </p>
      </div>

      <PricingPlans isLoggedIn={!!user} currentPlan={plan} />

      <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-xs">
        Brandeal est un outil d&apos;aide à la rédaction et ne constitue pas un
        conseil juridique. Consultez notre{" "}
        <Link href="/legal/avertissement-juridique" className="underline">
          avertissement juridique
        </Link>
        .
      </p>
    </div>
  )
}
