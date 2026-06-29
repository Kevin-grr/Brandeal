"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { formatEur } from "@/lib/format"
import { computeNewTotal, crossesThreshold } from "@/lib/threshold"
import { cn } from "@/lib/utils"
import {
  CONTENT_TYPES,
  dealSchema,
  IP_DURATIONS,
  PLATFORMS,
  type DealFormValues,
} from "@/lib/validations/deal"
import type { Brand, ContractTemplate, Profile } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BrandDialog } from "@/components/brand-dialog"
import { LegalDisclaimer } from "@/components/legal-disclaimer"
import { LegalCheckPanel } from "@/components/legal-check-panel"
import { PaywallDialog } from "@/components/paywall-dialog"
import { TemplatePicker } from "@/components/template-picker"

const STEPS = [
  "Marque",
  "Mission",
  "Rémunération",
  "Droits",
  "Récapitulatif",
] as const

const STEP_FIELDS: Record<number, (keyof DealFormValues)[]> = {
  0: ["brand_id"],
  1: [
    "title",
    "mission_description",
    "platforms",
    "content_type",
    "deliverables_count",
  ],
  2: [
    "cash_amount_eur",
    "has_in_kind",
    "in_kind_description",
    "in_kind_value_eur",
  ],
  3: ["ip_rights_duration", "exclusivity", "exclusivity_details"],
}

