"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { brandSchema, type BrandFormValues } from "@/lib/validations/brand"
import type { Brand } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function BrandForm({
  initial,
  onSaved,
}: {
  initial?: Brand | null
  onSaved: (brand: Brand) => void
}) {
  const [loading, setLoading] = useState(false)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initial?.name ?? "",
      legal_name: initial?.legal_name ?? "",
      address_line: initial?.address_line ?? "",
      siret_or_vat: initial?.siret_or_vat ?? "",
      contact_name: initial?.contact_name ?? "",
      contact_email: initial?.contact_email ?? "",
      fiscal_country: initial?.fiscal_country ?? "France",
      notes: initial?.notes ?? "",
    },
  })

  async function onSubmit(values: BrandFormValues) {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      toast.error("Session expirée, reconnectez-vous.")
      return
    }

    const payload = {
      user_id: user.id,
      name: values.name,
      legal_name: values.legal_name || null,
      address_line: values.address_line || null,
      siret_or_vat: values.siret_or_vat || null,
      contact_name: values.contact_name || null,
      contact_email: values.contact_email || null,
      fiscal_country: values.fiscal_country,
      notes: values.notes || null,
    }

    const res = initial
      ? await supabase
          .from("brands")
          .update(payload)
          .eq("id", initial.id)
          .select()
          .single()
      : await supabase.from("brands").insert(payload).select().single()

    setLoading(false)
    if (res.error) {
      toast.error("Enregistrement impossible", {
        description: res.error.message,
      })
      return
    }
    toast.success(initial ? "Marque mise à jour" : "Marque créée")
    onSaved(res.data as Brand)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la marque</FormLabel>
              <FormControl>
                <Input placeholder="Nom commercial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="legal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raison sociale</FormLabel>
              <FormControl>
                <Input placeholder="Dénomination légale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_line"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="siret_or_vat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET / N° TVA</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscal_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays de résidence fiscale</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email du contact</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Enregistrement…"
            : initial
              ? "Enregistrer"
              : "Créer la marque"}
        </Button>
      </form>
    </Form>
  )
}
