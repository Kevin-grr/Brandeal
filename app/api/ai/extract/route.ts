import { NextResponse } from "next/server"

import { callClaude, extractJson, isAIConfigured } from "@/lib/ai"
import { checkAiRateLimit, recordAiCall } from "@/lib/ai-rate-limit"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM = `Tu extrais les informations d'un partenariat à partir d'un texte brut (email d'une marque, conversation Instagram, brief, message). Tu travailles pour un créateur de contenu français.

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour :
{
  "brand_name": "<nom de la marque/annonceur, ou chaîne vide si inconnu>",
  "title": "<titre court du partenariat>",
  "mission_description": "<ce qui est demandé, résumé en 1-3 phrases>",
  "cash_amount_eur": <nombre, rémunération en numéraire, 0 si non précisé>,
  "in_kind_value_eur": <nombre, valeur des produits offerts, 0 si aucun>,
  "in_kind_description": "<description de l'avantage en nature, ou null>",
  "platforms": ["Instagram"|"TikTok"|"YouTube"|"Twitch"|"X"|"Autre", ...],
  "content_type": "post"|"story"|"reel_short"|"video_longue"|"live"|"autre"|null,
  "deliverables_count": <nombre de livrables, 1 par défaut>,
  "start_date": "<AAAA-MM-JJ ou null>",
  "end_date": "<AAAA-MM-JJ ou null>",
  "ip_rights_duration": "<durée de réutilisation des contenus si mentionnée, sinon null>",
  "exclusivity": <true si une exclusivité est demandée, sinon false>,
  "deadlines_notes": "<deadlines, hashtags obligatoires, contraintes notables, ou chaîne vide>"
}

N'invente pas de montant. Si une info est absente, mets la valeur par défaut indiquée. Convertis les dates en AAAA-MM-JJ.`

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
          "L'extraction IA n'est pas encore activée. Ajoutez la clé ANTHROPIC_API_KEY.",
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

  const body = (await req.json().catch(() => ({}))) as { text?: string }
  const text = (body.text ?? "").trim()
  if (text.length < 20) {
    return NextResponse.json(
      { error: "Collez le message à analyser (email, DM, brief…)." },
      { status: 400 }
    )
  }

  await recordAiCall(user.id, "extract")

  try {
    const raw = await callClaude({
      system: SYSTEM,
      user: `Texte à analyser :\n"""\n${text.slice(0, 12000)}\n"""`,
      maxTokens: 1024,
      temperature: 0.1,
    })
    const parsed = extractJson<Record<string, unknown>>(raw)
    if (!parsed) {
      return NextResponse.json(
        { error: "Je n'ai pas pu extraire les informations. Reformulez ou complétez le texte." },
        { status: 422 }
      )
    }
    return NextResponse.json({ extracted: parsed })
  } catch {
    return NextResponse.json(
      { error: "L'extraction a échoué. Réessayez." },
      { status: 500 }
    )
  }
}
