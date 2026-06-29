"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, Plus } from "lucide-react"
import { toast } from "sonner"

import { formatDate, formatEur } from "@/lib/format"
import type { Brand, Quote, QuoteStatus } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QuoteForm } from "@/components/quote-form"

const STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  refused: "Refusé",
  expired: "Expiré",
}

export type QuoteRow = Quote & { downloadUrl: string | null }

export function QuotesManager({
  quotes,
  brands,
  brandName,
}: {
  quotes: QuoteRow[]
  brands: Brand[]
  brandName: Record<string, string>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)

  async function accept(quote: QuoteRow) {
    setAccepting(quote.id)
    const res = await fetch(`/api/quotes/${quote.id}/accept`, {
      method: "POST",
    })
    const data = (await res.json().catch(() => ({}))) as {
      dealId?: string
      error?: string
    }
    setAccepting(null)
    if (!res.ok) {
      toast.error("Conversion impossible", { description: data.error })
      return
    }
    toast.success("Devis accepté — partenariat créé")
    if (data.dealId) router.push(`/deals/${data.dealId}`)
    else router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">
            Établissez un devis, puis transformez-le en partenariat en un clic.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                Nouveau devis
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau devis</DialogTitle>
              <DialogDescription>
                Un PDF est généré automatiquement avec vos mentions.
              </DialogDescription>
            </DialogHeader>
            <QuoteForm brands={brands} onCreated={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun devis pour l&apos;instant</CardTitle>
            <CardDescription>
              Créez un devis pour proposer un tarif à une marque avant le
              contrat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button>
                    <Plus className="size-4" />
                    Créer un devis
                  </Button>
                }
              />
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nouveau devis</DialogTitle>
                  <DialogDescription>
                    Un PDF est généré automatiquement avec vos mentions.
                  </DialogDescription>
                </DialogHeader>
                <QuoteForm brands={brands} onCreated={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant HT</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">
                    {q.quote_number}
                  </TableCell>
                  <TableCell>
                    {q.brand_id ? brandName[q.brand_id] ?? "—" : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                      {STATUS_LABEL[q.status]}
                    </span>
                    {q.status === "accepted" && q.deal_id ? (
                      <Link
                        href={`/deals/${q.deal_id}`}
                        className="text-primary ml-2 text-xs underline"
                      >
                        voir
                      </Link>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatEur(q.amount_ht)}
                    <span className="text-muted-foreground block text-xs">
                      {formatDate(q.issue_date)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {q.downloadUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          nativeButton={false}
                          render={
                            <a
                              href={q.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Télécharger"
                            />
                          }
                        >
                          <Download className="size-4" />
                        </Button>
                      )}
                      {q.status !== "accepted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => accept(q)}
                          disabled={accepting === q.id}
                        >
                          {accepting === q.id ? "…" : "Accepter"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
