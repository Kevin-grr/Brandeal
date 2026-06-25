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

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe à gérer." },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${SITE_URL}/settings`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
