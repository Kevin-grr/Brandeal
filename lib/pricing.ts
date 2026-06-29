/**
 * Estimateur de tarif de collaboration (prix conseillé).
 *
 * ⚠️ Modèle INDICATIF basé sur des repères publics du marché de l'influence
 * (règle approximative du « 1 % des abonnés » pour un post sponsorisé, ajustée
 * par l'engagement, la plateforme, le format et le secteur). Ce n'est pas un
 * barème officiel : c'est une aide à la décision pour éviter de sous-facturer.
 */

export type Platform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "linkedin"
  | "twitch"

export type ContentFormat =
  | "post"
  | "reel"
  | "story"
  | "video_integration"
  | "video_dedicated"
  | "ugc"

export type Sector =
  | "general"
  | "beaute"
  | "mode"
  | "tech"
  | "finance"
  | "food"
  | "sport"
  | "gaming"
  | "voyage"

export interface PricingInput {
  platform: Platform
  followers: number
  /** Taux d'engagement en pourcentage (ex. 4.5 pour 4,5 %). */
  engagementRate: number
  format: ContentFormat
  sector: Sector
  /** Cession de droits / réutilisation pub par la marque → +30 %. */
  usageRights?: boolean
  /** Exclusivité demandée → +25 %. */
  exclusivity?: boolean
}

export interface PricingResult {
  min: number
  recommended: number
  premium: number
}

/** Tarif de base par abonné (€) pour un post de référence, par plateforme. */
const RATE_PER_FOLLOWER: Record<Platform, number> = {
  instagram: 0.01,
  tiktok: 0.01,
  youtube: 0.05,
  x: 0.004,
  linkedin: 0.015,
  twitch: 0.02,
}

/** Multiplicateur selon le format de contenu. */
const FORMAT_MULTIPLIER: Record<ContentFormat, number> = {
  story: 0.5,
  post: 1,
  reel: 1.3,
  ugc: 0.8,
  video_integration: 1.4,
  video_dedicated: 2.2,
}

/** Multiplicateur selon le secteur (les niches premium paient plus). */
const SECTOR_MULTIPLIER: Record<Sector, number> = {
  general: 1,
  beaute: 1.15,
  mode: 1.1,
  food: 1.05,
  sport: 1.1,
  gaming: 1.05,
  voyage: 1.1,
  tech: 1.3,
  finance: 1.5,
}

/** Engagement de référence (%). Au-dessus on valorise, en dessous on décote. */
const REFERENCE_ENGAGEMENT = 3

const clampMultiplier = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))

/**
 * Calcule une fourchette min / conseillé / premium. Tous les paramètres sont
 * documentés ci-dessus et ajustables. Arrondi à la dizaine d'euros.
 */
export function estimatePrice(input: PricingInput): PricingResult {
  const followers = Math.max(0, input.followers || 0)
  const engagement = Math.max(0, input.engagementRate || 0)

  const base =
    followers * RATE_PER_FOLLOWER[input.platform] * FORMAT_MULTIPLIER[input.format]

  // Pondération par l'engagement (borné pour éviter les extrêmes).
  const engagementFactor = clampMultiplier(
    engagement / REFERENCE_ENGAGEMENT,
    0.5,
    2.5
  )

  let recommended = base * engagementFactor * SECTOR_MULTIPLIER[input.sector]

  if (input.usageRights) recommended *= 1.3
  if (input.exclusivity) recommended *= 1.25

  // Plancher raisonnable : une collaboration sérieuse vaut rarement < 50 €.
  recommended = Math.max(recommended, followers > 1000 ? 80 : 50)

  const round = (n: number) => Math.round(n / 10) * 10

  return {
    min: round(recommended * 0.75),
    recommended: round(recommended),
    premium: round(recommended * 1.35),
  }
}
