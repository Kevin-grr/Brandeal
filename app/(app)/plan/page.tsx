import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Plan } from "@/types/database"
import { PricingPlans } from "@/components/pricing-plans"
import { SubscriptionSection } from "@/components/subscription-section"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Mon plan" }

export default async function PlanPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle()

  const currentPlan: Plan = (sub?.plan as Plan) ?? "free"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon plan</h1>
        <p className="text-muted-foreground">Gérez votre abonnement Brandeal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnement actuel</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionSection plan={currentPlan} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          {currentPlan === "free" ? "Choisir un plan" : "Changer de plan"}
        </h2>
        <PricingPlans isLoggedIn currentPlan={currentPlan} />
      </div>
    </div>
  )
}
