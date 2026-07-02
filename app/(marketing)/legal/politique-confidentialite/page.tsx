import { APP_NAME, LEGAL_ENTITY } from "@/lib/config"

export const metadata = { title: `Politique de confidentialité — ${APP_NAME}` }

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Politique de confidentialité
        </h1>
        <p className="text-muted-foreground text-sm">
          Dernière mise à jour : 2 juillet 2026
        </p>
        <p className="text-muted-foreground text-sm">
          Cette politique décrit comment {APP_NAME} collecte, utilise et protège
          vos données personnelles, conformément au Règlement (UE) 2016/679
          (RGPD) et à la loi Informatique et Libertés.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. Responsable du traitement</h2>
        <p className="text-muted-foreground text-sm">
          Le responsable du traitement est l&apos;éditeur du service {APP_NAME}.
          Contact :{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Données collectées</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong>Compte :</strong> adresse e-mail, identifiant Google (si
            connexion via Google).
          </li>
          <li>
            <strong>Profil créateur :</strong> nom, nom d&apos;affichage, statut
            juridique, SIRET, numéro de TVA, adresse professionnelle.
          </li>
          <li>
            <strong>Marques :</strong> nom, raison sociale, adresse, coordonnées
            de contact que vous saisissez.
          </li>
          <li>
            <strong>Partenariats :</strong> missions, plateformes, montants de
            rémunération et avantages en nature, dates, droits d&apos;exploitation.
          </li>
          <li>
            <strong>Documents générés :</strong> contrats, factures et devis (PDF)
            et leur historique.
          </li>
          <li>
            <strong>Abonnement :</strong> identifiants Stripe (client,
            abonnement) et statut. Aucune coordonnée bancaire n&apos;est stockée
            par {APP_NAME}.
          </li>
          <li>
            <strong>Utilisation IA :</strong> les textes que vous soumettez aux
            fonctionnalités d&apos;analyse (contrats, emails de marques) sont
            transmis à l&apos;API Anthropic pour traitement et ne sont pas
            conservés par Anthropic au-delà du traitement de la requête.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Finalités du traitement</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>Fourniture du service (génération de documents, suivi des partenariats).</li>
          <li>Gestion de votre compte et de votre abonnement.</li>
          <li>Envoi d&apos;emails transactionnels (confirmation, relances).</li>
          <li>Amélioration du service (données agrégées et anonymisées).</li>
          <li>Respect des obligations légales (conservation des factures).</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Base légale : exécution du contrat (CGU) pour la fourniture du service
          ; obligation légale pour la conservation des factures ; intérêt légitime
          pour l&apos;amélioration du service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. Hébergement et localisation</h2>
        <p className="text-muted-foreground text-sm">
          Vos données sont stockées via Supabase sur des serveurs situés dans
          l&apos;Union européenne. L&apos;application est hébergée sur Vercel
          (États-Unis) avec des garanties contractuelles conformes au RGPD
          (Standard Contractual Clauses). Les paiements sont traités par Stripe
          (États-Unis) avec les mêmes garanties. Les emails sont envoyés via
          Resend.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Durée de conservation</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Données de compte :</strong> conservées pendant la durée de
            l&apos;abonnement, puis 3 ans après la clôture du compte.
          </li>
          <li>
            <strong>Contrats et factures :</strong> conservés 10 ans conformément
            aux obligations légales de conservation comptable (art. L123-22 du
            Code de commerce). La suppression depuis l&apos;interface est une
            suppression logique (le document est masqué mais conservé).
          </li>
          <li>
            <strong>Logs d&apos;utilisation IA :</strong> 7 jours glissants.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">6. Vos droits</h2>
        <p className="text-muted-foreground text-sm">
          Conformément au RGPD, vous disposez des droits suivants sur vos données :
        </p>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li><strong>Accès :</strong> obtenir une copie de vos données.</li>
          <li><strong>Rectification :</strong> corriger des données inexactes.</li>
          <li>
            <strong>Suppression :</strong> demander l&apos;effacement de votre
            compte et de vos données (sous réserve des obligations légales de
            conservation des factures).
          </li>
          <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré.</li>
          <li>
            <strong>Opposition :</strong> vous opposer à certains traitements.
          </li>
          <li>
            <strong>Limitation :</strong> demander la limitation d&apos;un
            traitement en cas de contestation.
          </li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Pour exercer ces droits, écrivez à{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
          . En cas de réclamation non résolue, vous pouvez saisir la CNIL
          (cnil.fr).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">7. Cookies</h2>
        <p className="text-muted-foreground text-sm">
          {APP_NAME} utilise uniquement des cookies strictement nécessaires au
          fonctionnement du service (gestion de session d&apos;authentification
          via Supabase). Aucun cookie publicitaire, de tracking ou analytique
          tiers n&apos;est utilisé.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">8. Sécurité</h2>
        <p className="text-muted-foreground text-sm">
          Les données sont chiffrées en transit (HTTPS) et au repos. L&apos;accès
          aux données est restreint par des règles de sécurité au niveau base de
          données (Row Level Security). Les clés et secrets sont stockés dans des
          variables d&apos;environnement sécurisées et ne sont jamais exposés
          côté client.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">9. Contact</h2>
        <p className="text-muted-foreground text-sm">
          Pour toute question relative à cette politique :{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="underline">
            {LEGAL_ENTITY.contactEmail}
          </a>
        </p>
      </section>
    </article>
  )
}