export function DealWizard({
  brands,
  userId,
  threshold,
  disclaimer,
  atLimit = false,
  templates = [],
  profile = null,
}: {
  brands: Brand[]
  userId: string
  threshold: number
  disclaimer: string
  atLimit?: boolean
  templates?: ContractTemplate[]
  profile?: Profile | null
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [brandList, setBrandList] = useState<Brand[]>(brands)
  const [existingTotal, setExistingTotal] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [templateKind, setTemplateKind] = useState<string | null>(null)

  function applyTemplate(t: ContractTemplate) {
    setTemplateKind(t.kind)
    const d = (t.defaults ?? {}) as Record<string, unknown>
    if (typeof d.ip_rights_duration === "string")
      form.setValue("ip_rights_duration", d.ip_rights_duration)
    if (typeof d.content_type === "string")
      form.setValue("content_type", d.content_type)
    if (typeof d.exclusivity === "boolean")
      form.setValue("exclusivity", d.exclusivity)
    if (typeof d.exclusivity_details === "string")
      form.setValue("exclusivity_details", d.exclusivity_details)
  }

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      brand_id: "",
      title: "",
      mission_description: "",
      platforms: [],
      content_type: "",
      deliverables_count: 1,
      start_date: "",
      end_date: "",
      cash_amount_eur: 0,
      has_in_kind: false,
      in_kind_description: "",
      in_kind_value_eur: 0,
      ip_rights_duration: "",
      exclusivity: false,
      exclusivity_details: "",
      french_law_applicable: true,
    },
  })

  const watchBrand = form.watch("brand_id")
  const watchStart = form.watch("start_date")
  const watchCash = form.watch("cash_amount_eur")
  const watchHasInKind = form.watch("has_in_kind")
  const watchInKind = form.watch("in_kind_value_eur")
  const watchExclusivity = form.watch("exclusivity")

  const year = watchStart
    ? new Date(watchStart).getFullYear()
    : new Date().getFullYear()
  const selectedBrand = brandList.find((b) => b.id === watchBrand)

  // Total déjà cumulé avec cette marque sur l'année (hors deal en cours).
  useEffect(() => {
    if (!watchBrand) {
      setExistingTotal(null)
      return
    }
    let active = true
    const supabase = createClient()
    supabase
      .rpc("get_brand_yearly_total", {
        p_user_id: userId,
        p_brand_id: watchBrand,
        p_year: year,
      })
      .then(({ data }) => {
        if (active) setExistingTotal(Number(data ?? 0))
      })
    return () => {
      active = false
    }
  }, [watchBrand, year, userId])

  const newTotal = computeNewTotal(
    existingTotal ?? 0,
    Number(watchCash) || 0,
    Number(watchInKind) || 0,
    watchHasInKind
  )
  const crosses = crossesThreshold(newTotal, threshold)

  async function goNext() {
    const fields = STEP_FIELDS[step]
    if (fields) {
      const ok = await form.trigger(fields)
      if (!ok) return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(values: DealFormValues) {
    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("deals")
      .insert({
        user_id: userId,
        brand_id: values.brand_id,
        title: values.title,
        status: "draft",
        mission_description: values.mission_description,
        platforms: values.platforms,
        content_type: values.content_type,
        deliverables_count: values.deliverables_count,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        cash_amount_eur: values.cash_amount_eur,
        in_kind_value_eur: values.has_in_kind ? values.in_kind_value_eur : 0,
        in_kind_description: values.has_in_kind
          ? values.in_kind_description || null
          : null,
        ip_rights_duration: values.ip_rights_duration,
        exclusivity: values.exclusivity,
        exclusivity_details: values.exclusivity
          ? values.exclusivity_details || null
          : null,
        french_law_applicable: values.french_law_applicable,
        template_kind: templateKind,
      })
      .select("id")
      .single()

    setSubmitting(false)
    if (error || !data) {
      if (error?.message?.includes("FREE_DEAL_LIMIT")) {
        setPaywallOpen(true)
        return
      }
      toast.error("Création impossible", { description: error?.message })
      return
    }
    toast.success("Partenariat créé")
    router.push(`/deals/${data.id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nouveau partenariat
        </h1>
        <p className="text-muted-foreground">
          Renseignez les informations : elles serviront à générer un contrat
          conforme.
        </p>
      </div>

      {atLimit && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <span>
            Vous avez atteint la limite de 2 partenariats ce mois-ci (plan
            gratuit).
          </span>
          <Button size="sm" type="button" onClick={() => setPaywallOpen(true)}>
            Passer au Pro
          </Button>
        </div>
      )}

      {/* Stepper */}
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                i === step ? "font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-muted-foreground mx-1">›</span>
            )}
          </li>
        ))}
      </ol>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>
                Étape {step + 1} — {STEPS[step]}
              </CardTitle>
              <CardDescription>{stepDescription(step)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* ÉTAPE 1 — Marque */}
              {step === 0 && (
                <div className="space-y-4">
                  <TemplatePicker
                    templates={templates}
                    selectedKind={templateKind}
                    onSelect={applyTemplate}
                  />
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque (annonceur)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez une marque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brandList.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <BrandDialog
                    trigger={
                      <Button type="button" variant="outline">
                        <Plus className="size-4" />
                        Créer une nouvelle marque
                      </Button>
                    }
                    onSaved={(brand) => {
                      setBrandList((prev) => [brand, ...prev])
                      form.setValue("brand_id", brand.id, {
                        shouldValidate: true,
                      })
                    }}
                  />
                </div>
              )}

              {/* ÉTAPE 2 — Mission */}
              {step === 1 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du partenariat</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex : Campagne rentrée 2026"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mission_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description de la mission</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Décrivez précisément les contenus attendus, le calendrier…"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plateformes concernées</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORMS.map((p) => {
                            const selected = field.value?.includes(p)
                            return (
                              <Button
                                key={p}
                                type="button"
                                size="sm"
                                variant={selected ? "default" : "outline"}
                                onClick={() => {
                                  const set = new Set(field.value ?? [])
                                  if (set.has(p)) set.delete(p)
                                  else set.add(p)
                                  field.onChange(Array.from(set))
                                }}
                              >
                                {p}
                              </Button>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="content_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de contenu</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTENT_TYPES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
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
                      name="deliverables_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de livrables</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              value={field.value}
                              name={field.name}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de début</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de fin</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 — Rémunération */}
              {step === 2 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="cash_amount_eur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant en numéraire (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={field.value}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="has_in_kind"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Il y a un avantage en nature</FormLabel>
                          <FormDescription>
                            Produit offert, voyage, service… à valoriser.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {watchHasInKind && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="in_kind_description"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>
                              Description de l&apos;avantage
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex : sac de la collection automne"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="in_kind_value_eur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valeur estimée (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={field.value}
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              La valeur doit correspondre au prix public TTC du
                              bien ou service reçu.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {watchBrand && (
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          Total cumulé avec {selectedBrand?.name} en {year}{" "}
                          après ce deal
                        </span>
                        <span
                          className={cn(
                            "font-semibold",
                            crosses && "text-destructive"
                          )}
                        >
                          {formatEur(newTotal)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, (newTotal / threshold) * 100)}
                        className="my-2"
                      />
                      <p className="text-muted-foreground text-xs">
                        Seuil légal : {formatEur(threshold)}
                      </p>
                      {crosses && (
                        <p className="text-destructive mt-2 text-xs font-medium">
                          ⚠️ Ce partenariat atteint ou dépasse le seuil légal de{" "}
                          {formatEur(threshold)}. Un contrat écrit est
                          obligatoire (sous peine de nullité).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 4 — Droits & exclusivité */}
              {step === 3 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="ip_rights_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Durée d&apos;exploitation des contenus par la marque
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choisir une durée" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {IP_DURATIONS.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
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
                    name="exclusivity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Exclusivité demandée</FormLabel>
                          <FormDescription>
                            La marque demande une exclusivité sur un secteur /
                            une période.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {watchExclusivity && (
                    <FormField
                      control={form.control}
                      name="exclusivity_details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Détails de l&apos;exclusivité</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={2}
                              placeholder="ex : pas de partenariat avec une marque concurrente du même secteur pendant 3 mois"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="french_law_applicable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Le public visé inclut la France</FormLabel>
                          <FormDescription>
                            Détermine la clause d&apos;application du droit
                            français.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ÉTAPE 5 — Récapitulatif */}
              {step === 4 && (
                <div className="space-y-4">
                  <RecapRow label="Marque" value={selectedBrand?.name ?? "—"} />
                  <RecapRow label="Titre" value={form.getValues("title")} />
                  <RecapRow
                    label="Mission"
                    value={form.getValues("mission_description")}
                  />
                  <RecapRow
                    label="Plateformes"
                    value={form.getValues("platforms").join(", ") || "—"}
                  />
                  <RecapRow
                    label="Rémunération"
                    value={formatEur(form.getValues("cash_amount_eur"))}
                  />
                  {form.getValues("has_in_kind") && (
                    <RecapRow
                      label="Avantage en nature"
                      value={`${form.getValues("in_kind_description")} — ${formatEur(
                        form.getValues("in_kind_value_eur")
                      )}`}
                    />
                  )}
                  <RecapRow
                    label={`Total cumulé ${selectedBrand?.name ?? ""} ${year}`}
                    value={formatEur(newTotal)}
                  />

                  <LegalCheckPanel
                    deal={form.getValues()}
                    brand={selectedBrand}
                    profile={profile}
                    yearlyTotal={existingTotal ?? 0}
                    threshold={threshold}
                  />

                  <LegalDisclaimer text={disclaimer} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              disabled={step === 0}
            >
              Précédent
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Suivant
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Création…" : "Créer le partenariat"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  )
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b pb-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 break-words">{value}</span>
    </div>
  )
}

function stepDescription(step: number): string {
  switch (step) {
    case 0:
      return "Choisissez l'annonceur de ce partenariat."
    case 1:
      return "Décrivez précisément les missions confiées."
    case 2:
      return "Indiquez la rémunération et suivez le seuil légal en temps réel."
    case 3:
      return "Droits d'exploitation, exclusivité et droit applicable."
    default:
      return "Vérifiez les informations avant de créer le partenariat."
  }
}
