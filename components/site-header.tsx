"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" onClick={close} aria-label="Brandeal — accueil">
          <Logo />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-2 sm:flex">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            Tarifs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Connexion
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
            Créer un compte
          </Button>
        </nav>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="hover:bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-md sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <nav className="border-t sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            <Link
              href="/pricing"
              onClick={close}
              className="hover:bg-muted rounded-md px-3 py-2 text-sm"
            >
              Tarifs
            </Link>
            <Link
              href="/login"
              onClick={close}
              className="hover:bg-muted rounded-md px-3 py-2 text-sm"
            >
              Connexion
            </Link>
            <Button
              className="mt-1 w-full"
              nativeButton={false}
              render={<Link href="/signup" onClick={close} />}
            >
              Créer un compte
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
