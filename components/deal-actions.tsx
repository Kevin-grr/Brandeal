"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import type { DealStatus } from "@/types/database"
import { DEAL_STATUS_LABELS } from "@/components/deal-status-badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_OPTIONS: DealStatus[] = [
  "draft",
  "sent",
  "signed",
  "paid",
  "cancelled",
]

export function DealActions({
  dealId,
  status,
  hasContract,
  downloadUrl,
}: {
  dealId: string
  status: DealStatus
  hasContract: boolean
  downloadUrl: string | null
}) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function generate() {
    setGenerating(true)
    const res = await fetch(`/api/deals/${dealId}/contract`, { method: "POST" })
    setGenerating(false)
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      toast.error("Génération impossible", { description: body.error })
      return
    }
    toast.success("Contrat généré")
    router.refresh()
  }

  async function changeStatus(next: string) {
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("deals")
      .update({ status: next as DealStatus })
      .eq("id", dealId)
    setUpdating(false)
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message })
      return
    }
    toast.success("Statut mis à jour")
    router.refresh()
  }

  async function remove() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("deals")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", dealId)
    setDeleting(false)
    if (error) {
      toast.error("Suppression impossible", { description: error.message })
      return
    }
    setDeleteOpen(false)
    toast.success("Partenariat supprimé")
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label className="text-xs">Statut</Label>
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) changeStatus(v)
          }}
          disabled={updating}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {DEAL_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={generate} disabled={generating}>
        <FileText className="size-4" />
        {generating
          ? "Génération…"
          : hasContract
            ? "Régénérer le contrat"
            : "Générer le contrat (PDF)"}
      </Button>

      {downloadUrl ? (
        <Button
          variant="outline"
          render={<a href={downloadUrl} target="_blank" rel="noreferrer" />}
        >
          <Download className="size-4" />
          Télécharger le contrat
        </Button>
      ) : null}

      <div className="grow" />

      <Button
        variant="destructive"
        onClick={() => setDeleteOpen(true)}
        aria-label="Supprimer le partenariat"
      >
        <Trash2 className="size-4" />
        Supprimer
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce partenariat ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le partenariat sera retiré de votre liste. Les contrats déjà
              générés restent conservés (la donnée n&apos;est jamais réellement
              effacée).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={deleting}>
              {deleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
