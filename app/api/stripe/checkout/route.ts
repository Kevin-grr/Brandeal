import { NextResponse } from "next/server"

import { SITE_URL } from "@/lib/config"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import type { Plan } from "@/types/database"

export const runtime = "nodejs"

type PaidPlan = Exclude<Plan, "free">

const PRICE_IDS: Record<PaidPlan, Record<"month" | "year", string | undefined>> =
  {
    creator: {
      month: process.env.STRIPE_PRICE_ID_CREATOR,
      year: process.env.STRIPE_PRICE_ID_CREATOR_ANNUAL,
    },
    studio: {
      month: process.env.STRIPE_PRICE_ID_STUDIO,
      year: process.env.STRIPE_PRICE_ID_STUDIO_ANNUAL,
    },
    expert: {
      month: process.env.STRIPE_PRICE_ID_EXPERT,
      year: process.env.STRIPE_PRICE_ID_EXPERT_ANNUAL,
    },
  }

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    plan?: string
    interval?: string
  }

  const plan = (body.plan ?? "creator") as PaidPlan
  const interval: "month" | "year" =
    body.interval === "year" ? "year" : "month"

  if (!["creator", "studio", "expert"].includes(plan)) {
    return NextResponse.json({ error: "Plan inconnu." }, { status: 400 })
  }

  const priceId = PRICE_IDS[plan][interval]
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Offre ${plan} (${interval}) non configurée — vérifiez les variables STRIPE_PRICE_ID_*.`,
      },
      { status: 500 }
    )
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: sub?.stripe_customer_id ?? undefined,
      customer_email: sub?.stripe_customer_id
        ? undefined
        : (user.email ?? undefined),
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id } },
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/settings?upgraded=1`,
      cancel_url: `${SITE_URL}/pricing`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
