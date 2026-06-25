import { APP_NAME, LEGAL_ENTITY } from "@/lib/config"

export const metadata = { title: "Politique de confidentialité" }

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="text-muted-foreground text-sm">
        Cette politique décrit comment {APP_NAME} traite vos données
        personnelles, conformément au Règlement général sur la protection des
        données (RGPD).
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Données collectées</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>
            Données de compte : adresse e-mail (et identifiant Google si
            connexion via Google).
          </li>
          <li>
            Profil créateur : nom, nom d&apos;affichage, statut juridique, SIRET,
            numéro de TVA, adresse.
          </li>
          <li>
            Marques : nom, raison sociale, adresse, identifiants fiscaux,
            coordonnées de contact que vous saisissez.
          </li>
          <li>
            Partenariats : missions, plateformes, montants (rémunération et
            avantages en nature), dates, droits.
          </li>
          <li>Contrats et factures générés (fichiers PDF) et leur historique.</li>
          <li>
            Données d&apos;abonnement Stripe (identifiants client/abonnement,
            statut). Aucune coordonnée bancaire n&apos;est stockée par {APP_NAME}.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Finalités</h2>
        <p className="text-muted-foreground text-sm">
          Ces données servent à fournir le service : génération de documents,
          suivi du seuil légal, facturation et gestion de votre abonnement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Hébergement et localisation</h2>
        <p className="text-muted-foreground text-sm">
          Vos données sont stockées via {LEGAL_ENTITY.dataHost}. L&apos;hébergement
          de la base de données est situé dans l&apos;Union européenne. Les
          paiements sont traités par Stripe.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Conservation</h2>
        <p className="text-muted-foreground text-sm">
          Les contrats et factures ne sont jamais réellement supprimés afin de
          respecter les obligations de conservation (notamment la conservation
          des factures pendant 10 ans). La suppression depuis l&apos;interface
          est une suppression logique (le document est masqué mais conservé).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Vos droits</h2>
        <p className="text-muted-foreground text-sm">
          Vous disposez d&apos;un droit d&apos;accès, de rectification, de
          portabilité et de suppression de vos données (sous réserve des
          obligations légales de conservation). Pour exercer ces droits,
          écrivez à {LEGAL_ENTITY.contactEmail}.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-muted-foreground text-sm">
          {LEGAL_ENTITY.contactEmail}
        </p>
      </section>
    </article>
  )
}
