import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Plan } from "@/types/database"

export const runtime = "nodejs"

function periodEnd(sub: Stripe.Subscription): string | null {
  const ts = (sub as unknown as { current_period_end?: number })
    .current_period_end
  return ts ? new Date(ts * 1000).toISOString() : null
}

function customerId(
  c: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!c) return null
  return typeof c === "string" ? c : c.id
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) {
    return new NextResponse("Signature ou secret manquant.", { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (e) {
    return new NextResponse(`Webhook Error: ${(e as Error).message}`, {
      status: 400,
    })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session
      const userId = s.client_reference_id
      if (userId) {
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: "pro" as Plan,
            status: "active",
            stripe_customer_id: customerId(s.customer),
            stripe_subscription_id:
              typeof s.subscription === "string"
                ? s.subscription
                : (s.subscription?.id ?? null),
          },
          { onConflict: "user_id" }
        )
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const isActive =
        event.type !== "customer.subscription.deleted" &&
        (sub.status === "active" || sub.status === "trialing")
      const update = {
        plan: (isActive ? "pro" : "free") as Plan,
        status: sub.status,
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId(sub.customer),
        current_period_end: periodEnd(sub),
      }
      const userId = sub.metadata?.user_id
      if (userId) {
        await admin
          .from("subscriptions")
          .upsert({ user_id: userId, ...update }, { onConflict: "user_id" })
      } else {
        const cust = customerId(sub.customer)
        if (cust) {
          await admin
            .from("subscriptions")
            .update(update)
            .eq("stripe_customer_id", cust)
        }
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
