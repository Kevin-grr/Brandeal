"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calculator } from "lucide-react"
import { toast } from "sonner"

import type { Brand } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PricingEstimator } from "@/components/pricing-estimator"

export function QuoteForm({
  brands,
  onCreated,
}: {
  brands: Brand[]
  onCreated?: () => void
}) {
  const router = useRouter()
  const [brandId, setBrandId] = useState<string>(brands[0]?.id ?? "")
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [validUntil, setValidUntil] = useState("")
  const [notes, setNotes] = useState("")
  const [showEstimator, setShowEstimator] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!brandId) {
      toast.error("Sélectionnez une marque.")
      return
    }
    if (!label.trim()) {
      toast.error("Décrivez la prestation.")
      return
    }
    setLoading(true)
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_id: brandId,
        label,
        amount_ht: amount,
        valid_until: validUntil || undefined,
        notes: notes || undefined,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      quoteNumber?: string
      error?: string
    }
    setLoading(false)
    if (!res.ok) {
      toast.error("Création impossible", { description: data.error })
      return
    }
    toast.success(`Devis ${data.quoteNumber} créé`)
    setLabel("")
    setAmount(0)
    setNotes("")
    onCreated?.()
    router.refresh()
  }

  if (brands.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Créez d&apos;abord une marque pour établir un devis.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Marque</Label>
        <Select value={brandId} onValueChange={(v) => setBrandId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisir une marque" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quote-label">Prestation</Label>
        <Input
          id="quote-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex. 1 Reel Instagram + 3 stories"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quote-amount">Montant HT (€)</Label>
          <Input
            id="quote-amount"
            type="number"
            inputMode="decimal"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quote-valid">Valable jusqu&apos;au</Label>
          <Input
            id="quote-valid"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowEstimator((s) => !s)}
        className="text-primary flex items-center gap-1.5 text-sm hover:underline"
      >
        <Calculator className="size-4" />
        {showEstimator ? "Masquer" : "Combien facturer ? Estimer un tarif"}
      </button>

      {showEstimator && (
        <div className="rounded-lg border p-4">
          <PricingEstimator onUsePrice={(p) => setAmount(p)} />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="quote-notes">Notes (optionnel)</Label>
        <Textarea
          id="quote-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Conditions, délais de livraison…"
        />
      </div>

      <Button onClick={submit} disabled={loading} className="w-full">
        {loading ? "Création…" : "Créer le devis"}
      </Button>
    </div>
  )
}
