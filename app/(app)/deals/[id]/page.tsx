import Link from "next/link"
import { notFound } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { getActiveLegalTemplate } from "@/lib/legal"
import { createClient } from "@/lib/supabase/server"
import { STORAGE_BUCKETS } from "@/lib/config"
import { formatDate, formatEur } from "@/lib/format"
import { CONTENT_TYPES, IP_DURATIONS } from "@/lib/validations/deal"
import type { Brand, Contract, Deal, Invoice } from "@/types/database"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DealActions } from "@/components/deal-actions"
import { DealStatusBadge } from "@/components/deal-status-badge"
import { InvoiceSection } from "@/components/invoice-section"
import { LegalDisclaimer } from "@/components/legal-disclaimer"

function labelOf(
  list: readonly { value: string; label: string }[],
  value: string | null
) {
  if (!value) return "—"
  return list.find((x) => x.value === value)?.label ?? value
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Deal>()
  if (!deal) notFound()

  const [{ data: brand }, { data: contract }, legal] = await Promise.all([
    supabase
      .from("brands")
      .select("*")
      .eq("id", deal.brand_id)
      .maybeSingle<Brand>(),
    supabase
      .from("contracts")
      .select("*")
      .eq("deal_id", deal.id)
      .is("deleted_at", null)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle<Contract>(),
    getActiveLegalTemplate(),
  ])

  let downloadUrl: string | null = null
  if (contract?.pdf_storage_path) {
    const { data: signed } = await supabase.storage
      .from(STORAGE_BUCKETS.contracts)
      .createSignedUrl(contract.pdf_storage_path, 3600)
    downloadUrl = signed?.signedUrl ?? null
  }

  const { data: invoicesRaw } = await supabase
    .from("invoices")
    .select("*")
    .eq("deal_id", deal.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  const invoices = await Promise.all(
    ((invoicesRaw as Invoice[]) ?? []).map(async (inv) => {
      let url: string | null = null
      if (inv.pdf_storage_path) {
        const { data: s } = await supabase.storage
          .from(STORAGE_BUCKETS.invoices)
          .createSignedUrl(inv.pdf_storage_path, 3600)
        url = s?.signedUrl ?? null
      }
      return {
        id: inv.id,
        number: inv.invoice_number,
        date: inv.issue_date,
        url,
      }
    })
  )

  const canInvoice = deal.status === "signed" || deal.status === "paid"
  const total =
    Number(deal.cash_amount_eur ?? 0) + Number(deal.in_kind_value_eur ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {deal.title}
            </h1>
            <DealStatusBadge status={deal.status} />
          </div>
          <p className="text-muted-foreground">{brand?.name ?? "Marque"}</p>
        </div>
        <Link href="/dashboard" className="text-sm underline">
          ← Retour
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contrat de partenariat</CardTitle>
          <CardDescription>
            {contract
              ? `Dernière version générée le ${formatDate(contract.generated_at)}.`
              : "Aucun contrat généré pour l'instant."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {legal ? <LegalDisclaimer text={legal.clauses.disclaimer} /> : null}
          <DealActions
            dealId={deal.id}
            status={deal.status}
            hasContract={!!contract}
            downloadUrl={downloadUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
          <CardDescription>
            Facturation conforme (numérotation séquentielle, mentions légales
            françaises).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceSection
            dealId={deal.id}
            canInvoice={canInvoice}
            invoices={invoices}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails du partenariat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Mission" value={deal.mission_description} full />
          <Row label="Plateformes" value={deal.platforms.join(", ") || "—"} />
          <Row
            label="Type de contenu"
            value={labelOf(CONTENT_TYPES, deal.content_type)}
          />
          <Row
            label="Livrables"
            value={String(deal.deliverables_count ?? "—")}
          />
          <Row
            label="Période"
            value={`${formatDate(deal.start_date)} → ${formatDate(deal.end_date)}`}
          />
          <Row label="Rémunération" value={formatEur(deal.cash_amount_eur)} />
          {deal.in_kind_value_eur && Number(deal.in_kind_value_eur) > 0 ? (
            <Row
              label="Avantage en nature"
              value={`${deal.in_kind_description ?? ""} — ${formatEur(
                deal.in_kind_value_eur
              )}`}
            />
          ) : null}
          <Row label="Total (cash + nature)" value={formatEur(total)} />
          <Row
            label="Droits d'exploitation"
            value={labelOf(IP_DURATIONS, deal.ip_rights_duration)}
          />
          <Row
            label="Exclusivité"
            value={deal.exclusivity ? deal.exclusivity_details || "Oui" : "Non"}
          />
          <Row
            label="Droit applicable"
            value={
              deal.french_law_applicable ? "Droit français" : "Non précisé"
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  label,
  value,
  full,
}: {
  label: string
  value: string
  full?: boolean
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="break-words">{value}</p>
    </div>
  )
}
