import { AlertTriangle, Info } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatEur } from "@/lib/format"
import {
  paidRevenueForYear,
  revenueByMonth,
  revenueForecast,
} from "@/lib/stats"
import { computeFiscalSnapshot, nextUrssafDeadline } from "@/lib/fiscal"
import { FISCAL_REFERENCE } from "@/lib/config"
import type { Deal, Invoice } from "@/types/database"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RevenueChart } from "@/components/revenue-chart"

export const metadata = { title: "Finances" }

function ThresholdBar({
  ratio,
  level,
}: {
  ratio: number
  level: "ok" | "approaching" | "exceeded"
}) {
  const pct = Math.min(100, ratio * 100)
  const color =
    level === "exceeded"
      ? "bg-destructive"
      : level === "approaching"
        ? "bg-amber-500"
        : "bg-primary"
  return (
    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
      <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default async function FinancesPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const [{ data: dealsRaw }, { data: invoicesRaw }] = await Promise.all([
    supabase.from("deals").select("*").is("deleted_at", null),
    supabase.from("invoices").select("*").is("deleted_at", null),
  ])

  const deals = (dealsRaw as Deal[]) ?? []
  const invoices = (invoicesRaw as Invoice[]) ?? []

  const months = revenueByMonth(deals, invoices, year)
  const forecast = revenueForecast(deals, invoices, year)
  const paidYtd = paidRevenueForYear(invoices, year)
  const fiscal = computeFiscalSnapshot(paidYtd)
  const deadline = nextUrssafDeadline("monthly")

  void user

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finances</h1>
        <p className="text-muted-foreground">
          Prévision de chiffre d&apos;affaires et suivi fiscal pour {year}.
        </p>
      </div>

      {/* Prévision CA */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Encaissé {year}</CardDescription>
            <CardTitle className="text-2xl">
              {formatEur(forecast.paidYtd)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attendu (carnet)</CardDescription>
            <CardTitle className="text-2xl">
              {formatEur(forecast.expectedRemaining)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardDescription>Prévision annuelle</CardDescription>
            <CardTitle className="text-2xl">
              {formatEur(forecast.projectedAnnual)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenus par mois</CardTitle>
          <CardDescription>
            Factures encaissées et partenariats attendus, mois par mois.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={months} />
        </CardContent>
      </Card>

      {/* Assistant fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assistant fiscal</CardTitle>
          <CardDescription>
            Repères micro-entrepreneur (prestations de services).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-xs">CA encaissé</p>
              <p className="text-lg font-semibold">{formatEur(fiscal.revenueYtd)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                Cotisations estimées ({Math.round(FISCAL_REFERENCE.urssafRate * 100)} %)
              </p>
              <p className="text-lg font-semibold">
                {formatEur(fiscal.estimatedCharges)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Net estimé</p>
              <p className="text-lg font-semibold">{formatEur(fiscal.netEstimate)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Seuil de franchise en base de TVA</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatEur(fiscal.revenueYtd)} / {formatEur(fiscal.vatThreshold)}
                </span>
              </div>
              <ThresholdBar ratio={fiscal.vatRatio} level={fiscal.vatLevel} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Plafond du régime micro-entrepreneur</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatEur(fiscal.revenueYtd)} / {formatEur(fiscal.microCeiling)}
                </span>
              </div>
              <ThresholdBar ratio={fiscal.microRatio} level={fiscal.microLevel} />
            </div>
          </div>

          <div className="bg-muted/40 flex items-center justify-between rounded-md border p-3 text-sm">
            <span>Prochaine déclaration URSSAF (estimée)</span>
            <span className="font-medium">
              dans {deadline.daysLeft} jour{deadline.daysLeft > 1 ? "s" : ""}
            </span>
          </div>

          {fiscal.alerts.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{a}</p>
            </div>
          ))}

          <div className="text-muted-foreground flex items-start gap-2 text-xs">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <p>
              Repères indicatifs {FISCAL_REFERENCE.year} (à vérifier). Ne
              constitue pas un conseil fiscal. Les seuils et taux exacts sont
              sur{" "}
              <a
                href="https://www.autoentrepreneur.urssaf.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                autoentrepreneur.urssaf.fr
              </a>{" "}
              et{" "}
              <a
                href="https://www.impots.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                impots.gouv.fr
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
