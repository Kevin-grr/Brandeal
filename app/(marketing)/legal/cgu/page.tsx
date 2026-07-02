import Link from "next/link"

import { APP_NAME, LEGAL_ENTITY } from "@/lib/config"

export const metadata = { title: `Conditions générales d'utilisation — ${APP_NAME}` }

export default function CguPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Conditions générales d&apos;utilisation
        </h1>
        <p className="text-muted-foreground text-sm">
          Dernière mise à jour : 2 juillet 2026
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. Objet</h2>
        <p className="text-muted-foreground text-sm">
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent
          l&apos;accès et l&apos;utilisation du service {APP_NAME}, accessible à
          l&apos;adresse brandeal.fr. {APP_NAME} est un outil d&apos;aide à la
          gestion des partenariats pour créateurs de contenu : génération de
          contrats, de factures et de devis, analyse de contrats par intelligence
          artificielle, suivi des partenariats et assistant conversationnel.
        </p>
        <p className="text-muted-foreground text-sm">
          En utilisant le service, vous acceptez sans réserve les présentes CGU.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Éditeur</h2>
        <p className="text-muted-foreground text-sm">
          Le service {APP_NAME} est édité par {LEGAL_ENTITY.editor}. Contact :{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Accès au service</h2>
        <p className="text-muted-foreground text-sm">
          La création d&apos;un compte nécessite une adresse e-mail valide ou une
          connexion via Google. Vous êtes responsable de la confidentialité de vos
          identifiants et de l&apos;exactitude des informations renseignées dans
          votre profil. Tout usage du compte est présumé effectué par son
          titulaire.
        </p>
        <p className="text-muted-foreground text-sm">
          Le service est réservé aux personnes physiques majeures agissant en
          qualité de créateurs de contenu professionnels ou en cours de
          professionnalisation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. Offres et abonnements</h2>
        <p className="text-muted-foreground text-sm">
          {APP_NAME} propose les offres suivantes :
        </p>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Gratuit</strong> : accès limité à 1 partenariat actif, sans
            accès aux fonctionnalités IA avancées.
          </li>
          <li>
            <strong>Creator (12 €/mois ou 119 €/an)</strong> : partenariats
            illimités, génération de contrats et factures, accès à
            l&apos;assistant IA.
          </li>
          <li>
            <strong>Studio (29 €/mois ou 269 €/an)</strong> : toutes les
            fonctionnalités Creator, jusqu&apos;à 3 profils créateurs.
          </li>
          <li>
            <strong>Expert (59 €/mois ou 499 €/an)</strong> : toutes les
            fonctionnalités Studio, profils illimités, accès prioritaire aux
            nouvelles fonctionnalités.
          </li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Les paiements sont gérés par Stripe, Inc. Aucune coordonnée bancaire
          n&apos;est stockée par {APP_NAME}. Les abonnements sont renouvelés
          automatiquement et peuvent être résiliés à tout moment depuis
          l&apos;espace Mon Plan. La résiliation prend effet à la fin de la
          période en cours.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Nature du service — avertissement</h2>
        <p className="text-muted-foreground text-sm">
          {APP_NAME} est un <strong>outil d&apos;aide à la rédaction</strong> et
          non un service juridique. Les documents générés (contrats, factures,
          devis) et les analyses produites par l&apos;intelligence artificielle
          sont fournis à titre indicatif. Ils ne constituent ni un acte
          authentique, ni un conseil juridique ou comptable personnalisé.
        </p>
        <p className="text-muted-foreground text-sm">
          Nous vous recommandons fortement de faire relire vos contrats par un
          professionnel du droit avant toute signature, notamment pour des
          partenariats d&apos;un montant significatif. Consultez l&apos;
          <Link href="/legal/avertissement-juridique" className="underline">
            avertissement juridique complet
          </Link>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">6. Obligations de l&apos;utilisateur</h2>
        <p className="text-muted-foreground text-sm">
          Vous vous engagez à :
        </p>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>Fournir des informations exactes et à jour.</li>
          <li>
            Ne pas utiliser le service à des fins illicites, frauduleuses ou
            contraires aux droits de tiers.
          </li>
          <li>
            Ne pas tenter d&apos;accéder aux données d&apos;autres utilisateurs.
          </li>
          <li>
            Ne pas solliciter {APP_NAME} pour générer des documents destinés à
            tromper des marques ou des partenaires.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">7. Propriété intellectuelle</h2>
        <p className="text-muted-foreground text-sm">
          Les éléments constitutifs du service (interface, code, marque Brandeal,
          modèles de documents) restent la propriété exclusive de l&apos;éditeur.
          Les documents que vous générez à partir de vos propres données vous
          appartiennent.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">8. Disponibilité et modifications</h2>
        <p className="text-muted-foreground text-sm">
          L&apos;éditeur s&apos;efforce de maintenir le service disponible mais
          ne garantit pas une disponibilité ininterrompue. {APP_NAME} se réserve
          le droit de modifier les fonctionnalités, les tarifs ou les présentes
          CGU. Toute modification substantielle sera notifiée par e-mail avec un
          préavis de 30 jours.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">9. Responsabilité</h2>
        <p className="text-muted-foreground text-sm">
          {APP_NAME} est fourni «&nbsp;en l&apos;état&nbsp;». L&apos;éditeur ne
          saurait être tenu responsable des conséquences directes ou indirectes
          de l&apos;utilisation des documents générés, des analyses IA, ou
          d&apos;une interruption du service. La responsabilité de l&apos;éditeur
          est limitée au montant des sommes effectivement versées par
          l&apos;utilisateur au cours des 12 derniers mois.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">10. Données personnelles</h2>
        <p className="text-muted-foreground text-sm">
          Le traitement de vos données personnelles est décrit dans la{" "}
          <Link href="/legal/politique-confidentialite" className="underline">
            politique de confidentialité
          </Link>
          , conforme au RGPD.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">11. Résiliation</h2>
        <p className="text-muted-foreground text-sm">
          Vous pouvez supprimer votre compte à tout moment depuis les paramètres
          ou en écrivant à {LEGAL_ENTITY.contactEmail}. L&apos;éditeur se réserve
          le droit de suspendre ou supprimer un compte en cas de violation des
          présentes CGU, sans préavis en cas de manquement grave.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">12. Droit applicable et litiges</h2>
        <p className="text-muted-foreground text-sm">
          Les présentes CGU sont soumises au droit français. En cas de litige,
          une solution amiable sera recherchée en priorité. À défaut, les
          tribunaux français seront compétents.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">13. Contact</h2>
        <p className="text-muted-foreground text-sm">
          Pour toute question relative aux présentes CGU :{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
        </p>
      </section>
    </article>
  )
}
