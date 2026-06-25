import Link from "next/link"
import { notFound } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { getActiveLegalTemplate } from "@/lib/legal"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatEur } from "@/lib/format"
import { CONTENT_TYPES, IP_DURATIONS } from "@/lib/validations/deal"
import type { Brand, Deal } from "@/types/database"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DealStatusBadge } from "@/components/deal-status-badge"
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

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", deal.brand_id)
    .maybeSingle<Brand>()

  const legal = await getActiveLegalTemplate()
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
            value={
              deal.exclusivity
                ? deal.exclusivity_details || "Oui"
                : "Non"
            }
          />
          <Row
            label="Droit applicable"
            value={
              deal.french_law_applicable ? "Droit français" : "Non précisé"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contrat</CardTitle>
          <CardDescription>
            La génération du PDF du contrat est branchée en Phase 5.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {legal ? <LegalDisclaimer text={legal.clauses.disclaimer} /> : null}
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
