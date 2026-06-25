import {
  Document,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import type { ActiveLegalTemplate } from "@/lib/legal"
import type { Brand, Deal, Invoice, Plan, Profile } from "@/types/database"

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
  title: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#666666", marginTop: 2, marginBottom: 18 },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  partyBox: { flex: 1 },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#555555" },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  tableHead: {
    flexDirection: "row",
    borderBottom: "1 solid #cccccc",
    paddingBottom: 4,
    marginTop: 24,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eeeeee",
    paddingVertical: 6,
  },
  colDesc: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },
  totals: { marginTop: 12, alignSelf: "flex-end", width: "50%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalStrong: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
    borderTop: "1 solid #cccccc",
    marginTop: 4,
    paddingTop: 4,
  },
  vatMention: { marginTop: 16, fontSize: 9 },
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

export type InvoicePdfInput = {
  invoice: Invoice
  deal: Deal | null
  brand: Brand | null
  profile: Profile
  legal: ActiveLegalTemplate
  plan: Plan
}

export async function generateInvoicePdf(
  input: InvoicePdfInput
): Promise<Buffer> {
  const { invoice, deal, brand, profile, legal, plan } = input
  const ht = Number(invoice.amount_ht ?? 0)
  const rate = Number(invoice.vat_rate ?? 0)
  const vat = ht * (rate / 100)
  const ttc = ht + vat
  const isFranchise = rate === 0

  const prestation = deal
    ? `Partenariat — ${deal.title}`
    : "Prestation de partenariat"

  const doc = (
    <Document
      title={`Facture ${invoice.invoice_number}`}
      author="Brandeal"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Facture</Text>
        <Text style={styles.meta}>
          N° {invoice.invoice_number} · émise le {frDate(invoice.issue_date)}
        </Text>

        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.sectionTitle}>Émetteur</Text>
            <Text style={styles.bold}>{profile.full_name}</Text>
            <Text>
              {[profile.address_line, profile.postal_code, profile.city]
                .filter(Boolean)
                .join(", ") || "—"}
            </Text>
            <Text>{profile.country || "France"}</Text>
            {profile.siret ? <Text>SIRET : {profile.siret}</Text> : null}
            {profile.vat_number ? (
              <Text>TVA : {profile.vat_number}</Text>
            ) : null}
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={styles.bold}>
              {brand?.legal_name || brand?.name || "—"}
            </Text>
            <Text>{brand?.address_line || "—"}</Text>
            {brand?.siret_or_vat ? (
              <Text>TVA intracom. : {brand.siret_or_vat}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={styles.colDesc}>Prestation</Text>
          <Text style={styles.colNum}>Montant unitaire</Text>
          <Text style={styles.colNum}>Total</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>{prestation}</Text>
          <Text style={styles.colNum}>{eur(ht)}</Text>
          <Text style={styles.colNum}>{eur(ht)}</Text>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{eur(ht)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA {isFranchise ? "(non applicable)" : `${rate}%`}</Text>
            <Text>{eur(vat)}</Text>
          </View>
          <View style={styles.totalStrong}>
            <Text>Total {isFranchise ? "" : "TTC"}</Text>
            <Text>{eur(ttc)}</Text>
          </View>
        </View>

        {isFranchise ? (
          <Text style={styles.vatMention}>
            {invoice.vat_mention || legal.clauses.invoice.vat_franchise_mention}
          </Text>
        ) : null}

        {plan === "free" ? (
          <Text
            fixed
            style={styles.watermark}
            render={({ pageNumber }) =>
              pageNumber === 1 ? "Document généré avec Brandeal" : ""
            }
          />
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{legal.clauses.invoice.retention_note}</Text>
          <Text>{legal.clauses.disclaimer}</Text>
        </View>
      </Page>
    </Document>
  )

  return await renderToBuffer(doc)
}
