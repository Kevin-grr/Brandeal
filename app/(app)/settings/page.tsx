import { requireUser } from "@/lib/auth"
import { getProfile } from "@/lib/profile"
import { ProfileForm } from "@/components/profile-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = { title: "Paramètres" }

export default async function SettingsPage() {
  await requireUser()
  const profile = await getProfile()

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

      {/* Section « Abonnement » : implémentée en Phase 8 (Stripe). */}
    </div>
  )
}
