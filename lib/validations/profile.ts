import { z } from "zod"

export const LEGAL_STATUSES = [
  { value: "auto_entrepreneur", label: "Auto-entrepreneur (micro-entreprise)" },
  { value: "eirl", label: "EIRL" },
  { value: "eurl", label: "EURL" },
  { value: "sasu", label: "SASU" },
  { value: "sas", label: "SAS" },
  { value: "autre", label: "Autre" },
] as const

/**
 * Schéma du profil créateur.
 * Le SIRET est optionnel à l'onboarding mais devient obligatoire pour générer
 * une facture (vérifié en Phase 7). `is_vat_franchise` (franchise en base de
 * TVA) est l'inverse de la colonne DB `is_vat_applicable`.
 */
export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Nom complet requis"),
  display_name: z.string().trim().optional().or(z.literal("")),
  legal_status: z.enum([
    "auto_entrepreneur",
    "eirl",
    "eurl",
    "sasu",
    "sas",
    "autre",
  ]),
  siret: z
    .string()
    .trim()
    .regex(/^\d{14}$/u, "Le SIRET doit comporter 14 chiffres")
    .optional()
    .or(z.literal("")),
  is_vat_franchise: z.boolean(),
  address_line: z.string().trim().min(1, "Adresse requise"),
  postal_code: z.string().trim().min(1, "Code postal requis"),
  city: z.string().trim().min(1, "Ville requise"),
  country: z.string().trim().min(1, "Pays requis"),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
