/**
 * Statistiques et prévisions (logique pure, testable).
 * Opère sur les lignes `deals` et `invoices` déjà chargées.
 */

import type { Deal, Invoice } from "@/types/database"

const dealAmount = (d: Deal): number =>
  Number(d.cash_amount_eur ?? 0) + Number(d.in_kind_value_eur ?? 0)

const daysBetween = (a: string, b: string): number =>
  Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  )

export interface BrandStats {
  collaborations: number
  totalEur: number
  avgPaymentDays: number | null
  unpaidCount: number
  unpaidEur: number
  alwaysPaid: boolean
  lastCollaborationAt: string | null
}

/** Stats d'une marque à partir de ses deals et factures. */
export function brandStats(deals: Deal[], invoices: Invoice[]): BrandStats {
  const collaborations = deals.length
  const totalEur = deals.reduce((s, d) => s + dealAmount(d), 0)

  // Délai de paiement moyen : sent_at → paid_at sur les deals payés.
  const delays: number[] = []
  for (const d of deals) {
    if (d.paid_at && d.sent_at) {
      const dd = daysBetween(d.sent_at, d.paid_at)
      if (Number.isFinite(dd) && dd >= 0) delays.push(dd)
    }
  }
  const avgPaymentDays =
    delays.length > 0
      ? Math.round(delays.reduce((s, n) => s + n, 0) / delays.length)
      : null

  const unpaid = invoices.filter((i) => i.status !== "paid")
  const unpaidEur = unpaid.reduce((s, i) => s + Number(i.amount_ht ?? 0), 0)

  const lastCollaborationAt =
    deals
      .map((d) => d.created_at)
      .filter((x): x is string => !!x)
      .sort()
      .at(-1) ?? null

  return {
    collaborations,
    totalEur,
    avgPaymentDays,
    unpaidCount: unpaid.length,
    unpaidEur,
    alwaysPaid: unpaid.length === 0 && collaborations > 0,
    lastCollaborationAt,
  }
}

export interface MonthlyRevenue {
  month: string // "2026-01"
  paid: number
  expected: number
}

/**
 * Revenu par mois sur l'année : `paid` = factures payées, `expected` = deals
 * en cours non encore payés (carnet de commandes).
 */
export function revenueByMonth(
  deals: Deal[],
  invoices: Invoice[],
  year: number
): MonthlyRevenue[] {
  const months: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, "0")}`,
    paid: 0,
    expected: 0,
  }))

  for (const inv of invoices) {
    if (inv.status !== "paid") continue
    const d = new Date(inv.issue_date)
    if (d.getFullYear() !== year) continue
    months[d.getMonth()].paid += Number(inv.amount_ht ?? 0)
  }

  for (const deal of deals) {
    if (deal.paid_at) continue // déjà compté via la facture payée
    const ref = deal.start_date ?? deal.created_at
    if (!ref) continue
    const d = new Date(ref)
    if (d.getFullYear() !== year) continue
    months[d.getMonth()].expected += dealAmount(deal)
  }

  return months
}

export interface RevenueForecast {
  paidYtd: number
  expectedRemaining: number
  projectedAnnual: number
}

/** Prévision annuelle : encaissé + carnet de commandes attendu. */
export function revenueForecast(
  deals: Deal[],
  invoices: Invoice[],
  year: number
): RevenueForecast {
  const months = revenueByMonth(deals, invoices, year)
  const paidYtd = months.reduce((s, m) => s + m.paid, 0)
  const expectedRemaining = months.reduce((s, m) => s + m.expected, 0)
  return {
    paidYtd,
    expectedRemaining,
    projectedAnnual: paidYtd + expectedRemaining,
  }
}

/** CA encaissé (factures payées) de l'année — base de l'assistant fiscal. */
export function paidRevenueForYear(invoices: Invoice[], year: number): number {
  return invoices
    .filter(
      (i) => i.status === "paid" && new Date(i.issue_date).getFullYear() === year
    )
    .reduce((s, i) => s + Number(i.amount_ht ?? 0), 0)
}
