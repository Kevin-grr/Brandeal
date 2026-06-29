"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  CREATOR_PRICE_EUR,
  CREATOR_PRICE_ANNUAL_EUR,
  STUDIO_PRICE_EUR,
  STUDIO_PRICE_ANNUAL_EUR,
  EXPERT_PRICE_EUR,
  EXPERT_PRICE_ANNUAL_EUR,
  FREE_DEALS_PER_MONTH,
} from "@/lib/config"
import type { Plan } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { CheckoutButton } from "@/components/checkout-button"

type Feature = { label: string }

const FREE_FEATURES: Feature[] = [
  { label: `Suivi du seuil 1 000 € par marque, illimité + alertes` },
  { label: `Jusqu'à ${FREE_DEALS_PER_MONTH} partenariats/mois (contrat + facture)` },
  { label: "Historique et fiche par marque" },
  { label: "Watermark sur les PDF" },
]

const CREATOR_FEATURES: Feature[] = [
  { label: "Contrats et factures illimités, sans watermark" },
  { label: "Vérification légale en temps réel pendant la rédaction" },
  { label: "Workflow devis → contrat → facture sans ressaisie" },
  { label: "Bibliothèque de 7 modèles (partenariat, UGC, exclusivité, ambassadeur…)" },
  { label: "Historique complet et stats par marque" },
  { label: "Prévision de chiffre d'affaires simple" },
  { label: "Export comptable CSV" },
]

const STUDIO_FEATURES: Feature[] = [
  { label: "Tout le plan Créateur" },
  { label: "Assistant partenariat — timeline visuelle par marque (contrat → publication → facture → paiement)" },
  { label: "Import intelligent — collez un email/DM/brief, l'IA crée le partenariat pré-rempli" },
  { label: "Signature électronique — envoi + suivi depuis Brandeal" },
  { label: "Espace marque partageable — lien pour signer et télécharger sans email" },
  { label: "Relances automatiques (J+7, J+15, J+30) — zéro action manuelle" },
  { label: "Calcul automatique du prix conseillé selon audience et secteur" },
  { label: "IA de réponse aux marques — brouillon d'email en un clic" },
  { label: "Dashboard intelligent avec alertes proactives" },
  { label: "Jusqu'à 3 profils créateurs (idéal managers)" },
]

const EXPERT_FEATURES: Feature[] = [
  { label: "Tout le plan Studio" },
  { label: "Analyse IA des contrats entrants — score, clauses risquées, résumé en langage simple" },
  { label: "Assistant conversationnel — interrogez toutes vos données (« combien m'a payé X ? », « factures en retard ? »)" },
  { label: "Assistant fiscal — CA actuel, charges estimées, seuil URSSAF, prochaine déclaration" },
  { label: "Prévision CA avancée avec projection mensuelle et annuelle" },
  { label: "Profils créateurs illimités" },
  { label: "Accès API" },
  { label: "Account manager dédié" },
]

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((f) => (
        <li key={f.label} className="flex items-start gap-2">
          <Check className="text-primary mt-0.5 size-4 shrink-0" />
          <span>{f.label}</span>
        </li>
      ))}
    </ul>
  )
}

function savings(monthly: number, annual: number) {
  const pct = Math.round((1 - annual / (monthly * 12)) * 100)
  return `−${pct} %`
}

type PaidPlan = Exclude<Plan, "free">

interface PricingTier {
  id: PaidPlan
  label: string
  tagline: string
  monthly: number
  annual: number
  features: Feature[]
  highlight?: boolean
}

const TIERS: PricingTier[] = [
  {
    id: "creator",
    label: "Créateur",
    tagline: "Contrats et facturation sans friction.",
    monthly: CREATOR_PRICE_EUR,
    annual: CREATOR_PRICE_ANNUAL_EUR,
    features: CREATOR_FEATURES,
  },
  {
    id: "studio",
    label: "Studio",
    tagline: "Le copilote opérationnel de vos partenariats.",
    monthly: STUDIO_PRICE_EUR,
    annual: STUDIO_PRICE_ANNUAL_EUR,
    features: STUDIO_FEATURES,
    highlight: true,
  },
  {
    id: "expert",
    label: "Expert",
    tagline: "L'IA qui lit les contrats à votre place.",
    monthly: EXPERT_PRICE_EUR,
    annual: EXPERT_PRICE_ANNUAL_EUR,
    features: EXPERT_FEATURES,
  },
]

export function PricingPlans({
  isLoggedIn,
  currentPlan,
}: {
  isLoggedIn: boolean
  currentPlan: Plan
}) {
  const [interval, setInterval] = useState<"month" | "year">("month")
  const annual = interval === "year"

  return (
    <>
      {/* Toggle mensuel / annuel */}
      <div className="mt-8 flex justify-center">
        <div className="bg-muted inline-flex rounded-full p-1 text-sm">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={cn(
              "rounded-full px-4 py-1.5 transition-colors",
              !annual
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={cn(
              "rounded-full px-4 py-1.5 transition-colors",
              annual
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Annuel{" "}
            <span className="text-primary">2 mois offerts</span>
          </button>
        </div>
      </div>

      {/* Grille 4 plans */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Gratuit */}
        <Card>
          <CardHeader>
            <CardTitle>Gratuit</CardTitle>
            <CardDescription>Pour découvrir sans engagement.</CardDescription>
            <p className="mt-2 text-3xl font-semibold">0 €</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Le suivi du seuil légal, gratuit pour toujours.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FeatureList items={FREE_FEATURES} />
            {!isLoggedIn ? (
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
                {currentPlan === "free"
                  ? "Votre plan actuel"
                  : "Accéder au tableau de bord"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Plans payants */}
        {TIERS.map((tier) => {
          const price = annual ? tier.annual : tier.monthly
          const perMonth = annual
            ? (tier.annual / 12).toFixed(2).replace(".", ",")
            : null
          const isCurrentPlan = currentPlan === tier.id

          return (
            <Card
              key={tier.id}
              className={cn(tier.highlight && "border-primary shadow-md")}
            >
              {tier.highlight && (
                <div className="bg-primary text-primary-foreground rounded-t-[calc(var(--radius)-1px)] px-4 py-1 text-center text-xs font-medium">
                  Le plus populaire
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.label}</CardTitle>
                <CardDescription>{tier.tagline}</CardDescription>
                <p className="mt-2 text-3xl font-semibold">
                  {price}&nbsp;€
                  <span className="text-muted-foreground text-base font-normal">
                    {annual ? " / an" : " / mois"}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {annual
                    ? `Soit ${perMonth} €/mois — ${savings(tier.monthly, tier.annual)}.`
                    : "Sans engagement, résiliable à tout moment."}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <FeatureList items={tier.features} />
                {!isLoggedIn ? (
                  <Button
                    className="w-full"
                    variant={tier.highlight ? "default" : "outline"}
                    nativeButton={false}
                    render={<Link href="/signup" />}
                  >
                    Créer un compte
                  </Button>
                ) : isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Votre plan actuel
                  </Button>
                ) : (
                  <CheckoutButton
                    className="w-full"
                    plan={tier.id}
                    interval={interval}
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    Passer au {tier.label}
                  </CheckoutButton>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

    </>
  )
}
