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
