import { APP_NAME, DISCLAIMER_FALLBACK } from "@/lib/config"
import { getActiveLegalTemplate } from "@/lib/legal"

export const metadata = { title: "Avertissement juridique" }

export default async function AvertissementPage() {
  const legal = await getActiveLegalTemplate()
  const disclaimer = legal?.clauses.disclaimer ?? DISCLAIMER_FALLBACK

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Avertissement juridique
      </h1>

      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        {disclaimer}
      </div>

      <section className="text-muted-foreground space-y-4 text-sm">
        <p>
          {APP_NAME} est un <strong>outil d&apos;aide à la rédaction</strong> de
          contrats de partenariat et de factures. Il ne remplace pas le conseil
          d&apos;un avocat, d&apos;un juriste ou d&apos;un expert-comptable.
        </p>
        <p>
          Les documents générés le sont automatiquement à partir des seules
          informations que vous saisissez. Ils ne constituent ni un acte
          authentique, ni un conseil juridique personnalisé, et leur conformité à
          votre situation particulière n&apos;est pas garantie.
        </p>
        <p>
          Avant toute signature ou émission, nous vous recommandons fortement de
          faire relire vos contrats et factures par un professionnel du droit ou
          de la comptabilité. Les références légales utilisées (loi n°2023-451 du
          9 juin 2023 et décret n°2025-1137) sont fournies à titre informatif.
        </p>
        <p>
          L&apos;éditeur ne saurait être tenu responsable des conséquences de
          l&apos;utilisation des documents générés.
        </p>
      </section>
    </article>
  )
}
