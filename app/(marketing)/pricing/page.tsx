import Link from "next/link"
import { Check } from "lucide-react"

import { getUser } from "@/lib/auth"
import { PRO_PRICE_EUR } from "@/lib/config"
import { formatEur } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import type { Plan } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckoutButton } from "@/components/checkout-button"

export const metadata = { title: "Tarifs" }

const FREE_FEATURES = [
  "Jusqu'à 2 contrats par mois",
  "Suivi automatique du seuil de 1 000 € par marque",
  "Génération de factures conformes",
  "Watermark « Généré avec Brandeal » sur les PDF",
]

const PRO_FEATURES = [
  "Contrats illimités",
  "Factures illimitées",
  "Aucun watermark sur les PDF",
  "Export comptable",
  "Relances de paiement par e-mail",
]

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2">
          <Check className="text-primary mt-0.5 size-4 shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  )
}

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
        <p className="text-muted-foreground mt-2">
          Commencez gratuitement, passez au Pro quand vous en avez besoin.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Gratuit */}
        <Card>
          <CardHeader>
            <CardTitle>Gratuit</CardTitle>
            <CardDescription>Pour démarrer sereinement.</CardDescription>
            <p className="mt-2 text-3xl font-semibold">0 €</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FeatureList items={FREE_FEATURES} />
            {!user ? (
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Commencer gratuitement
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                {plan === "free"
                  ? "Votre plan actuel"
                  : "Accéder au tableau de bord"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Pour les créateurs réguliers.</CardDescription>
            <p className="mt-2 text-3xl font-semibold">
              {formatEur(PRO_PRICE_EUR)}
              <span className="text-muted-foreground text-base font-normal">
                {" "}
                / mois
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FeatureList items={PRO_FEATURES} />
            {!user ? (
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Créer un compte
              </Button>
            ) : plan === "pro" ? (
              <Button variant="outline" className="w-full" disabled>
                Votre plan actuel
              </Button>
            ) : (
              <CheckoutButton className="w-full">Passer au Pro</CheckoutButton>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-xs">
        Brandeal est un outil d&apos;aide à la rédaction et ne constitue
        pas un conseil juridique. Consultez notre{" "}
        <Link href="/legal/avertissement-juridique" className="underline">
          avertissement juridique
        </Link>
        .
      </p>
    </div>
  )
}
