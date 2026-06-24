"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import {
  LEGAL_STATUSES,
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile"
import type { Profile } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProfileForm({
  mode,
  initial,
}: {
  mode: "onboarding" | "settings"
  initial?: Profile | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      display_name: initial?.display_name ?? "",
      legal_status: initial?.legal_status ?? "auto_entrepreneur",
      siret: initial?.siret ?? "",
      is_vat_franchise: initial ? !(initial.is_vat_applicable ?? false) : true,
      address_line: initial?.address_line ?? "",
      postal_code: initial?.postal_code ?? "",
      city: initial?.city ?? "",
      country: initial?.country ?? "France",
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      toast.error("Session expirée, reconnectez-vous.")
      router.push("/login")
      return
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: values.full_name,
      display_name: values.display_name || null,
      legal_status: values.legal_status,
      siret: values.siret || null,
      is_vat_applicable: !values.is_vat_franchise,
      address_line: values.address_line,
      postal_code: values.postal_code,
      city: values.city,
      country: values.country,
    })

    if (error) {
      setLoading(false)
      toast.error("Enregistrement impossible", { description: error.message })
      return
    }

    if (mode === "onboarding") {
      // Crée la ligne d'abonnement gratuit (ne fait rien si déjà présente).
      await supabase
        .from("subscriptions")
        .upsert(
          { user_id: user.id, plan: "free" },
          { onConflict: "user_id", ignoreDuplicates: true }
        )
      toast.success("Profil enregistré")
      router.push("/dashboard")
      router.refresh()
    } else {
      setLoading(false)
      toast.success("Profil mis à jour")
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Prénom Nom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom d&apos;affichage (pseudo créateur)</FormLabel>
              <FormControl>
                <Input placeholder="@moncompte" {...field} />
              </FormControl>
              <FormDescription>Optionnel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="legal_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut légal</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEGAL_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SIRET</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="14 chiffres"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optionnel ici, mais obligatoire pour générer une facture.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_vat_franchise"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Je suis en franchise en base de TVA</FormLabel>
                <FormDescription>
                  Cas par défaut du micro-entrepreneur sous le seuil. La mention
                  «&nbsp;TVA non applicable, article 293 B du CGI&nbsp;»
                  figurera sur vos factures.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="address_line"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="N° et rue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Pays</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Enregistrement…"
            : mode === "onboarding"
              ? "Continuer vers le tableau de bord"
              : "Enregistrer les modifications"}
        </Button>
      </form>
    </Form>
  )
}
