import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Page introuvable
      </h1>
      <p className="text-muted-foreground max-w-md">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Retour à l&apos;accueil
      </Button>
    </div>
  )
}
