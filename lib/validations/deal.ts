import { z } from "zod"

export const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitch",
  "X",
  "Autre",
] as const

export const CONTENT_TYPES = [
  { value: "post", label: "Post" },
  { value: "story", label: "Story" },
  { value: "reel_short", label: "Reel / Short" },
  { value: "video_longue", label: "Vidéo longue" },
  { value: "live", label: "Live" },
  { value: "autre", label: "Autre" },
] as const

export const IP_DURATIONS = [
  { value: "6_mois", label: "6 mois" },
  { value: "1_an", label: "1 an" },
  { value: "2_ans", label: "2 ans" },
  { value: "illimitee", label: "Illimitée" },
  { value: "personnalisee", label: "Personnalisée" },
] as const

export const dealSchema = z
  .object({
    brand_id: z.string().uuid("Sélectionnez une marque."),
    title: z.string().trim().min(1, "Titre requis."),
    mission_description: z
      .string()
      .trim()
      .min(1, "Description de la mission requise."),
    platforms: z
      .array(z.string())
      .min(1, "Sélectionnez au moins une plateforme."),
    content_type: z.string().min(1, "Type de contenu requis."),
    deliverables_count: z
      .number({ message: "Nombre requis." })
      .int("Nombre entier.")
      .min(1, "Au moins 1 livrable."),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
    cash_amount_eur: z.number({ message: "Montant requis." }).min(0),
    has_in_kind: z.boolean(),
    in_kind_description: z.string().optional().or(z.literal("")),
    in_kind_value_eur: z.number({ message: "Valeur requise." }).min(0),
    ip_rights_duration: z.string().min(1, "Durée d'exploitation requise."),
    exclusivity: z.boolean(),
    exclusivity_details: z.string().optional().or(z.literal("")),
    french_law_applicable: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.has_in_kind) {
      if (!v.in_kind_description || v.in_kind_description.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["in_kind_description"],
          message: "Décrivez l'avantage en nature.",
        })
      }
      if (!v.in_kind_value_eur || v.in_kind_value_eur <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["in_kind_value_eur"],
          message: "Indiquez la valeur estimée (prix public TTC).",
        })
      }
    }
    if (
      v.exclusivity &&
      (!v.exclusivity_details || v.exclusivity_details.trim() === "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["exclusivity_details"],
        message: "Précisez l'exclusivité (secteur, durée).",
      })
    }
    const inKind = v.has_in_kind ? v.in_kind_value_eur || 0 : 0
    if ((v.cash_amount_eur || 0) + inKind <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["cash_amount_eur"],
        message: "Indiquez une rémunération ou un avantage en nature.",
      })
    }
  })

export type DealFormValues = z.infer<typeof dealSchema>
