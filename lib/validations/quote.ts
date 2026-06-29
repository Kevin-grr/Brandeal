import { z } from "zod"

export const quoteSchema = z.object({
  brand_id: z.string().uuid("Sélectionnez une marque."),
  label: z.string().trim().min(1, "Décrivez la prestation."),
  amount_ht: z.number({ message: "Montant requis." }).min(0, "Montant invalide."),
  valid_until: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type QuoteFormValues = z.infer<typeof quoteSchema>
