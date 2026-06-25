import Link from "next/link"

import { APP_NAME } from "@/lib/config"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/pricing" />}>
            Tarifs
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Connexion
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Créer un compte
          </Button>
        </nav>
      </div>
    </header>
  )
}
