"use client"

import { useState } from "react"
import { Check, Copy, Link2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function ShareDealCard({ dealId }: { dealId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    const res = await fetch(`/api/deals/${dealId}/share`, { method: "POST" })
    const body = (await res.json().catch(() => ({}))) as {
      url?: string
      error?: string
    }
    setLoading(false)
    if (!res.ok || !body.url) {
      toast.error("Lien indisponible", { description: body.error })
      return
    }
    setUrl(body.url)
  }

  async function revoke() {
    setLoading(true)
    const res = await fetch(`/api/deals/${dealId}/share`, { method: "DELETE" })
    setLoading(false)
    if (!res.ok) {
      toast.error("Révocation impossible")
      return
    }
    setUrl(null)
    toast.success("Lien révoqué")
  }

  async function copy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Lien copié")
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Espace marque</CardTitle>
        <CardDescription>
          Partagez un lien sécurisé : la marque consulte le contrat, le signe,
          télécharge la facture — sans créer de compte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {url ? (
          <>
            <div className="flex gap-2">
              <Input readOnly value={url} className="font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copy}
                aria-label="Copier le lien"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={revoke}
              disabled={loading}
              className="text-destructive"
            >
              <Trash2 className="size-4" />
              Révoquer le lien
            </Button>
          </>
        ) : (
          <Button type="button" onClick={generate} disabled={loading}>
            <Link2 className="size-4" />
            {loading ? "Génération…" : "Générer un lien de partage"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
