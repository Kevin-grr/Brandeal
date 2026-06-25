"use client"

import { useState } from "react"

import type { Brand } from "@/types/database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { BrandForm } from "./brand-form"

/**
 * Dialog réutilisable pour créer/éditer une marque. Utilisé sur /brands et dans
 * le wizard de partenariat (création rapide inline).
 */
export function BrandDialog({
  trigger,
  initial,
  onSaved,
}: {
  trigger: React.ReactElement
  initial?: Brand | null
  onSaved?: (brand: Brand) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Modifier la marque" : "Nouvelle marque"}
          </DialogTitle>
          <DialogDescription>
            Ces informations apparaîtront sur les contrats et factures liés.
          </DialogDescription>
        </DialogHeader>
        <BrandForm
          initial={initial}
          onSaved={(brand) => {
            setOpen(false)
            onSaved?.(brand)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
