"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import type { Brand } from "@/types/database"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { BrandDialog } from "./brand-dialog"

function DeleteBrandButton({
  brand,
  onDeleted,
}: {
  brand: Brand
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onConfirm() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("brands")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", brand.id)
    setLoading(false)
    if (error) {
      toast.error("Suppression impossible", { description: error.message })
      return
    }
    setOpen(false)
    toast.success("Marque supprimée")
    onDeleted()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Supprimer"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer «&nbsp;{brand.name}&nbsp;» ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              La marque sera retirée de votre liste. Les partenariats déjà liés
              restent conservés (la donnée n&apos;est jamais réellement
              effacée).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={loading}>
              {loading ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function BrandsManager({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const refresh = () => router.refresh()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marques</h1>
          <p className="text-muted-foreground">
            Vos annonceurs. Réutilisés dans vos partenariats et contrats.
          </p>
        </div>
        <BrandDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Nouvelle marque
            </Button>
          }
          onSaved={refresh}
        />
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune marque pour l&apos;instant</CardTitle>
            <CardDescription>
              Créez votre première marque pour pouvoir enregistrer un
              partenariat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Créer une marque
                </Button>
              }
              onSaved={refresh}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">
                  SIRET / TVA
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">
                    {brand.name}
                    {brand.legal_name ? (
                      <span className="text-muted-foreground block text-xs">
                        {brand.legal_name}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {brand.contact_name || brand.contact_email || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {brand.siret_or_vat || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <BrandDialog
                        initial={brand}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Éditer"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                        onSaved={refresh}
                      />
                      <DeleteBrandButton brand={brand} onDeleted={refresh} />
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
