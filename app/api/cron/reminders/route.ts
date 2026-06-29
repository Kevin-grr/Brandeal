import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { isEmailConfigured, reminderEmailHtml, sendEmail } from "@/lib/email"
import { formatEur } from "@/lib/format"
import type { Brand, Deal, Invoice, Profile } from "@/types/database"

export const runtime = "nodejs"
export const maxDuration = 60

const STEPS = [
  { step: 3, minDays: 30 },
  { step: 2, minDays: 15 },
  { step: 1, minDays: 7 },
]

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
}

/**
 * Cron de relance des factures impayées (J+7 / J+15 / J+30).
 * Protégé par CRON_SECRET. Idempotent : une relance par (facture, palier).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "RESEND_API_KEY non configurée — relances en attente.",
    })
  }

  const admin = createAdminClient()

  const { data: invoicesRaw } = await admin
    .from("invoices")
    .select("*")
    .eq("status", "sent")
    .is("deleted_at", null)
  const invoices = (invoicesRaw as Invoice[]) ?? []

  let sent = 0
  const errors: string[] = []

  for (const inv of invoices) {
    const late = daysSince(inv.issue_date)
    const applicable = STEPS.find((s) => late >= s.minDays)
    if (!applicable) continue

    // Déjà relancé pour ce palier ?
    const { data: existing } = await admin
      .from("payment_reminders")
      .select("id")
      .eq("invoice_id", inv.id)
      .eq("step", applicable.step)
      .maybeSingle()
    if (existing) continue

    if (!inv.deal_id) continue
    const { data: deal } = await admin
      .from("deals")
      .select("*")
      .eq("id", inv.deal_id)
      .maybeSingle<Deal>()
    if (!deal) continue

    const [{ data: brand }, { data: profile }] = await Promise.all([
      admin.from("brands").select("*").eq("id", deal.brand_id).maybeSingle<Brand>(),
      admin
        .from("profiles")
        .select("*")
        .eq("id", inv.user_id)
        .maybeSingle<Profile>(),
    ])

    if (!brand?.contact_email) continue

    const html = reminderEmailHtml({
      brandName: brand.contact_name || brand.name,
      creatorName: profile?.full_name || "Le créateur",
      invoiceNumber: inv.invoice_number,
      amount: formatEur(inv.amount_ht),
      daysLate: late,
      step: applicable.step,
    })

    const result = await sendEmail({
      to: brand.contact_email,
      subject: `Relance — facture ${inv.invoice_number}`,
      html,
    })

    if (result.ok) {
      await admin.from("payment_reminders").insert({
        user_id: inv.user_id,
        invoice_id: inv.id,
        step: applicable.step,
        channel: "email",
      })
      sent++
    } else if (result.error) {
      errors.push(`${inv.invoice_number}: ${result.error}`)
    }
  }

  return NextResponse.json({ ok: true, sent, errors })
}
