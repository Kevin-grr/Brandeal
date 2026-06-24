import Link from "next/link"

import { APP_NAME } from "@/lib/config"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        {APP_NAME}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="text-muted-foreground max-w-sm text-center text-xs">
        Outil d&apos;aide à la rédaction de contrats. Ne constitue pas un
        conseil juridique personnalisé.
      </p>
    </div>
  )
}
