import { APP_NAME, LEGAL_ENTITY } from "@/lib/config"

export const metadata = { title: "Mentions légales" }

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Éditeur</h2>
        <p className="text-muted-foreground text-sm">
          Le service {APP_NAME} est édité par son exploitant, joignable à
          l&apos;adresse {LEGAL_ENTITY.contactEmail}. Les informations
          d&apos;identification complètes de l&apos;éditeur (raison sociale, forme
          juridique, numéro SIRET, siège social) doivent être renseignées par
          l&apos;exploitant avant toute exploitation commerciale du service et
          sont disponibles sur demande.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Directeur de la publication</h2>
        <p className="text-muted-foreground text-sm">
          La direction de la publication est assurée par l&apos;exploitant du
          service {APP_NAME}.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Hébergement</h2>
        <p className="text-muted-foreground text-sm">
          Application hébergée par {LEGAL_ENTITY.appHost}. Données et fichiers
          hébergés par {LEGAL_ENTITY.dataHost}.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Propriété intellectuelle</h2>
        <p className="text-muted-foreground text-sm">
          L&apos;ensemble des éléments du service {APP_NAME} (marque, interface,
          textes, code) est protégé par le droit de la propriété intellectuelle.
          Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-muted-foreground text-sm">
          Pour toute question : {LEGAL_ENTITY.contactEmail}.
        </p>
      </section>
    </article>
  )
}
