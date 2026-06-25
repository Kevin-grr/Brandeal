import { AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Bandeau d'avertissement juridique. Le texte exact provient de la base
 * (legal_template_versions.mandatory_clauses.disclaimer) — voir garde-fou #3 :
 * jamais afficher un contrat/une facture sans son disclaimer.
 */
export function LegalDisclaimer({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
        className
      )}
      role="note"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">Avertissement juridique</p>
        <p className="mt-0.5">{text}</p>
      </div>
    </div>
  )
}
