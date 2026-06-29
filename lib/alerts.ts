/**
 * Construit les alertes proactives du dashboard intelligent (logique pure).
 * Agrège seuils légaux, factures impayées, échéance fiscale et contrats à
 * renouveler en une liste priorisée.
 */

import type { Deal, Invoice } from "@/types/database"

export type AlertSeverity = "critical" | "warning" | "info"

export interface DashboardAlert {
  id: string
  severity: AlertSeverity
  message: string
  href?: string
}

export interface BrandTotal {
  brandId: string
  name: string
  total: number
  hasSigned: boolean
}

interface BuildArgs {
  deals: Deal[]
  invoices: Invoice[]
  brandTotals: BrandTotal[]
  threshold: number
  urssafDaysLeft?: number
}

const severityRank: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

export function buildDashboardAlerts({
  deals,
  invoices,
  brandTotals,
  threshold,
  urssafDaysLeft,
}: BuildArgs): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  // 1. Seuil franchi sans contrat signé (critique).
  for (const b of brandTotals) {
    if (b.total >= threshold && !b.hasSigned) {
      alerts.push({
        id: `threshold-${b.brandId}`,
        severity: "critical",
        message: `Le seuil légal est atteint avec ${b.name} : un contrat écrit est obligatoire.`,
        href: "/dashboard",
      })
    } else if (b.total >= threshold * 0.8 && b.total < threshold) {
      // 2. Seuil approché (avertissement).
      alerts.push({
        id: `threshold-near-${b.brandId}`,
        severity: "warning",
        message: `Vous approchez du seuil légal avec ${b.name} (${Math.round(
          (b.total / threshold) * 100
        )} %).`,
        href: `/brands/${b.brandId}`,
      })
    }
  }

  // 3. Factures impayées (avertissement, agrégé).
  const unpaid = invoices.filter((i) => i.status === "sent")
  if (unpaid.length > 0) {
    const totalUnpaid = unpaid.reduce((s, i) => s + Number(i.amount_ht ?? 0), 0)
    alerts.push({
      id: "unpaid-invoices",
      severity: "warning",
      message: `${unpaid.length} facture${unpaid.length > 1 ? "s" : ""} en attente de paiement (${totalUnpaid.toFixed(
        0
      )} € HT). Pensez à relancer.`,
      href: "/finances",
    })
  }

  // 4. Échéance URSSAF proche (info).
  if (urssafDaysLeft != null && urssafDaysLeft <= 10) {
    alerts.push({
      id: "urssaf-deadline",
      severity: "info",
      message: `Votre prochaine déclaration URSSAF est dans ${urssafDaysLeft} jour${
        urssafDaysLeft > 1 ? "s" : ""
      }.`,
      href: "/finances",
    })
  }

  // 5. Contrats signés terminés depuis longtemps sans facture (info).
  const today = Date.now()
  for (const d of deals) {
    if (d.status === "signed" && d.end_date) {
      const ended = new Date(d.end_date).getTime()
      const dealHasInvoice = invoices.some((i) => i.deal_id === d.id)
      if (ended < today && !dealHasInvoice) {
        alerts.push({
          id: `to-invoice-${d.id}`,
          severity: "info",
          message: `Le partenariat « ${d.title} » est terminé : pensez à facturer.`,
          href: `/deals/${d.id}`,
        })
      }
    }
  }

  return alerts.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity]
  )
}
