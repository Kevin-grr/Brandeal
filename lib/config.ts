/**
 * Constantes applicatives non légales.
 *
 * ⚠️ Le contenu légal (seuil de 1 000 €, mentions obligatoires, référence de la
 * loi) NE doit PAS être codé en dur ici : sa source de vérité est la table
 * `legal_template_versions` en base. La constante `LEGAL_THRESHOLD_EUR_FALLBACK`
 * ci-dessous ne sert que d'affichage de secours si aucune version active n'est
 * trouvée — elle ne doit jamais servir de référence pour une décision légale.
 */
export const APP_NAME = "ContratCréateur"

/** Prix par défaut de l'abonnement Pro (modifiable ici uniquement). */
export const PRO_PRICE_EUR = 14.99

/** Nombre de deals créables par mois sur le plan gratuit. */
export const FREE_DEALS_PER_MONTH = 2

/** Valeur de secours pour l'affichage uniquement (source réelle : DB). */
export const LEGAL_THRESHOLD_EUR_FALLBACK = 1000

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/** Noms des buckets Supabase Storage pour les PDF générés. */
export const STORAGE_BUCKETS = {
  contracts: "contracts",
  invoices: "invoices",
} as const

/**
 * Identité légale de l'éditeur du service (mentions légales, CGU, RGPD).
 * ⚠️ À COMPLÉTER avec les informations réelles de l'exploitant avant un
 * lancement public (raison sociale, SIRET, adresse, email de contact).
 */
export const LEGAL_ENTITY = {
  serviceName: "ContratCréateur",
  editor: "ContratCréateur",
  contactEmail: "contact@contratcreateur.fr",
  appHost:
    "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723 (États-Unis)",
  dataHost:
    "Supabase — base de données PostgreSQL managée, hébergement en Union européenne",
}

/**
 * Texte de secours du disclaimer (affichage uniquement). La source de vérité
 * reste la base (legal_template_versions). Utilisé si la DB est indisponible.
 */
export const DISCLAIMER_FALLBACK =
  "Ce document a été généré automatiquement à partir des informations fournies par l'utilisateur. Il ne constitue ni un acte authentique ni un conseil juridique personnalisé. Il est fortement recommandé de le faire relire par un avocat ou un professionnel du droit avant signature."
