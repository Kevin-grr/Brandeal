import Link from "next/link"

import { APP_NAME, DISCLAIMER_FALLBACK, LEGAL_ENTITY } from "@/lib/config"
import { getActiveLegalTemplate } from "@/lib/legal"

export const metadata = { title: "Conditions générales d'utilisation" }

export default async function CguPage() {
  const legal = await getActiveLegalTemplate()
  const disclaimer = legal?.clauses.disclaimer ?? DISCLAIMER_FALLBACK

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Conditions générales d&apos;utilisation
      </h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. Objet</h2>
        <p className="text-muted-foreground text-sm">
          Les présentes conditions régissent l&apos;utilisation du service{" "}
          {APP_NAME}, qui permet aux créateurs de contenu de générer des contrats
          de partenariat et des factures, et de suivre le seuil légal de 1 000 €
          par marque.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Compte</h2>
        <p className="text-muted-foreground text-sm">
          La création d&apos;un compte nécessite une adresse e-mail valide.
          Vous êtes responsable de la confidentialité de vos identifiants et de
          l&apos;exactitude des informations saisies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Offres et abonnement</h2>
        <p className="text-muted-foreground text-sm">
          L&apos;offre gratuite est limitée à 2 contrats par mois et appose un
          watermark sur les documents. L&apos;offre Pro, payante et sans
          engagement, débloque les documents illimités sans watermark. Les
          paiements sont gérés par Stripe ; aucune coordonnée bancaire
          n&apos;est stockée par {APP_NAME}.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. Nature du service</h2>
        <p className="text-muted-foreground text-sm">{disclaimer}</p>
        <p className="text-muted-foreground text-sm">
          Voir l&apos;
          <Link href="/legal/avertissement-juridique" className="underline">
            avertissement juridique
          </Link>{" "}
          complet.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Responsabilité</h2>
        <p className="text-muted-foreground text-sm">
          {APP_NAME} est fourni «&nbsp;en l&apos;état&nbsp;». L&apos;éditeur ne
          garantit pas l&apos;adéquation des documents générés à votre situation
          particulière et ne saurait être tenu responsable des conséquences de
          leur utilisation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">6. Données personnelles</h2>
        <p className="text-muted-foreground text-sm">
          Le traitement de vos données est décrit dans la{" "}
          <Link
            href="/legal/politique-confidentialite"
            className="underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">7. Contact</h2>
        <p className="text-muted-foreground text-sm">
          {LEGAL_ENTITY.contactEmail}
        </p>
      </section>
    </article>
  )
}
