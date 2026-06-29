import "server-only"

/**
 * Envoi d'emails transactionnels via Resend (fetch, sans dépendance SDK).
 * Activé dès que `RESEND_API_KEY` est présent. Sinon `sendEmail` renvoie
 * `{ skipped: true }` sans lever — les fonctionnalités ne cassent pas.
 */

const FROM = process.env.RESEND_FROM_EMAIL ?? "Brandeal <no-reply@brandeal.fr>"

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, skipped: true }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    if (!res.ok) {
      return { ok: false, error: `${res.status} ${await res.text()}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Gabarit HTML d'une relance de paiement. */
export function reminderEmailHtml({
  brandName,
  creatorName,
  invoiceNumber,
  amount,
  daysLate,
  step,
}: {
  brandName: string
  creatorName: string
  invoiceNumber: string
  amount: string
  daysLate: number
  step: number
}): string {
  const tone =
    step >= 3
      ? "Sans règlement de votre part, je serai contraint(e) d'envisager les recours prévus."
      : step === 2
        ? "Pourriez-vous m'indiquer la date de règlement prévue ?"
        : "Il s'agit d'un simple rappel, au cas où elle vous aurait échappé."

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#111; line-height:1.6; max-width:560px;">
    <p>Bonjour ${brandName},</p>
    <p>
      Je me permets de revenir vers vous concernant la facture
      <strong>${invoiceNumber}</strong> d'un montant de <strong>${amount}</strong>,
      en attente de règlement depuis ${daysLate} jours.
    </p>
    <p>${tone}</p>
    <p>Je reste disponible pour toute question.</p>
    <p>Bien cordialement,<br/>${creatorName}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
    <p style="font-size:12px;color:#888;">Relance envoyée automatiquement via Brandeal.</p>
  </div>`
}
