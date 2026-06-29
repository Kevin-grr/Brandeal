import Image from "next/image"
import Link from "next/link"
import {
  AlertTriangle,
  Bot,
  FileCheck2,
  FileText,
  Gauge,
  Lock,
  Receipt,
  Server,
  ShieldCheck,
  Signature,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const STEPS = [
  {
    n: "01",
    title: "Déposez le contrat de la marque",
    desc: "Glissez le PDF reçu par email. Brandeal le lit à votre place en quelques secondes.",
  },
  {
    n: "02",
    title: "L'IA détecte les clauses risquées",
    desc: "Exclusivités cachées, droits d'exploitation abusifs, paiements non garantis — tout est signalé.",
  },
  {
    n: "03",
    title: "Générez votre contre-contrat conforme",
    desc: "Un contrat aux normes de la loi influenceurs est créé en 2 minutes avec toutes les mentions obligatoires.",
  },
  {
    n: "04",
    title: "Signature électronique et envoi",
    desc: "La marque signe directement en ligne. Vous gardez une copie horodatée.",
  },
  {
    n: "05",
    title: "Facture générée automatiquement",
    desc: "Numérotation séquentielle, mentions légales, suivi du seuil de 1 000 € par marque.",
  },
]

const FEATURES = [
  {
    icon: FileCheck2,
    title: "Contrats conformes en 2 minutes",
    desc: "Toutes les mentions obligatoires de l'article 8 de la loi influenceurs, générées automatiquement.",
  },
  {
    icon: Bot,
    title: "Analyse IA des contrats entrants",
    desc: "Déposez le PDF de la marque. L'IA détecte les exclusivités, droits d'exploitation et clauses dangereuses.",
  },
  {
    icon: Gauge,
    title: "Suivi du seuil de 1 000 €",
    desc: "Alerte automatique dès que le cumul par marque et par an approche du seuil légal.",
  },
  {
    icon: Receipt,
    title: "Facturation aux normes",
    desc: "Factures avec numérotation séquentielle et mentions obligatoires pour micro-entrepreneurs.",
  },
  {
    icon: Signature,
    title: "Signature électronique",
    desc: "Faites signer vos contrats en ligne. Copie horodatée conservée automatiquement.",
  },
  {
    icon: Zap,
    title: "Relances automatiques",
    desc: "Plus jamais de facture impayée oubliée. Les relances partent seules au bon moment.",
  },
]

const TRUST = [
  { icon: ShieldCheck, label: "Conforme à la loi n°2023-451" },
  { icon: Server, label: "Données hébergées en Europe (RGPD)" },
  { icon: FileText, label: "Documents conservés sans suppression" },
  { icon: Lock, label: "Chiffrement de bout en bout" },
  { icon: Bot, label: "IA spécialisée créateurs français" },
  { icon: AlertTriangle, label: "Alertes légales en temps réel" },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <span className="bg-muted text-muted-foreground inline-block rounded-full px-3 py-1 text-xs font-medium">
          Conforme à la loi n°2023-451 — loi influenceurs
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Le seul outil dont un créateur a besoin pour gérer ses collaborations avec les marques.
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg text-pretty">
          Brandeal gère toute l&apos;administration de vos partenariats : contrats conformes, analyse IA, factures, relances et suivi légal. Vous vous concentrez sur votre contenu.
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

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-10 text-center sm:grid-cols-4">
          {[
            { value: "2 min", label: "pour générer un contrat conforme" },
            { value: "1 000 €", label: "seuil légal suivi automatiquement" },
            { value: "100%", label: "hébergement Europe (RGPD)" },
            { value: "0 avocat", label: "nécessaire pour démarrer" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-primary text-3xl font-semibold">{s.value}</p>
              <p className="text-muted-foreground mt-1 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshot dashboard */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="overflow-hidden rounded-2xl border shadow-lg">
          <Image
            src="/screenshot-dashboard.webp"
            alt="Tableau de bord Brandeal — suivi du seuil légal et alertes"
            width={1456}
            height={816}
            className="w-full"
            priority
          />
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            De la réception du contrat à la facture payée
          </h2>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            En moins de 10 minutes, tout est géré.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="text-primary shrink-0 text-2xl font-bold">{s.n}</span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloc IA */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="bg-primary/5 border-primary/20 rounded-2xl border p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <Bot className="text-primary mx-auto size-10" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              L&apos;IA lit vos contrats à votre place
            </h2>
            <p className="text-muted-foreground mt-3">
              Déposez le PDF envoyé par une marque. Brandeal détecte automatiquement les clauses qui vous engagent.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Exclusivités cachées et leur durée",
              "Droits d'exploitation de vos vidéos",
              "Absence de garantie de paiement",
              "Clauses de résiliation abusives",
              "Obligations non mentionnées oralement",
              "Risques juridiques selon la loi française",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border shadow-md">
              <Image
                src="/screenshot-ai-input.webp"
                alt="Interface d'analyse de contrat Brandeal"
                width={1456}
                height={816}
                className="w-full"
              />
            </div>
            <div className="overflow-hidden rounded-xl border shadow-md">
              <Image
                src="/screenshot-ai-result.webp"
                alt="Résultats de l'analyse IA — clauses à risque détectées"
                width={1456}
                height={816}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Tout ce dont vous avez besoin, dans un seul outil
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <f.icon className="text-primary size-6" />
                  <CardTitle className="mt-2 text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi la conformité est obligatoire */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          Depuis 2026, un contrat écrit est obligatoire
        </h2>
        <div className="text-muted-foreground mt-4 space-y-4 text-sm leading-relaxed">
          <p>
            La loi française n°2023-451 du 9 juin 2023, complétée par le décret n°2025-1137, impose un{" "}
            <strong className="text-foreground">contrat écrit obligatoire</strong> pour toute collaboration
            commerciale dès que la rémunération atteint{" "}
            <strong className="text-foreground">1 000 € HT par annonceur et par an</strong>.
          </p>
          <p>
            Sans contrat, la collaboration peut être frappée de nullité. Beaucoup de créateurs franchissent
            ce seuil sans le savoir, en gérant leurs partenariats par DM ou email.
          </p>
          <p>
            Brandeal calcule automatiquement le cumul par marque, vous alerte au bon moment et génère les documents nécessaires.
          </p>
        </div>
      </section>

      {/* Confiance */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Pourquoi Brandeal
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <t.icon className="text-primary size-5 shrink-0" />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          Brandeal est le premier copilote IA qui gère l&apos;intégralité de vos collaborations avec les marques.
        </h2>
        <p className="text-muted-foreground mt-4">
          Rejoignez les créateurs qui ne perdent plus de temps sur l&apos;administratif.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/signup" />}
          >
            Commencer gratuitement
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
    </div>
  )
}
