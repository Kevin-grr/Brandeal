/**
 * Vérification de conformité en temps réel (logique pure).
 * Produit une checklist ✔ / ⚠ pendant la rédaction du partenariat, d'après les
 * exigences de la loi influenceurs (n°2023-451) et les mentions de facturation.
 *
 * ⚠️ Aide à la rédaction. Ne se substitue pas à une relecture juridique.
 */

import type { Brand, Profile } from "@/types/database"
import type { DealFormValues } from "@/lib/validations/deal"

export type CheckStatus = "ok" | "warning" | "missing"

export interface CheckItem {
  id: string
  label: string
  status: CheckStatus
  hint?: string
}

export interface LegalCheckResult {
  items: CheckItem[]
  okCount: number
  total: number
  /** true si aucune anomalie bloquante (missing). */
  compliant: boolean
}

interface CheckContext {
  deal: Partial<DealFormValues>
  brand?: Brand | null
  profile?: Profile | null
  /** Total cumulé projeté avec cette marque sur l'année. */
  yearlyTotal?: number
  threshold?: number
}

const nonEmpty = (s: unknown): boolean =>
  typeof s === "string" && s.trim().length > 0

export function runLegalCheck(ctx: CheckContext): LegalCheckResult {
  const { deal, brand, profile, yearlyTotal = 0, threshold = 1000 } = ctx
  const items: CheckItem[] = []

  const cash = Number(deal.cash_amount_eur ?? 0)
  const inKind = deal.has_in_kind ? Number(deal.in_kind_value_eur ?? 0) : 0
  const dealTotal = cash + inKind
  const projected = yearlyTotal + dealTotal
  const aboveThreshold = projected >= threshold

  // 1. Objet de la collaboration
  items.push({
    id: "object",
    label: "Objet de la collaboration décrit",
    status: nonEmpty(deal.mission_description) ? "ok" : "missing",
    hint: "Décrivez précisément la prestation attendue.",
  })

  // 2. Rémunération chiffrée
  items.push({
    id: "remuneration",
    label: "Rémunération ou avantage chiffré",
    status: dealTotal > 0 ? "ok" : "missing",
    hint: "Indiquez un montant en numéraire et/ou la valeur de l'avantage en nature.",
  })

  // 3. Avantage en nature valorisé (si présent)
  if (deal.has_in_kind) {
    items.push({
      id: "in_kind",
      label: "Avantage en nature décrit et valorisé",
      status:
        nonEmpty(deal.in_kind_description) && inKind > 0 ? "ok" : "missing",
      hint: "La valeur (prix public TTC) compte dans le seuil de 1 000 €.",
    })
  }

  // 4. Droits d'exploitation (PI)
  items.push({
    id: "ip",
    label: "Durée d'exploitation des contenus définie",
    status: nonEmpty(deal.ip_rights_duration) ? "ok" : "missing",
    hint: "Précisez combien de temps la marque peut réutiliser vos contenus.",
  })

  // 5. Exclusivité (si activée)
  if (deal.exclusivity) {
    items.push({
      id: "exclusivity",
      label: "Exclusivité précisée (secteur, durée)",
      status: nonEmpty(deal.exclusivity_details) ? "ok" : "warning",
      hint: "Une exclusivité doit être bornée dans le temps et le périmètre.",
    })
  }

  // 6. Droit applicable
  items.push({
    id: "law",
    label: "Droit français applicable",
    status: deal.french_law_applicable ? "ok" : "warning",
    hint: "Recommandé pour un créateur résidant en France.",
  })

  // 7. Identité de la marque (annonceur)
  items.push({
    id: "brand_legal",
    label: "Raison sociale de la marque renseignée",
    status: nonEmpty(brand?.legal_name) ? "ok" : "warning",
    hint: "Le contrat doit identifier précisément l'annonceur.",
  })
  items.push({
    id: "brand_id_number",
    label: "SIRET / N° TVA de la marque",
    status: nonEmpty(brand?.siret_or_vat) ? "ok" : "warning",
    hint: "Identifiant légal de l'annonceur.",
  })
  items.push({
    id: "brand_address",
    label: "Adresse de la marque",
    status: nonEmpty(brand?.address_line) ? "ok" : "warning",
  })

  // 8. Identité du créateur (pour la facture)
  items.push({
    id: "creator_siret",
    label: "Votre SIRET renseigné",
    status: nonEmpty(profile?.siret) ? "ok" : "warning",
    hint: "Obligatoire pour émettre une facture conforme.",
  })

  // 9. Contrat écrit obligatoire au-delà du seuil
  items.push({
    id: "threshold",
    label: aboveThreshold
      ? `Seuil de ${threshold} € atteint : contrat écrit obligatoire`
      : `Sous le seuil de ${threshold} € (contrat écrit recommandé)`,
    status: "ok",
    hint: aboveThreshold
      ? "La loi impose un contrat écrit. Brandeal le génère pour vous."
      : "Vous pouvez quand même formaliser pour vous protéger.",
  })

  const okCount = items.filter((i) => i.status === "ok").length
  const missing = items.some((i) => i.status === "missing")

  return {
    items,
    okCount,
    total: items.length,
    compliant: !missing,
  }
}
