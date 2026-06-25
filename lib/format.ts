export function formatEur(n: number | string | null | undefined): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(n ?? 0))
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—"
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(d)
  )
}
