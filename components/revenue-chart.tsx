import { formatEur } from "@/lib/format"
import type { MonthlyRevenue } from "@/lib/stats"

const MONTH_LABELS = [
  "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D",
]

/** Graphe en barres empilées (encaissé + attendu) — pur CSS, sans dépendance. */
export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const max = Math.max(1, ...data.map((m) => m.paid + m.expected))

  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 160 }}>
        {data.map((m, i) => {
          const paidH = (m.paid / max) * 100
          const expH = (m.expected / max) * 100
          const total = m.paid + m.expected
          return (
            <div
              key={m.month}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              {total > 0 && (
                <div className="text-muted-foreground pointer-events-none absolute -top-5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
                  {formatEur(total)}
                </div>
              )}
              <div className="flex w-full flex-col justify-end" style={{ height: "100%" }}>
                <div
                  className="bg-primary/30 w-full rounded-t-sm"
                  style={{ height: `${expH}%` }}
                  title={`Attendu : ${formatEur(m.expected)}`}
                />
                <div
                  className="bg-primary w-full"
                  style={{ height: `${paidH}%` }}
                  title={`Encaissé : ${formatEur(m.paid)}`}
                />
              </div>
              <span className="text-muted-foreground mt-1 text-[10px]">
                {MONTH_LABELS[i]}
              </span>
            </div>
          )
        })}
      </div>
      <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-primary inline-block size-3 rounded-sm" />
          Encaissé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-primary/30 inline-block size-3 rounded-sm" />
          Attendu (carnet de commandes)
        </span>
      </div>
    </div>
  )
}
