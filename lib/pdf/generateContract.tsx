import {
  Document,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import { CONTENT_TYPES, IP_DURATIONS } from "@/lib/validations/deal"
import type { ActiveLegalTemplate } from "@/lib/legal"
import type { Brand, Deal, Plan, Profile } from "@/types/database"

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.5,
  },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 8, color: "#666666", marginTop: 2, marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 4,
  },
  partiesRow: { flexDirection: "row", gap: 14 },
  partyBox: {
    flex: 1,
    border: "1 solid #dddddd",
    borderRadius: 4,
    padding: 8,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#555555" },
  para: { marginBottom: 2 },
  sigRow: { flexDirection: "row", gap: 16, marginTop: 36 },
  sigBox: {
    flex: 1,
    borderTop: "1 solid #999999",
    paddingTop: 6,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 7,
    color: "#666666",
    borderTop: "1 solid #eeeeee",
    paddingTop: 4,
  },
  watermark: {
    position: "absolute",
    bottom: 48,
    left: 44,
    right: 44,
    fontSize: 7,
    color: "#999999",
    textAlign: "center",
  },
})

function eur(n: number | string | null | undefined): string {
  return `${Number(n ?? 0)
    .toFixed(2)
    .replace(".", ",")} €`
}

function frDate(d: string | null | undefined): string {
  if (!d) return "—"
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(d)
  )
}

function labelOf(
  list: readonly { value: string; label: string }[],
  value: string | null
) {
  if (!value) return "—"
  return list.find((x) => x.value === value)?.label ?? value
}

export type ContractPdfInput = {
  deal: Deal
  brand: Brand
  profile: Profile
  legal: ActiveLegalTemplate
  plan: Plan
  docRef: string
  generatedAt: Date
}

export async function generateContractPdf(
  input: ContractPdfInput
): Promise<Buffer> {
  const { deal, brand, profile, legal, plan, docRef, generatedAt } = input
  const c = legal.clauses
  const requirement = (key: string) =>
    c.contract.mandatory_clauses.find((m) => m.key === key)?.requirement ?? ""

  const doc = (
    <Document
      title={`${c.contract.title} — ${docRef}`}
      author="ContratCréateur"
    >
      <Page size="A4" style={styles.page}>
        {/* 1. En-tête */}
        <Text style={styles.title}>{c.contract.title}</Text>
        <Text style={styles.meta}>
          Référence {docRef} · généré le {frDate(generatedAt.toISOString())} ·{" "}
          {legal.law_reference}
        </Text>

        {/* 2. Entre les parties */}
        <Text style={styles.sectionTitle}>Entre les parties</Text>
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.bold}>Le créateur</Text>
            <Text>{profile.full_name}</Text>
            {profile.display_name ? (
              <Text style={styles.muted}>{profile.display_name}</Text>
            ) : null}
            <Text>
              {[profile.address_line, profile.postal_code, profile.city]
                .filter(Boolean)
                .join(", ") || "—"}
            </Text>
            {profile.siret ? <Text>SIRET : {profile.siret}</Text> : null}
            <Text>Résidence fiscale : {profile.country || "France"}</Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.bold}>L&apos;annonceur</Text>
            <Text>{brand.legal_name || brand.name}</Text>
            <Text>{brand.address_line || "—"}</Text>
            {brand.siret_or_vat ? (
              <Text>SIRET / TVA : {brand.siret_or_vat}</Text>
            ) : null}
            {brand.contact_email ? (
              <Text>Contact : {brand.contact_email}</Text>
            ) : null}
            <Text>Résidence fiscale : {brand.fiscal_country || "France"}</Text>
          </View>
        </View>

        {/* 3. Article 1 — Objet */}
        <Text style={styles.sectionTitle}>
          {c.contract.article_titles.objet}
        </Text>
        <Text style={styles.para}>{deal.mission_description}</Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>Plateformes : </Text>
          {deal.platforms.join(", ") || "—"}
        </Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>Type de contenu : </Text>
          {labelOf(CONTENT_TYPES, deal.content_type)}
        </Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>Nombre de livrables : </Text>
          {deal.deliverables_count ?? "—"}
        </Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>Calendrier : </Text>
          {frDate(deal.start_date)} → {frDate(deal.end_date)}
        </Text>

        {/* 4. Article 2 — Rémunération */}
        <Text style={styles.sectionTitle}>
          {c.contract.article_titles.remuneration}
        </Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>Rémunération en numéraire : </Text>
          {eur(deal.cash_amount_eur)}
        </Text>
        {deal.in_kind_value_eur && Number(deal.in_kind_value_eur) > 0 ? (
          <>
            <Text style={styles.para}>
              <Text style={styles.bold}>Avantage en nature : </Text>
              {deal.in_kind_description || "—"} — valeur estimée{" "}
              {eur(deal.in_kind_value_eur)} (prix public TTC).
            </Text>
            <Text style={styles.para}>
              Conditions et modalités d&apos;attribution : l&apos;avantage est
              attribué dans le cadre de la présente collaboration.
            </Text>
          </>
        ) : null}

        {/* 5. Article 3 — PI & droits */}
        <Text style={styles.sectionTitle}>
          {c.contract.article_titles.propriete_intellectuelle}
        </Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>
            Durée d&apos;exploitation des contenus :{" "}
          </Text>
          {labelOf(IP_DURATIONS, deal.ip_rights_duration)}
        </Text>
        <Text style={styles.para}>
          <Text style={styles.bold}>Exclusivité : </Text>
          {deal.exclusivity
            ? deal.exclusivity_details || "Oui"
            : "Aucune exclusivité demandée."}
        </Text>

        {/* 6. Article 4 — Droit applicable */}
        <Text style={styles.sectionTitle}>
          {c.contract.article_titles.droit_applicable}
        </Text>
        <Text style={styles.para}>
          {deal.french_law_applicable
            ? requirement("droit_applicable")
            : "Le droit applicable n'a pas été spécifié comme étant le droit français."}
        </Text>

        {/* 7. Article 5 — Transparence publicitaire */}
        <Text style={styles.sectionTitle}>
          {c.contract.article_titles.transparence}
        </Text>
        <Text style={styles.para}>{requirement("transparence")}</Text>

        {/* 8. Signatures */}
        <View style={styles.sigRow}>
          <View style={styles.sigBox}>
            <Text style={styles.bold}>
              {c.contract.signature_labels.creator}
            </Text>
            <Text style={styles.muted}>Date et signature :</Text>
          </View>
          <View style={styles.sigBox}>
            <Text style={styles.bold}>
              {c.contract.signature_labels.advertiser}
            </Text>
            <Text style={styles.muted}>Date et signature :</Text>
          </View>
        </View>

        {/* 10. Watermark plan gratuit (1re page) */}
        {plan === "free" ? (
          <Text
            fixed
            style={styles.watermark}
            render={({ pageNumber }) =>
              pageNumber === 1 ? "Document généré avec ContratCréateur" : ""
            }
          />
        ) : null}

        {/* 9. Pied de page — disclaimer sur chaque page */}
        <View style={styles.footer} fixed>
          <Text>{c.disclaimer}</Text>
        </View>
      </Page>
    </Document>
  )

  return await renderToBuffer(doc)
}
