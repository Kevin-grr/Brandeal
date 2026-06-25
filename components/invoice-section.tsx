"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export type InvoiceItem = {
  id: string
  number: string
  date: string | null
  url: string | null
}

export function InvoiceSection({
  dealId,
  canInvoice,
  invoices,
}: {
  dealId: string
  canInvoice: boolean
  invoices: InvoiceItem[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    const res = await fetch(`/api/deals/${dealId}/invoice`, { method: "POST" })
    setLoading(false)
    const body = (await res.json().catch(() => ({}))) as {
      error?: string
      code?: string
      invoiceNumber?: string
    }
    if (!res.ok) {
      toast.error("Facture impossible", { description: body.error })
      if (body.code === "NO_SIRET") router.push("/settings")
      return
    }
    toast.success(`Facture ${body.invoiceNumber ?? ""} générée`)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={!canInvoice || loading}>
        <FileText className="size-4" />
        {loading ? "Génération…" : "Générer la facture"}
      </Button>
      {!canInvoice ? (
        <p className="text-muted-foreground text-xs">
          Disponible une fois le partenariat au statut «&nbsp;Signé&nbsp;».
        </p>
      ) : null}

      {invoices.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between gap-3 p-3 text-sm"
            >
              <span>
                <span className="font-medium">{inv.number}</span>
                {inv.date ? (
                  <span className="text-muted-foreground">
                    {" · "}
                    {new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                    }).format(new Date(inv.date))}
                  </span>
                ) : null}
              </span>
              {inv.url ? (
                <Button
                  size="sm"
                  variant="outline"
                  render={<a href={inv.url} target="_blank" rel="noreferrer" />}
                >
                  <Download className="size-4" />
                  PDF
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
