import { NextResponse } from "next/server"

import { SITE_URL } from "@/lib/config"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
  }

  const priceId = process.env.STRIPE_PRICE_ID_PRO
  if (!priceId) {
    return NextResponse.json(
      { error: "Offre Pro non configurée (STRIPE_PRICE_ID_PRO)." },
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
