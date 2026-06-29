"use client"

import { useRef, useState } from "react"
import { Send, Sparkles, User } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Msg {
  role: "user" | "assistant"
  content: string
}

const SUGGESTIONS = [
  "Combien ai-je gagné cette année ?",
  "Quelles factures sont en retard ?",
  "Quelle est ma meilleure marque ?",
  "Quels contrats arrivent à expiration ?",
]

export function DataAssistant() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function ask(question: string) {
    const q = question.trim()
    if (!q || loading) return
    setInput("")
    setMessages((m) => [...m, { role: "user", content: q }])
    setLoading(true)

    const res = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, history: messages }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      answer?: string
      error?: string
    }
    setLoading(false)

    if (!res.ok || !data.answer) {
      toast.error("Assistant indisponible", { description: data.error })
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.error ?? "Je n'ai pas pu répondre. Réessayez dans un instant.",
        },
      ])
      return
    }
    setMessages((m) => [...m, { role: "assistant", content: data.answer! }])
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Posez une question sur vos partenariats, marques, factures et revenus.
        L&apos;assistant répond à partir de vos données.
      </p>

      <div
        ref={scrollRef}
        className="bg-muted/20 max-h-[420px] min-h-[200px] space-y-3 overflow-y-auto rounded-lg border p-4"
      >
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Essayez par exemple :</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="hover:bg-muted rounded-full border px-3 py-1.5 text-xs"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 text-sm",
                m.role === "user" && "flex-row-reverse"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  m.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {m.role === "assistant" ? (
                  <Sparkles className="size-4" />
                ) : (
                  <User className="size-4" />
                )}
              </span>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 whitespace-pre-wrap",
                  m.role === "assistant"
                    ? "bg-background border"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Sparkles className="size-4 animate-pulse" />
            L&apos;assistant réfléchit…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question…"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()} size="icon">
          <Send className="size-4" />
        </Button>
      </form>

      <p className="text-muted-foreground text-xs">
        L&apos;assistant lit vos données mais ne donne pas de conseil juridique
        ou fiscal personnalisé.
      </p>
    </div>
  )
}
