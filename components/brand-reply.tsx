"use client"

import { useState } from "react"
import { Check, Copy, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TONES = [
  { value: "amical et chaleureux", label: "Amical" },
  { value: "neutre et professionnel", label: "Neutre / pro" },
  { value: "ferme et affirmé", label: "Ferme" },
]

const INTENTS = [
  { value: "accepter et avancer vers un contrat", label: "Accepter" },
  { value: "demander le budget et les détails", label: "Demander le budget" },
  { value: "négocier un meilleur tarif", label: "Négocier" },
  { value: "décliner poliment", label: "Décliner" },
]

export function BrandReply() {
  const [message, setMessage] = useState("")
  const [tone, setTone] = useState(TONES[1].value)
  const [intent, setIntent] = useState(INTENTS[0].value)
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState("")
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (message.trim().length < 10) {
      toast.error("Collez le message de la marque.")
      return
    }
    setLoading(true)
    setReply("")
    const res = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, tone, intent }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      reply?: string
      error?: string
    }
    setLoading(false)
    if (!res.ok || !data.reply) {
      toast.error("Génération impossible", { description: data.error })
      return
    }
    setReply(data.reply)
  }

  async function copy() {
    await navigator.clipboard.writeText(reply)
    setCopied(true)
    toast.success("Réponse copiée")
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Collez l&apos;email d&apos;une marque, choisissez le ton et
          l&apos;objectif : l&apos;IA rédige une réponse professionnelle prête à
          envoyer.
        </p>
        <Textarea
          rows={7}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Collez ici le message reçu de la marque…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Ton</Label>
          <Select value={tone} onValueChange={(v) => setTone(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Objectif</Label>
          <Select value={intent} onValueChange={(v) => setIntent(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTENTS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate} disabled={loading}>
        <Sparkles className="size-4" />
        {loading ? "Rédaction…" : "Générer la réponse"}
      </Button>

      {reply && (
        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Proposition de réponse</p>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              Copier
            </Button>
          </div>
          <p className="text-sm whitespace-pre-wrap">{reply}</p>
        </div>
      )}
    </div>
  )
}
