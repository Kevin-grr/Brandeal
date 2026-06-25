import { requireUser } from "@/lib/auth"
import { getProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import type { Plan } from "@/types/database"
import { ProfileForm } from "@/components/profile-form"
import { SubscriptionSection } from "@/components/subscription-section"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Paramètres" }

export default async function SettingsPage() {
  const user = await requireUser()
  const profile = await getProfile()

  const supabase = await createClient()
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle()
  const plan: Plan = (sub?.plan as Plan) ?? "free"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez votre profil et votre abonnement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Informations utilisées sur vos contrats et factures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm mode="settings" initial={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Plan et facturation.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionSection plan={plan} />
        </CardContent>
      </Card>
    </div>
  )
}
