import { NextResponse } from "next/server"

import { callClaude, isAIConfigured } from "@/lib/ai"
import { checkAiRateLimit, recordAiCall } from "@/lib/ai-rate-limit"
import { buildAssistantContext } from "@/lib/assistant-context"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM = `Tu es l'assistant personnel d'un créateur de contenu, intégré à l'app Brandeal. Tu réponds à ses questions sur SES données (partenariats, marques, factures, revenus).

Règles de fond :
- Appuie-toi UNIQUEMENT sur les données fournies. N'invente jamais un chiffre.
- Si l'info n'est pas dans les données, dis-le simplement.
- Tu n'es pas avocat ni comptable : renvoie vers un professionnel pour les questions juridiques ou fiscales précises.
- Si on te demande une action, explique où la faire dans l'app.

Règles de forme (IMPORTANTES) :
- Réponds en français naturel et conversationnel, comme un ami qui connaît bien les chiffres.
- Phrases courtes et directes. Pas de tableaux markdown. Pas d'emojis.
- Utilise des listes à puces simples (tirets) seulement si tu dois lister plusieurs éléments.
- Pas de titres en gras avec ##. Pas de séparateurs ---.
- Va droit au but : donne le chiffre ou la réponse en premier, l'explication après si nécessaire.`

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  if (!isAIConfigured()) {
    return NextResponse.json(
      {
        error:
          "L'assistant IA n'est pas encore activé. Ajoutez la clé ANTHROPIC_API_KEY dans la configuration du serveur.",
        notConfigured: true,
      },
      { status: 503 }
    )
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle()
  const plan = (sub?.plan as string) ?? "free"

  const { allowed, used, limit } = await checkAiRateLimit(user.id, plan)
  if (!allowed) {
    return NextResponse.json(
      { error: `Limite IA atteinte (${used}/${limit} aujourd'hui). Revenez demain ou passez à un plan supérieur.` },
      { status: 429 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as {
    question?: string
    history?: { role: "user" | "assistant"; content: string }[]
  }
  const question = (body.question ?? "").trim()
  const history = Array.isArray(body.history) ? body.history.slice(-10) : []
  if (question.length < 2) {
    return NextResponse.json({ error: "Posez une question." }, { status: 400 })
  }

  await recordAiCall(user.id, "assistant")

  try {
    const context = await Promise.race([
      buildAssistantContext(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("CONTEXT_TIMEOUT")), 10_000)
      ),
    ])

    const answer = await callClaude({
      system: `${SYSTEM}\n\nDONNÉES DU CRÉATEUR :\n${context}`,
      user: question,
      history,
      maxTokens: 1024,
      temperature: 0.2,
    })
    return NextResponse.json({ answer })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    console.error("[AI assistant]", msg)
    if (msg === "CONTEXT_TIMEOUT") {
      return NextResponse.json(
        { error: "Délai dépassé lors du chargement des données. Réessayez." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? `ERREUR: ${msg}` : "L'assistant n'a pas pu répondre. Réessayez." },
      { status: 500 }
    )
  }
}
