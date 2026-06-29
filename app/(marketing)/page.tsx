import Link from "next/link"
import { FileCheck2, Gauge, Receipt, ShieldCheck } from "lucide-react"

import {
  CREATOR_PRICE_EUR,
  STUDIO_PRICE_EUR,
  EXPERT_PRICE_EUR,
} from "@/lib/config"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FEATURES = [
  {
    icon: FileCheck2,
    title: "Contrats conformes en 2 minutes",
    description:
      "Un assistant guidé génère un contrat de partenariat reprenant les mentions obligatoires de l'article 8 de la loi influenceurs.",
  },
  {
    icon: Gauge,
    title: "Suivi du seuil de 1 000 €",
    description:
      "Le montant cumulé par marque et par an est calculé automatiquement, avec une alerte dès que le seuil légal est atteint.",
  },
  {
    icon: Receipt,
    title: "Facturation aux normes françaises",
    description:
      "Générez des factures avec numérotation séquentielle et les mentions obligatoires (dont « TVA non applicable, art. 293 B »).",
  },
  {
    icon: ShieldCheck,
    title: "Pensé pour les créateurs FR",
    description:
      "Spécialisé micro-entrepreneurs : statut, franchise de TVA, droit applicable. Tout en français.",
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <span className="bg-muted text-muted-foreground inline-block rounded-full px-3 py-1 text-xs font-medium">
          Conforme à la loi n°2023-451 (loi influenceurs)
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Le copilote administratif des créateurs de contenu français.
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg text-pretty">
          Contrats conformes à la loi influenceurs, suivi du seuil de 1&nbsp;000&nbsp;€,
          facturation, devis, analyse IA des contrats entrants, relances automatiques.
          Tout ce qu&apos;un créateur ne devrait pas gérer seul.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/signup" />}
          >
            Créer un compte gratuit
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            Voir les tarifs
          </Button>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Gratuit jusqu&apos;à 2 contrats par mois. Sans carte bancaire.
        </p>
      </section>

      {/* Pourquoi c'est important */}
      <section className="bg-muted/30 border-y">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Pourquoi c&apos;est important
          </h2>
          <div className="text-muted-foreground mt-4 space-y-4">
            <p>
              Depuis le 1er janvier 2026, la loi française n°2023-451 du 9 juin
              2023 (dite «&nbsp;loi influenceurs&nbsp;»), complétée par le
              décret n°2025-1137, impose un{" "}
              <strong>contrat écrit obligatoire</strong> pour toute
              collaboration commerciale entre un créateur et une marque dès que
              la somme des rémunérations et avantages en nature atteint{" "}
              <strong>1 000 € HT par annonceur et par an</strong>.
            </p>
            <p>
              Sans contrat écrit, la collaboration peut être frappée de{" "}
              <strong>nullité</strong>. Or beaucoup de créateurs gèrent leurs
              partenariats par e-mail ou DM, sans suivi du montant cumulé par
              marque, et franchissent le seuil sans le savoir.
            </p>
            <p>
              Brandeal structure vos partenariats, vous prévient au bon
              moment et génère les documents nécessaires. C&apos;est un{" "}
              <strong>outil d&apos;aide à la rédaction</strong>, pas un
              substitut à un conseil juridique professionnel.
            </p>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Tout ce qu&apos;il faut pour être en règle
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="text-primary size-6" />
                <CardTitle className="mt-2 text-base">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing résumé */}
      <section className="bg-muted/30 border-t">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Gratuit pour démarrer, puissant pour scaler
          </h2>
          <p className="text-muted-foreground mt-3">
            Le suivi du seuil légal est gratuit à vie. Passez au plan{" "}
            <strong>Créateur</strong> à {CREATOR_PRICE_EUR}&nbsp;€/mois pour
            des contrats illimités, au plan <strong>Studio</strong> à{" "}
            {STUDIO_PRICE_EUR}&nbsp;€/mois pour la signature électronique et les
            relances automatiques, ou au plan <strong>Expert</strong> à{" "}
            {EXPERT_PRICE_EUR}&nbsp;€/mois pour l&apos;analyse IA de vos
            contrats entrants.
          </p>
          <div className="mt-6">
            <Button nativeButton={false} render={<Link href="/pricing" />}>
              Voir les tarifs
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
