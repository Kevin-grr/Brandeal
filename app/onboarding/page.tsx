import { redirect } from "next/navigation"

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

export const metadata = { title: "Bienvenue" }

export default async function OnboardingPage() {
  await requireUser()
  const profile = await getProfile()
  if (profile) redirect("/dashboard")

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenue 👋</CardTitle>
          <CardDescription>
            Complétez votre profil. Ces informations apparaîtront sur vos
            contrats et vos factures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm mode="onboarding" />
        </CardContent>
      </Card>
    </div>
  )
}
