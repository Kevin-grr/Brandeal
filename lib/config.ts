/**
 * Constantes applicatives non légales.
 *
 * ⚠️ Le contenu légal (seuil de 1 000 €, mentions obligatoires, référence de la
 * loi) NE doit PAS être codé en dur ici : sa source de vérité est la table
 * `legal_template_versions` en base. La constante `LEGAL_THRESHOLD_EUR_FALLBACK`
 * ci-dessous ne sert que d'affichage de secours si aucune version active n'est
 * trouvée — elle ne doit jamais servir de référence pour une décision légale.
 */
export const APP_NAME = "Brandeal"

/** Prix mensuel du plan Créateur. */
export const CREATOR_PRICE_EUR = 12
/** Prix annuel du plan Créateur (≈ 9,92 €/mois, 2 mois offerts). */
export const CREATOR_PRICE_ANNUAL_EUR = 119

/** Prix mensuel du plan Studio. */
export const STUDIO_PRICE_EUR = 29
/** Prix annuel du plan Studio (≈ 24,08 €/mois, 2 mois offerts). */
export const STUDIO_PRICE_ANNUAL_EUR = 269

/** Prix mensuel du plan Expert. */
export const EXPERT_PRICE_EUR = 59
/** Prix annuel du plan Expert (≈ 41,58 €/mois, 2 mois offerts). */
export const EXPERT_PRICE_ANNUAL_EUR = 499

/** @deprecated Utiliser CREATOR_PRICE_EUR à la place. */
export const PRO_PRICE_EUR = CREATOR_PRICE_EUR
/** @deprecated Utiliser CREATOR_PRICE_ANNUAL_EUR à la place. */
export const PRO_PRICE_ANNUAL_EUR = CREATOR_PRICE_ANNUAL_EUR

/** Nombre de deals créables par mois sur le plan gratuit. */
export const FREE_DEALS_PER_MONTH = 2

/** Limites de profils créateurs par plan (null = illimité). */
export const PROFILE_LIMITS: Record<string, number | null> = {
  free: 1,
  creator: 1,
  studio: 3,
  expert: null,
}

/**
 * Repères fiscaux du micro-entrepreneur (activité de prestations de services /
 * BNC, cas le plus courant des créateurs).
 *
 * ⚠️ À VÉRIFIER ET METTRE À JOUR CHAQUE ANNÉE. Ces valeurs sont des repères
 * indicatifs (référence 2025) et NE constituent PAS un conseil fiscal. Les
 * seuils de TVA et taux URSSAF peuvent changer en loi de finances. L'assistant
 * fiscal affiche systématiquement un avertissement renvoyant vers l'URSSAF et
 * impots.gouv.fr. Aucune décision fiscale ne doit reposer sur ces seules valeurs.
 */
export const FISCAL_REFERENCE = {
  year: 2026,
  toVerify: true,
  /** Plafond de chiffre d'affaires du régime micro (prestations BNC). */
  microCeilingServices: 77_700,
  /** Seuil de franchise en base de TVA (prestations de services). */
  vatFranchiseThreshold: 37_500,
  /** Seuil majoré de tolérance TVA (prestations de services). */
  vatFranchiseThresholdMajored: 41_250,
  /** Taux global de cotisations sociales URSSAF (prestations BNC, indicatif). */
  urssafRate: 0.246,
} as const

/** Valeur de secours pour l'affichage uniquement (source réelle : DB). */
export const LEGAL_THRESHOLD_EUR_FALLBACK = 1000

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/** Noms des buckets Supabase Storage pour les PDF générés. */
export const STORAGE_BUCKETS = {
  contracts: "contracts",
  invoices: "invoices",
  quotes: "quotes",
} as const

/**
 * Identité légale de l'éditeur du service (mentions légales, CGU, RGPD).
 * ⚠️ À COMPLÉTER avec les informations réelles de l'exploitant avant un
 * lancement public (raison sociale, SIRET, adresse, email de contact).
 */
export const LEGAL_ENTITY = {
  serviceName: "Brandeal",
  editor: "Brandeal",
  contactEmail: "contact@brandeal.fr",
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
