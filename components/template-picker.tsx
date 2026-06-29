"use client"

import {
  Calendar,
  Handshake,
  Lock,
  Percent,
  ScrollText,
  Star,
  Video,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { ContractTemplate } from "@/types/database"

const ICONS: Record<string, LucideIcon> = {
  handshake: Handshake,
  video: Video,
  percent: Percent,
  star: Star,
  lock: Lock,
  calendar: Calendar,
  scroll: ScrollText,
}

export function TemplatePicker({
  templates,
  selectedKind,
  onSelect,
}: {
  templates: ContractTemplate[]
  selectedKind: string | null
  onSelect: (t: ContractTemplate) => void
}) {
  if (templates.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Type de collaboration</p>
      <p className="text-muted-foreground text-xs">
        Choisissez un modèle : il pré-remplit les options adaptées (droits,
        exclusivité…).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {templates.map((t) => {
          const Icon = (t.icon && ICONS[t.icon]) || Handshake
          const active = selectedKind === t.kind
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "hover:border-foreground/30"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
