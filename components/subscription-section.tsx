"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import type { Plan } from "@/types/database"
import { Button } from "@/components/ui/button"

const PLAN_LABELS: Record<Plan, string> = {
  free: "Gratuit",
  creator: "Créateur",
  studio: "Studio",
  expert: "Expert",
}

const PLAN_DESC: Record<Plan, string> = {
  free: "Jusqu'à 2 partenariats/mois. Passez au Créateur pour débloquer les contrats illimités.",
  creator: "Contrats et factures illimités, sans watermark.",
  studio: "Signature électronique + relances automatiques incluses.",
  expert: "Analyse IA des contrats entrants + profils illimités.",
}

export function SubscriptionSection({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    const res = await fetch("/api/stripe/portal", { method: "POST" })
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

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Plan actuel :{" "}
        <span className="font-medium">{PLAN_LABELS[plan]}</span>
        {" — "}
        {PLAN_DESC[plan]}
      </p>
      {plan === "free" ? (
        <Button nativeButton={false} render={<Link href="/pricing" />}>
          Voir les offres
        </Button>
      ) : (
        <Button variant="outline" onClick={openPortal} disabled={loading}>
          {loading ? "Redirection…" : "Gérer mon abonnement"}
        </Button>
      )}
    </div>
  )
}
