import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prada — Vitrine interactive",
  description:
    "Vitrine interactive sur la maison Prada : histoire, produits iconiques, groupe et engagement durable. Réalisée pour une présentation orale.",
}

export default function PradaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
