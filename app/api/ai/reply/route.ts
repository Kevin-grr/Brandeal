import { NextResponse } from "next/server"

import { callClaude, isAIConfigured } from "@/lib/ai"
import { checkAiRateLimit, recordAiCall } from "@/lib/ai-rate-limit"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM = `Tu es l'assistant d'un CRÉATEUR de contenu français. On te donne le message d'une marque (proposition de partenariat, négociation, relance…). Rédige une réponse PROFESSIONNELLE, claire et courtoise EN FRANÇAIS, à la première personne, prête à être envoyée.

Règles :
- Ton cordial mais affirmé, qui valorise le créateur sans être arrogant.
- Si la marque ne précise pas le budget, demande-le poliment.
- Encourage la formalisation par un contrat écrit (obligatoire au-delà de 1 000 € HT/an en France).
- Reste concis (8-15 lignes). Pas de placeholders entre crochets non remplis : utilise des formulations naturelles.
- Adapte le registre au ton fourni par l'utilisateur (amical, neutre, ferme).
Réponds UNIQUEMENT par le texte de l'email, sans préambule ni guillemets.`

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
      { error: `Limite IA atteinte (${used}/${limit} aujourd'hui).` },
      { status: 429 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as {
    message?: string
    tone?: string
    intent?: string
  }
  const message = (body.message ?? "").trim()
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Collez le message de la marque." },
      { status: 400 }
    )
  }

  await recordAiCall(user.id, "reply")

  try {
    const reply = await callClaude({
      system: SYSTEM,
      user: `Ton souhaité : ${body.tone ?? "neutre et professionnel"}.
Objectif de ma réponse : ${body.intent ?? "répondre de façon adaptée"}.

Message reçu de la marque :
"""
${message.slice(0, 8000)}
"""`,
      maxTokens: 1024,
      temperature: 0.6,
    })
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json(
      { error: "La génération a échoué. Réessayez dans un instant." },
      { status: 500 }
    )
  }
}
