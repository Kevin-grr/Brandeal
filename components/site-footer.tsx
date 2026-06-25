import Link from "next/link"

import { APP_NAME } from "@/lib/config"

const LINKS = [
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/cgu", label: "CGU" },
  {
    href: "/legal/politique-confidentialite",
    label: "Politique de confidentialité",
  },
  { href: "/legal/avertissement-juridique", label: "Avertissement juridique" },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Outil d&apos;aide à la
          rédaction — ne constitue pas un conseil juridique.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
