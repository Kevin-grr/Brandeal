"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function CheckoutButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  async function go() {
    setLoading(true)
    const res = await fetch("/api/stripe/checkout", { method: "POST" })
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
    <Button onClick={go} disabled={loading} className={className}>
      {loading ? "Redirection…" : children}
    </Button>
  )
}
