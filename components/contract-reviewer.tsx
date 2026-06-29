"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import type { ReviewBalance, ReviewFinding } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PdfImportButton } from "@/components/pdf-import-button"

interface ReviewResult {
  score: number
  balance: ReviewBalance
  summary: string
  findings: ReviewFinding[]
  missing_mentions: string[]
}

const BALANCE_LABEL: Record<ReviewBalance, string> = {
  favorable_brand: "Plutôt favorable à la marque",
  balanced: "Équilibré",
  favorable_creator: "Plutôt favorable au créateur",
}

function scoreColor(score: number) {
  if (score >= 75) return "text-green-600 dark:text-green-400"
  if (score >= 50) return "text-amber-600 dark:text-amber-400"
  return "text-destructive"
}

function SeverityIcon({ s }: { s: ReviewFinding["severity"] }) {
  if (s === "critical")
    return <ShieldAlert className="text-destructive mt-0.5 size-4 shrink-0" />
  if (s === "warning")
    return (
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
    )
  return <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
}

export function ContractReviewer() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)

  async function analyze() {
    if (text.trim().length < 50) {
      toast.error("Collez le texte du contrat (au moins quelques lignes).")
      return
    }
    setLoading(true)
    setResult(null)
    const res = await fetch("/api/ai/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    const data = (await res.json().catch(() => ({}))) as
      | ReviewResult
      | { error: string }
    setLoading(false)
    if (!res.ok || "error" in data) {
      toast.error("Analyse impossible", {
        description: "error" in data ? data.error : undefined,
      })
      return
    }
    setResult(data)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Collez le contrat reçu d&apos;une marque. L&apos;IA repère les clauses
          à risque, les mentions manquantes et vous donne un score de
          conformité — du point de vue du créateur.
        </p>
        <Textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Collez ici le texte du contrat envoyé par la marque…"
          className="font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={analyze} disabled={loading}>
            <Sparkles className="size-4" />
            {loading ? "Analyse en cours…" : "Analyser le contrat"}
          </Button>
          <PdfImportButton onText={setText} />
        </div>
      </div>

      {result && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Score de conformité</p>
              <p className={cn("text-3xl font-bold", scoreColor(result.score))}>
                {result.score}
                <span className="text-muted-foreground text-base font-normal">
                  {" "}
                  / 100
                </span>
              </p>
            </div>
            <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
              {BALANCE_LABEL[result.balance] ?? result.balance}
            </span>
          </div>

          <div className="bg-muted/40 rounded-md border p-3 text-sm">
            {result.summary}
          </div>

          {result.findings.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Points d&apos;attention</p>
              <ul className="space-y-2">
                {result.findings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <SeverityIcon s={f.severity} />
                    <div>
                      <p className="font-medium">{f.title}</p>
                      <p className="text-muted-foreground">{f.detail}</p>
                      {f.clause && (
                        <p className="text-muted-foreground mt-0.5 text-xs italic">
                          « {f.clause} »
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.missing_mentions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Mentions potentiellement manquantes</p>
              <ul className="space-y-1">
                {result.missing_mentions.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.findings.length === 0 &&
            result.missing_mentions.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="size-4" />
                Aucun point bloquant détecté.
              </div>
            )}

          <p className="text-muted-foreground text-xs">
            Analyse automatique fournie à titre indicatif. Elle ne remplace pas
            l&apos;avis d&apos;un avocat avant signature.
          </p>
        </div>
      )}
    </div>
  )
}
