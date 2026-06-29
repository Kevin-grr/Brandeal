import { Info } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { isAIConfigured } from "@/lib/ai"
import { createClient } from "@/lib/supabase/server"
import type { Brand } from "@/types/database"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractReviewer } from "@/components/contract-reviewer"
import { BrandReply } from "@/components/brand-reply"
import { DataAssistant } from "@/components/data-assistant"
import { DealImporter } from "@/components/deal-importer"

export const metadata = { title: "Assistant IA" }

export default async function AiPage() {
  const user = await requireUser()
  const configured = isAIConfigured()

  const supabase = await createClient()
  const { data: brandsRaw } = await supabase
    .from("brands")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true })
  const brands = (brandsRaw as Brand[]) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assistant IA</h1>
        <p className="text-muted-foreground">
          Votre copilote : interrogez vos données, importez un partenariat,
          analysez un contrat ou répondez à une marque.
        </p>
      </div>

      {!configured && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            Les fonctionnalités IA s&apos;activeront dès que la clé{" "}
            <code className="font-mono">ANTHROPIC_API_KEY</code> sera configurée
            côté serveur. L&apos;interface est prête.
          </p>
        </div>
      )}

      <Tabs defaultValue="assistant">
        <TabsList>
          <TabsTrigger value="assistant">Assistant</TabsTrigger>
          <TabsTrigger value="import">Importer</TabsTrigger>
          <TabsTrigger value="review">Analyse de contrat</TabsTrigger>
          <TabsTrigger value="reply">Réponse aux marques</TabsTrigger>
        </TabsList>

        <TabsContent value="assistant">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Assistant sur vos données
              </CardTitle>
              <CardDescription>
                « Combien m&apos;a payé telle marque ? », « Quelles factures sont
                en retard ? », « Quels contrats expirent bientôt ? »
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataAssistant />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Importer un partenariat
              </CardTitle>
              <CardDescription>
                Collez un email, un DM Instagram ou un brief : l&apos;IA crée le
                partenariat pré-rempli.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DealImporter brands={brands} userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Analyse IA d&apos;un contrat entrant
              </CardTitle>
              <CardDescription>
                Détecte clauses à risque, mentions manquantes et déséquilibres,
                avec un score de conformité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractReviewer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reply">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Réponse aux marques</CardTitle>
              <CardDescription>
                Un brouillon d&apos;email professionnel adapté à votre ton et
                votre objectif.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandReply />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
