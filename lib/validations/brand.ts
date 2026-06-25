import { z } from "zod"

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Nom de la marque requis"),
  legal_name: z.string().trim().optional().or(z.literal("")),
  address_line: z.string().trim().optional().or(z.literal("")),
  siret_or_vat: z.string().trim().optional().or(z.literal("")),
  contact_name: z.string().trim().optional().or(z.literal("")),
  contact_email: z
    .string()
    .trim()
    .email("Email invalide")
    .or(z.literal(""))
    .optional(),
  fiscal_country: z.string().trim().min(1, "Pays requis"),
  notes: z.string().trim().optional().or(z.literal("")),
})

export type BrandFormValues = z.infer<typeof brandSchema>
