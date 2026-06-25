import Link from "next/link"
import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { getProfile } from "@/lib/profile"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

import { signOut } from "./actions"

const NAV = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/brands", label: "Marques" },
  { href: "/settings", label: "Paramètres" },
]

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const profile = await getProfile()
  if (!profile) redirect("/onboarding")

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" aria-label="Brandeal">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm md:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
        <nav className="border-t sm:hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-2 py-1.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4 text-xs">
          <span>
            Outil d&apos;aide à la rédaction — pas un conseil juridique.
          </span>
          <Link
            href="/legal/avertissement-juridique"
            className="hover:text-foreground"
          >
            Avertissement juridique
          </Link>
        </div>
      </footer>
    </div>
  )
}
