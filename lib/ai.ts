import "server-only"

/**
 * Client IA minimal (API Claude via fetch, sans dépendance SDK).
 * Activé dès qu'une clé `ANTHROPIC_API_KEY` est présente. Sinon les routes
 * renvoient une erreur explicite « à configurer » — aucune feature ne casse.
 */

const API_URL = "https://api.anthropic.com/v1/messages"
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface CallOptions {
  system: string
  user: string
  history?: Message[]
  maxTokens?: number
  temperature?: number
}

/** Appelle Claude et renvoie le texte de la réponse. Lève en cas d'erreur. */
export async function callClaude({
  system,
  user,
  history = [],
  maxTokens = 2048,
  temperature = 0.3,
}: CallOptions): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error("AI_NOT_CONFIGURED")
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let res: Response
  try {
    res = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [...history, { role: "user", content: user }],
      }),
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`AI_REQUEST_FAILED: ${res.status} ${detail.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[]
  }
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n")
    .trim()
}

/**
 * Extrait un objet JSON d'une réponse texte (Claude renvoie parfois du texte
 * autour). Renvoie null si rien d'exploitable.
 */
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end === -1 || end < start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    return null
  }
}
