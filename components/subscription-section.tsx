"use client"

import { useState } from "react"
import { toast } from "sonner"

import { PRO_PRICE_EUR } from "@/lib/config"
import type { Plan } from "@/types/database"
import { Button } from "@/components/ui/button"

export function SubscriptionSection({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false)

  async function go(endpoint: "checkout" | "portal") {
    setLoading(true)
    const res = await fetch(`/api/stripe/${endpoint}`, { method: "POST" })
    const body = (await res.json().catch(() => ({}))) as {
      url?: string
      error?: string
    }
    if (!res.ok || !body.url) {
      setLoading(false)
      toast.error("Stripe indisponible", { description: body.error })
      return
    }
    window.location.href = body.url
  }

  const price = PRO_PRICE_EUR.toFixed(2).replace(".", ",")

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Plan actuel :{" "}
        <span className="font-medium">
          {plan === "pro" ? "Pro" : "Gratuit"}
        </span>
        {plan === "pro"
          ? " — contrats et factures illimités, sans watermark."
          : ` — jusqu'à 2 partenariats/mois. Passez au Pro pour ${price} €/mois.`}
      </p>
      {plan === "pro" ? (
        <Button
          variant="outline"
          onClick={() => go("portal")}
          disabled={loading}
        >
          {loading ? "Redirection…" : "Gérer mon abonnement"}
        </Button>
      ) : (
        <Button onClick={() => go("checkout")} disabled={loading}>
          {loading ? "Redirection…" : "Passer au Pro"}
        </Button>
      )}
    </div>
  )
}
