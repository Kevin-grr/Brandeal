"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Script from "next/script"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "brandeal-cookie-consent"
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

type Consent = "accepted" | "refused"

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(args)
}

/**
 * Consent Mode v2 : sans un état "default" déclaré avant le chargement de
 * gtag.js, Google applique un refus implicite pour le trafic UE et les hits
 * sont silencieusement ignorés — même après un "accepté" tardif.
 */
function declareDefaultConsent() {
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  })
  gtag("js", new Date())
  if (GA_ID) gtag("config", GA_ID, { anonymize_ip: true })
}

function grantAnalyticsConsent() {
  gtag("consent", "update", { analytics_storage: "granted" })
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GA_ID) return
    declareDefaultConsent()

    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null
    setConsent(stored)
    setReady(true)
    if (stored === "accepted") grantAnalyticsConsent()
  }, [])

  function choose(value: Consent) {
    localStorage.setItem(STORAGE_KEY, value)
    setConsent(value)
    if (value === "accepted") grantAnalyticsConsent()
  }

  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

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
