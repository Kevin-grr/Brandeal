"use client"

import { useMemo, useState } from "react"

import {
  estimatePrice,
  type ContentFormat,
  type Platform,
  type Sector,
} from "@/lib/pricing"
import { formatEur } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitch", label: "Twitch" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
]

const FORMATS: { value: ContentFormat; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel / Short" },
  { value: "story", label: "Story" },
  { value: "ugc", label: "UGC (sans diffusion)" },
  { value: "video_integration", label: "Intégration vidéo" },
  { value: "video_dedicated", label: "Vidéo dédiée" },
]

const SECTORS: { value: Sector; label: string }[] = [
  { value: "general", label: "Généraliste" },
  { value: "beaute", label: "Beauté" },
  { value: "mode", label: "Mode" },
  { value: "tech", label: "Tech" },
  { value: "finance", label: "Finance" },
  { value: "food", label: "Food" },
  { value: "sport", label: "Sport" },
  { value: "gaming", label: "Gaming" },
  { value: "voyage", label: "Voyage" },
]

export function PricingEstimator({
  onUsePrice,
}: {
  onUsePrice?: (price: number) => void
}) {
  const [platform, setPlatform] = useState<Platform>("instagram")
  const [followers, setFollowers] = useState(10000)
  const [engagement, setEngagement] = useState(4)
  const [format, setFormat] = useState<ContentFormat>("reel")
  const [sector, setSector] = useState<Sector>("general")
  const [usageRights, setUsageRights] = useState(false)
  const [exclusivity, setExclusivity] = useState(false)

  const result = useMemo(
    () =>
      estimatePrice({
        platform,
        followers,
        engagementRate: engagement,
        format,
        sector,
        usageRights,
        exclusivity,
      }),
    [platform, followers, engagement, format, sector, usageRights, exclusivity]
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Plateforme</Label>
          <Select
            value={platform}
            onValueChange={(v) => setPlatform(v as Platform)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Format de contenu</Label>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as ContentFormat)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="followers">Abonnés</Label>
          <Input
            id="followers"
            type="number"
            inputMode="numeric"
            min={0}
            value={followers}
            onChange={(e) => setFollowers(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="engagement">Taux d&apos;engagement (%)</Label>
          <Input
            id="engagement"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={engagement}
            onChange={(e) => setEngagement(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Secteur</Label>
          <Select value={sector} onValueChange={(v) => setSector(v as Sector)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={usageRights}
            onCheckedChange={(v) => setUsageRights(v === true)}
          />
          Cession de droits / réutilisation pub (+30 %)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={exclusivity}
            onCheckedChange={(v) => setExclusivity(v === true)}
          />
          Exclusivité demandée (+25 %)
        </label>
      </div>

      <div className="bg-muted/40 grid grid-cols-3 gap-2 rounded-lg border p-4 text-center">
        <div>
          <p className="text-muted-foreground text-xs">Minimum</p>
          <p className="text-lg font-semibold">{formatEur(result.min)}</p>
        </div>
        <div className="border-primary rounded-md border-2 py-1">
          <p className="text-primary text-xs font-medium">Conseillé</p>
          <p className="text-2xl font-bold">{formatEur(result.recommended)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Premium</p>
          <p className="text-lg font-semibold">{formatEur(result.premium)}</p>
        </div>
      </div>

      {onUsePrice && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => onUsePrice(result.recommended)}
        >
          Utiliser le tarif conseillé ({formatEur(result.recommended)})
        </Button>
      )}

      <p className="text-muted-foreground text-xs">
        Estimation indicative basée sur des repères publics du marché de
        l&apos;influence. Le tarif réel dépend de votre niche, de votre
        audience et de la marque. À ajuster selon votre expérience.
      </p>
    </div>
  )
}
