import { notFound } from "next/navigation"
import { Download, FileText } from "lucide-react"

import { STORAGE_BUCKETS } from "@/lib/config"
import { createAdminClient } from "@/lib/supabase/admin"
import { resolveShareToken } from "@/lib/share-access"
import { formatDate, formatEur } from "@/lib/format"
import { Logo } from "@/components/logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ShareSignBlock } from "@/components/share-sign-block"

export const metadata = { title: "Espace marque · Brandeal" }

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const ctx = await resolveShareToken(token)
  if (!ctx) notFound()

  const { deal, brand, creator, contract, signatures } = ctx
  const admin = createAdminClient()

  let contractUrl: string | null = null
  if (contract?.pdf_storage_path) {
    const { data } = await admin.storage
      .from(STORAGE_BUCKETS.contracts)
      .createSignedUrl(contract.pdf_storage_path, 3600)
    contractUrl = data?.signedUrl ?? null
  }

  const advertiserSig = signatures.find((s) => s.signer_role === "advertiser")
  const total =
    Number(deal.cash_amount_eur ?? 0) + Number(deal.in_kind_value_eur ?? 0)

  return (
    <div className="bg-muted/20 min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {deal.title}
          </h1>
          <p className="text-muted-foreground">
            Partenariat proposé par {creator?.display_name || creator?.full_name || "le créateur"}
            {brand?.name ? ` · ${brand.name}` : ""}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Résumé</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-xs">Mission</p>
              <p>{deal.mission_description}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Plateformes</p>
              <p>{deal.platforms.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Période</p>
              <p>
                {formatDate(deal.start_date)} → {formatDate(deal.end_date)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Rémunération totale</p>
              <p className="font-medium">{formatEur(total)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                Droits d&apos;exploitation
              </p>
              <p>{deal.ip_rights_duration || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contrat</CardTitle>
            <CardDescription>
              {contract
                ? "Consultez le contrat puis signez-le ci-dessous."
                : "Le contrat n'est pas encore disponible."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contractUrl && (
              <a
                href={contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-input hover:bg-muted inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <FileText className="size-4" />
                Lire le contrat (PDF)
                <Download className="size-3.5" />
              </a>
            )}

            {contract && (
              <ShareSignBlock
                token={token}
                alreadySigned={!!advertiserSig}
                signerName={advertiserSig?.signer_name}
              />
            )}
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-xs">
          Espace sécurisé généré par Brandeal. Ne partagez ce lien qu&apos;avec
          les personnes concernées.
        </p>
      </main>
    </div>
  )
}
