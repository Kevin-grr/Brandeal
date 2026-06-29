import { AlertTriangle, Check, Circle, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"

type StepState = "done" | "current" | "todo"

interface TimelineStep {
  label: string
  state: StepState
  date?: string | null
  note?: string
}

export interface DealTimelineData {
  hasQuote: boolean
  quoteAccepted: boolean
  hasContract: boolean
  signedAt: string | null
  publishedAt: string | null
  hasInvoice: boolean
  sentAt: string | null
  paidAt: string | null
  /** Jours depuis l'envoi de la facture si non payée. */
  daysUnpaid: number | null
}

function buildSteps(d: DealTimelineData): TimelineStep[] {
  const steps: TimelineStep[] = []

  steps.push({
    label: "Devis",
    state: d.quoteAccepted ? "done" : d.hasQuote ? "current" : "todo",
    note: d.hasQuote
      ? d.quoteAccepted
        ? "Accepté"
        : "Envoyé, en attente"
      : "Optionnel",
  })

  steps.push({
    label: "Contrat signé",
    state: d.signedAt ? "done" : d.hasContract ? "current" : "todo",
    date: d.signedAt,
    note: d.signedAt
      ? undefined
      : d.hasContract
        ? "Généré, en attente de signature"
        : "À générer",
  })

  steps.push({
    label: "Contenu publié",
    state: d.publishedAt ? "done" : d.signedAt ? "current" : "todo",
    date: d.publishedAt,
  })

  steps.push({
    label: "Facture envoyée",
    state: d.sentAt ? "done" : d.hasInvoice ? "current" : "todo",
    date: d.sentAt,
    note: d.hasInvoice && !d.sentAt ? "Générée" : undefined,
  })

  steps.push({
    label: "Paiement reçu",
    state: d.paidAt ? "done" : d.sentAt ? "current" : "todo",
    date: d.paidAt,
    note:
      !d.paidAt && d.daysUnpaid != null && d.daysUnpaid > 0
        ? `En attente depuis ${d.daysUnpaid} jour${d.daysUnpaid > 1 ? "s" : ""}`
        : undefined,
  })

  return steps
}

export function DealTimeline({ data }: { data: DealTimelineData }) {
  const steps = buildSteps(data)
  const lateReminder =
    !data.paidAt && data.daysUnpaid != null && data.daysUnpaid >= 14

  return (
    <div className="space-y-4">
      <ol className="relative space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  s.state === "done" &&
                    "border-primary bg-primary text-primary-foreground",
                  s.state === "current" &&
                    "border-amber-500 text-amber-600 dark:text-amber-400",
                  s.state === "todo" && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {s.state === "done" ? (
                  <Check className="size-3.5" />
                ) : s.state === "current" ? (
                  <Clock className="size-3.5" />
                ) : (
                  <Circle className="size-2.5" />
                )}
              </span>
              {i < steps.length - 1 && (
                <span className="bg-border my-1 w-px flex-1" />
              )}
            </div>
            <div className="pb-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  s.state === "todo" && "text-muted-foreground"
                )}
              >
                {s.label}
              </p>
              {s.date && (
                <p className="text-muted-foreground text-xs">
                  {formatDate(s.date)}
                </p>
              )}
              {s.note && (
                <p className="text-muted-foreground text-xs">{s.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {lateReminder && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Facture impayée depuis {data.daysUnpaid} jours. Pensez à relancer la
            marque.
          </p>
        </div>
      )}
    </div>
  )
}
