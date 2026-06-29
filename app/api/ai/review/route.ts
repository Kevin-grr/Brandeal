import { NextResponse } from "next/server"

import { callClaude, extractJson, isAIConfigured } from "@/lib/ai"
import { createClient } from "@/lib/supabase/server"
import type { ReviewBalance, ReviewFinding } from "@/types/database"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM = `Tu es juriste spécialisé en droit français de l'influence commerciale, au service d'un CRÉATEUR de contenu (et non de la marque). On te fournit le texte d'un contrat de partenariat ENVOYÉ PAR UNE MARQUE. Analyse-le DU POINT DE VUE DU CRÉATEUR.

Cadre de référence :
- Loi n°2023-451 du 9 juin 2023 (« loi influenceurs ») : contrat écrit obligatoire dès 1 000 € HT/an/annonceur, mentions obligatoires (objet, rémunération, droits de propriété intellectuelle et leur durée, exclusivité bornée, droit applicable), transparence publicitaire.
- Repère les clauses DÉSÉQUILIBRÉES en défaveur du créateur : cession de droits trop longue/perpétuelle, exclusivité large ou non bornée, pénalités disproportionnées, rémunération floue, droit de modification unilatéral, renonciation à des droits.

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, de la forme :
{
  "score": <entier 0-100, 100 = très favorable/équilibré pour le créateur>,
  "balance": "favorable_brand" | "balanced" | "favorable_creator",
  "summary": "<résumé en français simple, 2-4 phrases, langage non juridique>",
  "findings": [
    { "severity": "info"|"warning"|"critical", "title": "<court>", "detail": "<explication simple>", "clause": "<extrait ou nom de clause, optionnel>" }
  ],
  "missing_mentions": ["<mention obligatoire absente>", ...]
}

Sois concret et pédagogue. N'invente pas de clauses absentes du texte.`

interface ReviewJson {
  score: number
  balance: ReviewBalance
  summary: string
  findings: ReviewFinding[]
  missing_mentions: string[]
}

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
          "L'analyse IA n'est pas encore activée. Ajoutez la clé ANTHROPIC_API_KEY dans la configuration du serveur.",
        notConfigured: true,
      },
      { status: 503 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as {
    text?: string
    filename?: string
    brandId?: string
  }
  const text = (body.text ?? "").trim()
  if (text.length < 50) {
    return NextResponse.json(
      { error: "Collez le texte du contrat (au moins quelques lignes)." },
      { status: 400 }
    )
  }

  // Crée la ligne d'analyse (statut processing).
  const { data: review } = await supabase
    .from("contract_reviews")
    .insert({
      user_id: user.id,
      brand_id: body.brandId ?? null,
      source_filename: body.filename ?? null,
      source_text: text.slice(0, 50_000),
      status: "processing",
    })
    .select()
    .single()

  try {
    const raw = await callClaude({
      system: SYSTEM,
      user: `Voici le contrat à analyser :\n\n"""\n${text.slice(0, 40_000)}\n"""`,
      maxTokens: 2048,
    })
    const parsed = extractJson<ReviewJson>(raw)
    if (!parsed) throw new Error("Réponse IA illisible.")

    const score = Math.max(0, Math.min(100, Math.round(parsed.score)))

    if (review) {
      await supabase
        .from("contract_reviews")
        .update({
          status: "done",
          score,
          balance: parsed.balance,
          summary: parsed.summary,
          findings: parsed.findings ?? [],
          missing_mentions: parsed.missing_mentions ?? [],
        })
        .eq("id", review.id)
    }

    return NextResponse.json({
      id: review?.id,
      score,
      balance: parsed.balance,
      summary: parsed.summary,
      findings: parsed.findings ?? [],
      missing_mentions: parsed.missing_mentions ?? [],
    })
  } catch (e) {
    if (review) {
      await supabase
        .from("contract_reviews")
        .update({ status: "error", error_message: (e as Error).message })
        .eq("id", review.id)
    }
    return NextResponse.json(
      { error: "L'analyse a échoué. Réessayez dans un instant." },
      { status: 500 }
    )
  }
}
