"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PaywallDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [loading, setLoading] = useState(false)

  async function upgrade() {
    setLoading(true)
    const res = await fetch("/api/stripe/checkout", { method: "POST" })
    const body = (await res.json().catch(() => ({}))) as {
      url?: string
      error?: string
    }
    if (!res.ok || !body.url) {
      setLoading(false)
      toast.error("Paiement indisponible", { description: body.error })
      return
    }
    window.location.href = body.url
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Passez au Pro pour des partenariats illimités
          </DialogTitle>
          <DialogDescription>
            Le plan gratuit est limité à 2 partenariats par mois. Le plan Pro
            débloque les contrats et factures illimités, sans watermark.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" render={<Link href="/pricing" />}>
            Voir les offres
          </Button>
          <Button onClick={upgrade} disabled={loading}>
            {loading ? "Redirection…" : "Passer au Pro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
