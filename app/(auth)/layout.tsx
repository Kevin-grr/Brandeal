import Link from "next/link"

import { Logo } from "@/components/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Link href="/" aria-label="Brandeal">
        <Logo />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="text-muted-foreground max-w-sm text-center text-xs">
        Outil d&apos;aide à la rédaction de contrats. Ne constitue pas un
        conseil juridique personnalisé.
      </p>
    </div>
  )
}
