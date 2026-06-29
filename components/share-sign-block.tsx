"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { SignaturePad } from "@/components/signature-pad"

export function ShareSignBlock({
  token,
  alreadySigned,
  signerName,
}: {
  token: string
  alreadySigned: boolean
  signerName?: string | null
}) {
  const router = useRouter()

  if (alreadySigned) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200">
        <CheckCircle2 className="size-4 shrink-0" />
        <p>
          Contrat signé{signerName ? ` par ${signerName}` : ""}. Merci, tout est
          en ordre.
        </p>
      </div>
    )
  }

  return <SignaturePad token={token} onSigned={() => router.refresh()} />
}
