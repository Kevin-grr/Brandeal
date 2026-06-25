import { cn } from "@/lib/utils"

/**
 * Symbole de marque Brandeal : carré arrondi indigo + deux maillons blancs
 * entrelacés (le « lien » entre la marque et le créateur). Couleur fixe (asset
 * de marque), identique en clair/sombre.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-6", className)}
      role="img"
      aria-label="Brandeal"
    >
      <rect width="64" height="64" rx="16" fill="#5B3DF5" />
      <rect
        x="13"
        y="24"
        width="22"
        height="16"
        rx="8"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
      />
      <rect
        x="29"
        y="24"
        width="22"
        height="16"
        rx="8"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
      />
    </svg>
  )
}

/**
 * Logo complet : symbole + mot-logo « Bran » + « deal » (le « deal » en couleur
 * de marque). Le « d » est partagé entre brand et deal.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className="size-6" />
      <span className="text-base font-semibold tracking-tight">
        Bran<span className="text-primary">deal</span>
      </span>
    </span>
  )
}
