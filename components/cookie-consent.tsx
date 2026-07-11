"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Script from "next/script"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "brandeal-cookie-consent"
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

type Consent = "accepted" | "refused"

function loadGoogleAnalytics() {
  if (!GA_ID || typeof window === "undefined") return
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer ?? []
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args)
  }
  gtag("js", new Date())
  gtag("config", GA_ID, { anonymize_ip: true })
  ;(window as unknown as { gtag: typeof gtag }).gtag = gtag
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null
    setConsent(stored)
    setReady(true)
    if (stored === "accepted") loadGoogleAnalytics()
  }, [])

  function choose(value: Consent) {
    localStorage.setItem(STORAGE_KEY, value)
    setConsent(value)
    if (value === "accepted") loadGoogleAnalytics()
  }

  if (!GA_ID) return null

  return (
    <>
      {consent === "accepted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
      )}

      {ready && consent === null && (
        <div className="bg-background fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-lg">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Nous utilisons des cookies de mesure d&apos;audience (Google
              Analytics) pour comprendre l&apos;utilisation du site. Voir
              notre{" "}
              <Link
                href="/legal/politique-confidentialite"
                className="underline"
              >
                politique de confidentialité
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => choose("refused")}
              >
                Refuser
              </Button>
              <Button size="sm" onClick={() => choose("accepted")}>
                Accepter
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
