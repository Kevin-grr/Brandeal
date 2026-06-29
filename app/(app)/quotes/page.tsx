import { requireUser } from "@/lib/auth"
import { STORAGE_BUCKETS } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"
import type { Brand, Quote } from "@/types/database"
import { QuotesManager, type QuoteRow } from "@/components/quotes-manager"

export const metadata = { title: "Devis" }

export default async function QuotesPage() {
  await requireUser()
  const supabase = await createClient()

  const [{ data: quotesRaw }, { data: brandsRaw }] = await Promise.all([
    supabase
      .from("quotes")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("brands")
      .select("*")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ])

  const brands = (brandsRaw as Brand[]) ?? []
  const brandName: Record<string, string> = Object.fromEntries(
    brands.map((b) => [b.id, b.name])
  )

  const quotes: QuoteRow[] = await Promise.all(
    ((quotesRaw as Quote[]) ?? []).map(async (q) => {
      let downloadUrl: string | null = null
      if (q.pdf_storage_path) {
        const { data } = await supabase.storage
          .from(STORAGE_BUCKETS.quotes)
          .createSignedUrl(q.pdf_storage_path, 3600)
        downloadUrl = data?.signedUrl ?? null
      }
      return { ...q, downloadUrl }
    })
  )

  return (
    <QuotesManager quotes={quotes} brands={brands} brandName={brandName} />
  )
}
