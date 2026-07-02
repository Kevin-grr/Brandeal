import { APP_NAME, LEGAL_ENTITY } from "@/lib/config"

export const metadata = { title: `Mentions légales — ${APP_NAME}` }

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>
        <p className="text-muted-foreground text-sm">
          Conformément aux articles 6-III et 19 de la Loi n°2004-575 du 21 juin
          2004 pour la Confiance dans l&apos;Économie Numérique (LCEN).
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Éditeur du service</h2>
        <p className="text-muted-foreground text-sm">
          <strong>{APP_NAME}</strong> est édité par :{" "}
        </p>
        <ul className="text-muted-foreground list-none space-y-1 text-sm">
          <li>
            <strong>Raison sociale :</strong> Garreau Kevin (auto-entrepreneur)
          </li>
          <li>
            <strong>Directeur de la publication :</strong> Kevin Garreau
          </li>
          <li>
            <strong>E-mail :</strong>{" "}
            <a
              href={`mailto:${LEGAL_ENTITY.contactEmail}`}
              className="underline"
            >
              {LEGAL_ENTITY.contactEmail}
            </a>
          </li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Les informations complémentaires (SIRET, adresse) sont disponibles sur
          demande à{" "}
          <a
            href={`mailto:${LEGAL_ENTITY.contactEmail}`}
            className="underline"
          >
            {LEGAL_ENTITY.contactEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Hébergement</h2>
        <ul className="text-muted-foreground list-none space-y-1 text-sm">
          <li>
            <strong>Application web :</strong> Vercel Inc., 440 N Barranca Ave
            #4133, Covina, CA 91723, États-Unis —{" "}
            <a href="https://vercel.com" className="underline">
              vercel.com
            </a>
          </li>
          <li>
            <strong>Base de données et fichiers :</strong> Supabase Inc.,
            hébergement PostgreSQL en Union européenne (région Europe) —{" "}
            <a href="https://supabase.com" className="underline">
              supabase.com
            </a>
          </li>
          <li>
            <strong>Paiements :</strong> Stripe, Inc., 510 Townsend Street, San
            Francisco, CA 94103, États-Unis —{" "}
            <a href="https://stripe.com" className="underline">
              stripe.com
            </a>
          </li>
          <li>
            <strong>Emails transactionnels :</strong> Resend Inc. —{" "}
            <a href="https://resend.com" className="underline">
              resend.com
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Propriété intellectuelle</h2>
        <p className="text-muted-foreground text-sm">
          L&apos;ensemble des éléments du service {APP_NAME} (marque, logo,
          interface graphique, textes, code source, modèles de documents) est
          protégé par le droit de la propriété intellectuelle. Toute
          reproduction, représentation, modification ou exploitation non
          expressément autorisée est strictement interdite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Données personnelles</h2>
        <p className="text-muted-foreground text-sm">
          Le responsable du traitement des données personnelles est l&apos;éditeur
          du service. Les données sont hébergées dans l&apos;Union européenne
          conformément au RGPD. Pour toute demande relative à vos données,
          écrivez à{" "}
          <a
            href={`mailto:${LEGAL_ENTITY.contactEmail}`}
            className="underline"
          >
            {LEGAL_ENTITY.contactEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cookies</h2>
        <p className="text-muted-foreground text-sm">
          {APP_NAME} utilise des cookies strictement nécessaires au
          fonctionnement du service (authentification, session). Aucun cookie
          publicitaire ou de tracking tiers n&apos;est déposé.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-muted-foreground text-sm">
          Pour toute question ou réclamation :{" "}
          <a
            href={`mailto:${LEGAL_ENTITY.contactEmail}`}
            className="underline"
          >
            {LEGAL_ENTITY.contactEmail}
          </a>
        </p>
      </section>
    </article>
  )
}
