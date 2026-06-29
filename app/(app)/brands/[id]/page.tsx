import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, Star } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatEur } from "@/lib/format"
import { brandStats } from "@/lib/stats"
import type { Brand, Deal, Invoice } from "@/types/database"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DealStatusBadge } from "@/components/deal-status-badge"

export const metadata = { title: "Fiche marque" }

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Brand>()
  if (!brand) notFound()

  const { data: dealsRaw } = await supabase
    .from("deals")
    .select("*")
    .eq("brand_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  const deals = (dealsRaw as Deal[]) ?? []

  const dealIds = deals.map((d) => d.id)
  let invoices: Invoice[] = []
  if (dealIds.length > 0) {
    const { data: invRaw } = await supabase
      .from("invoices")
      .select("*")
      .in("deal_id", dealIds)
      .is("deleted_at", null)
    invoices = (invRaw as Invoice[]) ?? []
  }

  const stats = brandStats(deals, invoices)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{brand.name}</h1>
          <p className="text-muted-foreground">
            {brand.legal_name || "Annonceur"}
            {brand.siret_or_vat ? ` · ${brand.siret_or_vat}` : ""}
          </p>
        </div>
        <Link href="/brands" className="text-sm underline">
          ← Retour
        </Link>
      </div>

      {/* Stats clés */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Collaborations</CardDescription>
            <CardTitle className="text-2xl">{stats.collaborations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total généré</CardDescription>
            <CardTitle className="text-2xl">
              {formatEur(stats.totalEur)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Délai de paiement moyen</CardDescription>
            <CardTitle className="text-2xl">
              {stats.avgPaymentDays != null
                ? `${stats.avgPaymentDays} j`
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Factures impayées</CardDescription>
            <CardTitle className="text-2xl">
              {stats.unpaidCount > 0 ? (
                <span className="text-destructive">
                  {stats.unpaidCount} · {formatEur(stats.unpaidEur)}
                </span>
              ) : (
                "0"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {stats.alwaysPaid && (
        <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200">
          <CheckCircle2 className="size-4" />
          Toujours payé, aucune facture en souffrance.
          <Star className="ml-auto size-4 fill-current" />
        </div>
      )}

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Contact" value={brand.contact_name} />
          <Field label="Email" value={brand.contact_email} />
          <Field label="Adresse" value={brand.address_line} />
          <Field label="Pays fiscal" value={brand.fiscal_country} />
          {brand.notes ? (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-xs">Notes</p>
              <p className="break-words">{brand.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des collaborations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {deals.length === 0 ? (
            <p className="text-muted-foreground p-6 text-sm">
              Aucune collaboration enregistrée avec cette marque.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partenariat</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <Link href={`/deals/${d.id}`} className="hover:underline">
                        {d.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <DealStatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatEur(
                        Number(d.cash_amount_eur ?? 0) +
                          Number(d.in_kind_value_eur ?? 0)
                      )}
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      {formatDate(d.start_date ?? d.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="break-words">{value || "—"}</p>
    </div>
  )
}
