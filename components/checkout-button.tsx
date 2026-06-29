"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { Plan } from "@/types/database"
import { Button } from "@/components/ui/button"

type PaidPlan = Exclude<Plan, "free">

export function CheckoutButton({
  children,
  className,
  plan,
  interval = "month",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  plan: PaidPlan
  interval?: "month" | "year"
  variant?: "default" | "outline"
}) {
  const [loading, setLoading] = useState(false)

  async function go() {
    setLoading(true)
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    })
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
    <Button
      onClick={go}
      disabled={loading}
      className={className}
      variant={variant}
    >
      {loading ? "Redirection…" : children}
    </Button>
  )
}
