"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles, Wand2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { formatEur } from "@/lib/format"
import type { Brand } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Extracted {
  brand_name?: string
  title?: string
  mission_description?: string
  cash_amount_eur?: number
  in_kind_value_eur?: number
  in_kind_description?: string | null
  platforms?: string[]
  content_type?: string | null
  deliverables_count?: number
  start_date?: string | null
  end_date?: string | null
  ip_rights_duration?: string | null
  exclusivity?: boolean
  deadlines_notes?: string
}

export function DealImporter({
  brands,
  userId,
}: {
  brands: Brand[]
  userId: string
}) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [data, setData] = useState<Extracted | null>(null)

  // Champs éditables (les plus susceptibles d'être corrigés).
  const [brandName, setBrandName] = useState("")
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState(0)

  async function analyze() {
    if (text.trim().length < 20) {
      toast.error("Collez le message à analyser.")
      return
    }
    setLoading(true)
    setData(null)
    const res = await fetch("/api/ai/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    const body = (await res.json().catch(() => ({}))) as {
      extracted?: Extracted
      error?: string
    }
    setLoading(false)
    if (!res.ok || !body.extracted) {
      toast.error("Extraction impossible", { description: body.error })
      return
    }
    const ex = body.extracted
    setData(ex)
    setBrandName(ex.brand_name ?? "")
    setTitle(ex.title ?? "Nouveau partenariat")
    setAmount(Number(ex.cash_amount_eur ?? 0))
  }

  async function createDeal() {
    if (!data) return
    if (!brandName.trim()) {
      toast.error("Indiquez le nom de la marque.")
      return
    }
    setCreating(true)
    const supabase = createClient()

    // Retrouve la marque existante (insensible à la casse) ou la crée.
    let brandId =
      brands.find(
        (b) => b.name.trim().toLowerCase() === brandName.trim().toLowerCase()
      )?.id ?? null

    if (!brandId) {
      const { data: newBrand, error: bErr } = await supabase
        .from("brands")
        .insert({ user_id: userId, name: brandName.trim() })
        .select("id")
        .single()
      if (bErr || !newBrand) {
        setCreating(false)
        toast.error("Création de la marque impossible", {
          description: bErr?.message,
        })
        return
      }
      brandId = newBrand.id
    }

    const { data: deal, error } = await supabase
      .from("deals")
      .insert({
        user_id: userId,
        brand_id: brandId,
        title: title || "Nouveau partenariat",
        status: "draft",
        mission_description:
          data.mission_description || "Partenariat importé automatiquement.",
        platforms: data.platforms ?? [],
        content_type: data.content_type ?? null,
        deliverables_count: data.deliverables_count ?? 1,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        cash_amount_eur: amount,
        in_kind_value_eur: Number(data.in_kind_value_eur ?? 0),
        in_kind_description: data.in_kind_description || null,
        ip_rights_duration: data.ip_rights_duration || "12 mois",
        exclusivity: !!data.exclusivity,
        french_law_applicable: true,
      })
      .select("id")
      .single()

    setCreating(false)
    if (error || !deal) {
      toast.error("Création du partenariat impossible", {
        description: error?.message,
      })
      return
    }
    toast.success("Partenariat créé à partir du message")
    router.push(`/deals/${deal.id}`)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Collez un email de marque, une conversation Instagram ou un brief.
          L&apos;IA en extrait la marque, le prix, les dates et les livrables,
          puis crée le partenariat pré-rempli.
        </p>
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Collez ici l'email, le DM ou le brief reçu…"
        />
        <Button onClick={analyze} disabled={loading}>
          <Wand2 className="size-4" />
          {loading ? "Analyse en cours…" : "Analyser le message"}
        </Button>
      </div>

      {data && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="text-primary size-4" />
            Voici ce que j&apos;ai compris
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="imp-brand">Marque</Label>
              <Input
                id="imp-brand"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="imp-amount">Rémunération (€)</Label>
              <Input
                id="imp-amount"
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="imp-title">Titre</Label>
              <Input
                id="imp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <dl className="text-muted-foreground grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <Detail label="Mission" value={data.mission_description} full />
            <Detail label="Plateformes" value={(data.platforms ?? []).join(", ")} />
            <Detail
              label="Période"
              value={[data.start_date, data.end_date].filter(Boolean).join(" → ")}
            />
            {data.in_kind_value_eur ? (
              <Detail
                label="Avantage en nature"
                value={`${data.in_kind_description ?? ""} — ${formatEur(
                  data.in_kind_value_eur
                )}`}
              />
            ) : null}
            <Detail label="Droits" value={data.ip_rights_duration} />
            <Detail
              label="Exclusivité"
              value={data.exclusivity ? "Oui" : "Non"}
            />
            {data.deadlines_notes ? (
              <Detail label="À noter" value={data.deadlines_notes} full />
            ) : null}
          </dl>

          <Button onClick={createDeal} disabled={creating} className="w-full">
            {creating ? "Création…" : "Créer le partenariat"}
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-muted-foreground text-xs">
            Vérifiez les informations : l&apos;extraction automatique peut se
            tromper. Vous pourrez tout ajuster ensuite.
          </p>
        </div>
      )}
    </div>
  )
}

function Detail({
  label,
  value,
  full,
}: {
  label: string
  value?: string | null
  full?: boolean
}) {
  if (!value) return null
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs">{label}</dt>
      <dd className="text-foreground break-words">{value}</dd>
    </div>
  )
}
