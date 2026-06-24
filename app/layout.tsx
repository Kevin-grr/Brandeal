import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default:
      "ContratCréateur — contrats de partenariat conformes à la loi influenceurs",
    template: "%s · ContratCréateur",
  },
  description:
    "Générez des contrats de partenariat conformes à la loi française n°2023-451, suivez le seuil légal de 1 000 € par marque et facturez en règle. Outil d'aide à la rédaction pour créateurs de contenu.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
