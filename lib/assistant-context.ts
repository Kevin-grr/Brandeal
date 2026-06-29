import "server-only"

import { createClient } from "@/lib/supabase/server"
import { brandStats } from "@/lib/stats"
import { computeFiscalSnapshot } from "@/lib/fiscal"
import type { Brand, Deal, Invoice } from "@/types/database"

const eur = (n: number) =>
  `${Number(n ?? 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} €`

const frDate = (d: string | null) =>
  d ? new Intl.DateTimeFormat("fr-FR").format(new Date(d)) : "—"

/**
 * Construit un instantané texte, compact et borné, des données du créateur
 * connecté, destiné à servir de contexte à l'assistant IA. RLS garantit qu'on
 * ne lit que ses propres données. Aucune donnée bancaire n'est incluse.
 */
export async function buildAssistantContext(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "Aucune donnée (utilisateur non authentifié)."

  const year = new Date().getFullYear()

  const [{ data: brandsRaw }, { data: dealsRaw }, { data: invoicesRaw }] =
    await Promise.all([
      supabase.from("brands").select("*").is("deleted_at", null),
      supabase
        .from("deals")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("invoices")
        .select("*")
        .is("deleted_at", null)
        .limit(300),
    ])

  const brands = (brandsRaw as Brand[]) ?? []
  const deals = (dealsRaw as Deal[]) ?? []
  const invoices = (invoicesRaw as Invoice[]) ?? []

  const brandName = new Map(brands.map((b) => [b.id, b.name]))

  // Stats par marque.
  const brandLines = brands.map((b) => {
    const bDeals = deals.filter((d) => d.brand_id === b.id)
    const bInvoices = invoices.filter((i) =>
      bDeals.some((d) => d.id === i.deal_id)
    )
    const s = brandStats(bDeals, bInvoices)
    return `- ${b.name} : ${s.collaborations} collab(s), total ${eur(
      s.totalEur
    )}, délai paiement moyen ${
      s.avgPaymentDays != null ? s.avgPaymentDays + " j" : "n/a"
    }, ${s.unpaidCount} facture(s) impayée(s) (${eur(s.unpaidEur)})${
      s.alwaysPaid ? ", toujours payé" : ""
    }.`
  })

  // Partenariats.
  const dealLines = deals.map((d) => {
    const total =
      Number(d.cash_amount_eur ?? 0) + Number(d.in_kind_value_eur ?? 0)
    return `- « ${d.title} » (${brandName.get(d.brand_id) ?? "?"}) — statut ${
      d.status
    }, ${eur(total)}, période ${frDate(d.start_date)}→${frDate(
      d.end_date
    )}, plateformes ${d.platforms.join("/") || "—"}.`
  })

  // Factures.
  const invLines = invoices.map((i) => {
    return `- ${i.invoice_number} : ${eur(Number(i.amount_ht))} HT, statut ${
      i.status
    }, émise le ${frDate(i.issue_date)} (marque ${
      i.deal_id
        ? brandName.get(deals.find((d) => d.id === i.deal_id)?.brand_id ?? "") ??
          "?"
        : "?"
    }).`
  })

  const paidYtd = invoices
    .filter(
      (i) =>
        i.status === "paid" && new Date(i.issue_date).getFullYear() === year
    )
    .reduce((s, i) => s + Number(i.amount_ht ?? 0), 0)
  const fiscal = computeFiscalSnapshot(paidYtd)

  return [
    `DATE DU JOUR : ${new Intl.DateTimeFormat("fr-FR").format(new Date())}`,
    `ANNÉE EN COURS : ${year}`,
    "",
    `RÉSUMÉ FISCAL : CA encaissé ${eur(paidYtd)}, cotisations estimées ${eur(
      fiscal.estimatedCharges
    )}, net estimé ${eur(fiscal.netEstimate)}. Seuil franchise TVA ${eur(
      fiscal.vatThreshold
    )} (${Math.round(fiscal.vatRatio * 100)} % atteint).`,
    "",
    `MARQUES (${brands.length}) :`,
    ...(brandLines.length ? brandLines : ["(aucune)"]),
    "",
    `PARTENARIATS (${deals.length}) :`,
    ...(dealLines.length ? dealLines : ["(aucun)"]),
    "",
    `FACTURES (${invoices.length}) :`,
    ...(invLines.length ? invLines : ["(aucune)"]),
  ].join("\n")
}
