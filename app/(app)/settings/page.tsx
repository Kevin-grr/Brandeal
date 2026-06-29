import { requireUser } from "@/lib/auth"
import { getProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import type { CreatorProfile, Plan } from "@/types/database"
import { ProfileForm } from "@/components/profile-form"
import { ProfilesManager } from "@/components/profiles-manager"
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
  const [{ data: sub }, { data: creatorProfiles }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("creator_profiles")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ])
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
          <CardTitle>Profils créateurs</CardTitle>
          <CardDescription>
            Plusieurs identités pour les managers et agences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilesManager
            plan={plan}
            ownerId={user.id}
            profiles={(creatorProfiles as CreatorProfile[]) ?? []}
          />
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
