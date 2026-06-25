import { cn } from "@/lib/utils"
import type { DealStatus } from "@/types/database"

const STATUS_MAP: Record<DealStatus, { label: string; className: string }> = {
  draft: {
    label: "Brouillon",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  sent: {
    label: "Envoyé",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  signed: {
    label: "Signé",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  paid: {
    label: "Payé",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  cancelled: {
    label: "Annulé",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const s = STATUS_MAP[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        s.className
      )}
    >
      {s.label}
    </span>
  )
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  draft: STATUS_MAP.draft.label,
  sent: STATUS_MAP.sent.label,
  signed: STATUS_MAP.signed.label,
  paid: STATUS_MAP.paid.label,
  cancelled: STATUS_MAP.cancelled.label,
}
