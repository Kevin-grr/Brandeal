import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { getProfile } from "@/lib/profile"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"

import { signOut } from "./actions"

const NAV = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/deals", label: "Partenariats" },
  { href: "/brands", label: "Marques" },
  { href: "/quotes", label: "Devis" },
  { href: "/finances", label: "Finances" },
  { href: "/ai", label: "Assistant IA" },
  { href: "/plan", label: "Mon plan" },
]

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const profile = await getProfile()
  if (!profile) redirect("/onboarding")

  const initials = (user.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link href="/dashboard" aria-label="Brandeal" className="shrink-0">
            <Logo />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
            >
              {initials}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/settings" className="flex w-full items-center gap-2">
                  <Settings className="size-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOut} className="w-full">
                <DropdownMenuItem variant="destructive">
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut className="size-4" />
                    Déconnexion
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nav mobile */}
        <nav className="border-t md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 py-1.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 text-xs">
          <span>Outil d&apos;aide à la rédaction — pas un conseil juridique.</span>
          <Link href="/legal/avertissement-juridique" className="hover:text-foreground">
            Avertissement juridique
          </Link>
        </div>
      </footer>
    </div>
  )
}
