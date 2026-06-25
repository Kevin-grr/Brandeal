/**
 * Logique pure du seuil légal (séparée pour être testable).
 * `get_brand_yearly_total` fournit le total déjà cumulé (hors deal en cours) ;
 * on y ajoute la rémunération du deal en cours pour obtenir le total projeté.
 */

export function computeNewTotal(
  existingTotal: number,
  cash: number,
  inKindValue: number,
  hasInKind: boolean
): number {
  const safe = (n: number) => (Number.isFinite(n) ? n : 0)
  return safe(existingTotal) + safe(cash) + (hasInKind ? safe(inKindValue) : 0)
}

/** Le seuil est franchi dès qu'on l'atteint (≥), pas seulement au-dessus. */
export function crossesThreshold(total: number, threshold: number): boolean {
  return total >= threshold
}
