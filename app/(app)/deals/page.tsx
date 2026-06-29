import Link from "next/link"
import { Plus } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatEur } from "@/lib/format"
import type { Deal } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DealStatusBadge } from "@/components/deal-status-badge"
import { DealDeleteButton } from "@/components/deal-delete-button"

export const metadata = { title: "Partenariats" }

export default async function DealsPage() {
  await requireUser()
  const supabase = await createClient()

  const [{ data: dealsRaw }, { data: brandsRaw }] = await Promise.all([
    supabase
      .from("deals")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name").is("deleted_at", null),
  ])

  const deals = (dealsRaw as Deal[]) ?? []
  const brandName = new Map(
    (brandsRaw ?? []).map((b) => [b.id as string, b.name as string])
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Partenariats
          </h1>
          <p className="text-muted-foreground">
            Tous vos partenariats, du devis au paiement.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/deals/new" />}>
          <Plus className="size-4" />
          Nouveau partenariat
        </Button>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun partenariat pour l&apos;instant</CardTitle>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/deals/new" />}>
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
                <TableHead className="w-10" />
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
                    <TableCell>
                      <DealDeleteButton id={d.id} title={d.title} />
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
