"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { PROFILE_LIMITS } from "@/lib/config"
import type { CreatorProfile, Plan } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfilesManager({
  plan,
  ownerId,
  profiles,
}: {
  plan: Plan
  ownerId: string
  profiles: CreatorProfile[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [fullName, setFullName] = useState("")
  const [siret, setSiret] = useState("")
  const [loading, setLoading] = useState(false)

  // Le profil principal compte pour 1. On compare le total (1 + additionnels).
  const limit = PROFILE_LIMITS[plan] ?? null
  const used = 1 + profiles.length
  const canAdd = limit === null || used < limit

  async function add() {
    if (!displayName.trim()) {
      toast.error("Le nom d'affichage est requis.")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("creator_profiles").insert({
      owner_id: ownerId,
      display_name: displayName,
      full_name: fullName || null,
      siret: siret || null,
    })
    setLoading(false)
    if (error) {
      toast.error("Création impossible", { description: error.message })
      return
    }
    toast.success("Profil ajouté")
    setDisplayName("")
    setFullName("")
    setSiret("")
    setOpen(false)
    router.refresh()
  }

  async function remove(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("creator_profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
    if (error) {
      toast.error("Suppression impossible", { description: error.message })
      return
    }
    toast.success("Profil supprimé")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Gérez plusieurs identités créateur (utile pour les managers et agences).
        {limit !== null
          ? ` Votre plan permet ${limit} profil${limit > 1 ? "s" : ""} au total.`
          : " Votre plan autorise un nombre illimité de profils."}
      </p>

      {profiles.length > 0 && (
        <ul className="divide-y rounded-md border">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div>
                <p className="text-sm font-medium">{p.display_name}</p>
                {p.full_name && (
                  <p className="text-muted-foreground text-xs">{p.full_name}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => remove(p.id)}
                aria-label="Supprimer le profil"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {canAdd ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="outline">
                <UserPlus className="size-4" />
                Ajouter un profil
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau profil créateur</DialogTitle>
              <DialogDescription>
                Une identité supplémentaire pour vos partenariats.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-display">Nom d&apos;affichage</Label>
                <Input
                  id="p-display"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="@compte ou nom de scène"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-full">Nom complet (optionnel)</Label>
                <Input
                  id="p-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-siret">SIRET (optionnel)</Label>
                <Input
                  id="p-siret"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                />
              </div>
              <Button onClick={add} disabled={loading} className="w-full">
                <Plus className="size-4" />
                {loading ? "Ajout…" : "Ajouter le profil"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Limite de profils atteinte pour le plan {plan}.{" "}
          <a href="/pricing" className="underline">
            Passez à un plan supérieur
          </a>{" "}
          pour en ajouter davantage.
        </div>
      )}
    </div>
  )
}
