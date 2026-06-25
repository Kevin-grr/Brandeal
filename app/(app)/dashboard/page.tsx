import Link from "next/link"
import { AlertTriangle, Plus } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { getActiveLegalTemplate } from "@/lib/legal"
import { LEGAL_THRESHOLD_EUR_FALLBACK } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatEur } from "@/lib/format"
import type { Deal } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DealStatusBadge } from "@/components/deal-status-badge"

export const metadata = { title: "Tableau de bord" }

export default async function DashboardPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const [{ data: dealsRaw }, { data: brandsRaw }, legal] = await Promise.all([
    supabase
      .from("deals")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name").is("deleted_at", null),
    getActiveLegalTemplate(),
  ])

  const deals = (dealsRaw as Deal[]) ?? []
  const brandName = new Map(
    (brandsRaw ?? []).map((b) => [b.id as string, b.name as string])
  )
  const threshold = Number(legal?.threshold_eur ?? LEGAL_THRESHOLD_EUR_FALLBACK)

  // Marques présentes dans des deals de l'année en cours (basé sur start_date).
  const brandIdsThisYear = [
    ...new Set(
      deals
        .filter(
          (d) => d.start_date && new Date(d.start_date).getFullYear() === year
        )
        .map((d) => d.brand_id)
    ),
  ]

  const brandTotals = await Promise.all(
    brandIdsThisYear.map(async (brandId) => {
      const { data } = await supabase.rpc("get_brand_yearly_total", {
        p_user_id: user.id,
        p_brand_id: brandId,
        p_year: year,
      })
      const hasSigned = deals.some(
        (d) =>
          d.brand_id === brandId &&
          d.start_date &&
          new Date(d.start_date).getFullYear() === year &&
          (d.status === "signed" || d.status === "paid")
      )
      return {
        brandId,
        name: brandName.get(brandId) ?? "Marque",
        total: Number(data ?? 0),
        hasSigned,
      }
    })
  )

  const alerts = brandTotals.filter((b) => b.total >= threshold && !b.hasSigned)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Vos partenariats et le suivi du seuil légal par marque.
          </p>
        </div>
        <Button render={<Link href="/deals/new" />}>
          <Plus className="size-4" />
          Nouveau partenariat
        </Button>
      </div>

      {/* Bandeaux d'alerte de seuil */}
      {alerts.map((b) => (
        <div
          key={b.brandId}
          className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            ⚠️ Le seuil légal de {formatEur(threshold)} est atteint avec{" "}
            <strong>{b.name}</strong>. Un contrat écrit est obligatoire (sous
            peine de nullité) — pensez à en générer un.
          </p>
        </div>
      ))}

      {/* Encarts de suivi par marque */}
      {brandTotals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandTotals.map((b) => {
            const pct = Math.min(100, (b.total / threshold) * 100)
            const crossed = b.total >= threshold
            return (
              <Card key={b.brandId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{b.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={
                        crossed
                          ? "text-destructive font-semibold"
                          : "font-medium"
                      }
                    >
                      {formatEur(b.total)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      / seuil {formatEur(threshold)} · {year}
                    </span>
                  </div>
                  <Progress value={pct} />
                  {crossed && !b.hasSigned && (
                    <p className="text-destructive text-xs">
                      Contrat écrit obligatoire.
                    </p>
                  )}
                  {crossed && b.hasSigned && (
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Contrat signé en place ✓
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Liste des deals */}
      {deals.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun partenariat pour l&apos;instant</CardTitle>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/deals/new" />}>
              <Plus className="size-4" />
              Créer mon premier partenariat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marque</TableHead>
                <TableHead>Partenariat</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((d) => {
                const total =
                  Number(d.cash_amount_eur ?? 0) +
                  Number(d.in_kind_value_eur ?? 0)
                return (
                  <TableRow key={d.id}>
                    <TableCell>{brandName.get(d.brand_id) ?? "—"}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/deals/${d.id}`} className="hover:underline">
                        {d.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <DealStatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatEur(total)}
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      {formatDate(d.start_date ?? d.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
