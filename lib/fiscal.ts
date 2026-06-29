/**
 * Assistant fiscal du micro-entrepreneur (logique pure, testable).
 *
 * ⚠️ Aide à la décision uniquement. Les seuils et taux proviennent de
 * `FISCAL_REFERENCE` (lib/config) et doivent être vérifiés chaque année.
 * Ne constitue pas un conseil fiscal ni comptable.
 */

import { FISCAL_REFERENCE } from "@/lib/config"

export type ThresholdLevel = "ok" | "approaching" | "exceeded"

export interface FiscalSnapshot {
  year: number
  revenueYtd: number
  estimatedCharges: number
  netEstimate: number
  /** Progression vers le seuil de franchise TVA (0..1+). */
  vatRatio: number
  vatLevel: ThresholdLevel
  vatThreshold: number
  vatThresholdMajored: number
  /** Progression vers le plafond du régime micro (0..1+). */
  microRatio: number
  microLevel: ThresholdLevel
  microCeiling: number
  alerts: string[]
}

function level(ratio: number): ThresholdLevel {
  if (ratio >= 1) return "exceeded"
  if (ratio >= 0.8) return "approaching"
  return "ok"
}

/**
 * Calcule un instantané fiscal à partir du chiffre d'affaires encaissé sur
 * l'année. `revenueYtd` = somme des factures payées (HT) de l'année.
 */
export function computeFiscalSnapshot(revenueYtd: number): FiscalSnapshot {
  const ref = FISCAL_REFERENCE
  const revenue = Math.max(0, revenueYtd || 0)

  const estimatedCharges = revenue * ref.urssafRate
  const vatRatio = revenue / ref.vatFranchiseThreshold
  const microRatio = revenue / ref.microCeilingServices

  const vatLevel = level(vatRatio)
  const microLevel = level(microRatio)

  const alerts: string[] = []

  if (vatLevel === "exceeded") {
    alerts.push(
      "Vous avez dépassé le seuil de franchise en base de TVA : vous devez probablement facturer la TVA. Vérifiez votre situation auprès de l'URSSAF / des impôts."
    )
  } else if (vatLevel === "approaching") {
    alerts.push(
      "Vous approchez du seuil de franchise en base de TVA. Au-delà, la TVA deviendra applicable sur vos factures."
    )
  }

  if (microLevel === "exceeded") {
    alerts.push(
      "Vous avez dépassé le plafond du régime micro-entrepreneur. Un changement de régime peut être nécessaire."
    )
  } else if (microLevel === "approaching") {
    alerts.push(
      "Vous approchez du plafond de chiffre d'affaires du régime micro-entrepreneur."
    )
  }

  return {
    year: ref.year,
    revenueYtd: revenue,
    estimatedCharges,
    netEstimate: revenue - estimatedCharges,
    vatRatio,
    vatLevel,
    vatThreshold: ref.vatFranchiseThreshold,
    vatThresholdMajored: ref.vatFranchiseThresholdMajored,
    microRatio,
    microLevel,
    microCeiling: ref.microCeilingServices,
    alerts,
  }
}

/**
 * Prochaine échéance de déclaration URSSAF. Le micro-entrepreneur déclare
 * mensuellement (par défaut) ou trimestriellement. On renvoie la prochaine date
 * indicative et le nombre de jours restants.
 */
export function nextUrssafDeadline(
  frequency: "monthly" | "quarterly" = "monthly",
  from: Date = new Date()
): { date: Date; daysLeft: number } {
  // La déclaration du mois M se fait fin M+1 (≈ dernier jour). Modèle simplifié :
  // on cible le dernier jour du mois courant (mensuel) ou du prochain trimestre.
  let target: Date
  if (frequency === "monthly") {
    target = new Date(from.getFullYear(), from.getMonth() + 1, 0)
    if (target < from) {
      target = new Date(from.getFullYear(), from.getMonth() + 2, 0)
    }
  } else {
    const q = Math.floor(from.getMonth() / 3)
    target = new Date(from.getFullYear(), q * 3 + 3, 0)
    if (target < from) {
      target = new Date(from.getFullYear(), q * 3 + 6, 0)
    }
  }
  const daysLeft = Math.ceil(
    (target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  )
  return { date: target, daysLeft }
}
