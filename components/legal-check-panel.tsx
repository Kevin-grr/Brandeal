"use client"

import { AlertTriangle, Check, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { runLegalCheck, type CheckStatus } from "@/lib/legal-check"
import type { Brand, Profile } from "@/types/database"
import type { DealFormValues } from "@/lib/validations/deal"

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok")
    return <Check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
  if (status === "warning")
    return (
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
    )
  return <X className="text-destructive mt-0.5 size-4 shrink-0" />
}

export function LegalCheckPanel({
  deal,
  brand,
  profile,
  yearlyTotal,
  threshold,
}: {
  deal: Partial<DealFormValues>
  brand?: Brand | null
  profile?: Profile | null
  yearlyTotal: number
  threshold: number
}) {
  const result = runLegalCheck({ deal, brand, profile, yearlyTotal, threshold })

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Vérification de conformité</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            result.compliant
              ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
              : "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          )}
        >
          {result.okCount}/{result.total} OK
        </span>
      </div>
      <ul className="space-y-2">
        {result.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            <StatusIcon status={item.status} />
            <div>
              <span
                className={cn(
                  item.status === "missing" && "text-destructive",
                  item.status === "warning" &&
                    "text-amber-700 dark:text-amber-300"
                )}
              >
                {item.label}
              </span>
              {item.status !== "ok" && item.hint && (
                <p className="text-muted-foreground text-xs">{item.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-3 text-xs">
        Vérification automatique d&apos;aide à la rédaction. Ne remplace pas une
        relecture juridique.
      </p>
    </div>
  )
}
