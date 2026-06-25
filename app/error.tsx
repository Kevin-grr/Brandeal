"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Une erreur est survenue
      </h1>
      <p className="text-muted-foreground max-w-md">
        Quelque chose s&apos;est mal passé de notre côté. Réessayez, ou revenez
        un peu plus tard.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  )
}
