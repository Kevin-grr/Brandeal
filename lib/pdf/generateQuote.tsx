import {
  Document,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import type { Brand, Plan, Profile, Quote } from "@/types/database"

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
  partiesRow: { flexDirection: "row", justifyContent: "space-between", gap: 14 },
  partyBox: { flex: 1 },
  bold: { fontFamily: "Helvetica-Bold" },
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
  note: { marginTop: 16, fontSize: 9, color: "#555555" },
  validity: { marginTop: 8, fontSize: 9, fontFamily: "Helvetica-Bold" },
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

export type QuotePdfInput = {
  quote: Quote
  brand: Brand | null
  profile: Profile
  label: string
  plan: Plan
}

export async function generateQuotePdf(input: QuotePdfInput): Promise<Buffer> {
  const { quote, brand, profile, label, plan } = input
  const ht = Number(quote.amount_ht ?? 0)
  const rate = Number(quote.vat_rate ?? 0)
  const vat = ht * (rate / 100)
  const ttc = ht + vat
  const isFranchise = rate === 0

  const doc = (
    <Document title={`Devis ${quote.quote_number}`} author="Brandeal">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Devis</Text>
        <Text style={styles.meta}>
          N° {quote.quote_number} · émis le {frDate(quote.issue_date)}
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
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.sectionTitle}>Destinataire</Text>
            <Text style={styles.bold}>
              {brand?.legal_name || brand?.name || "—"}
            </Text>
            <Text>{brand?.address_line || "—"}</Text>
            {brand?.siret_or_vat ? (
              <Text>SIRET / TVA : {brand.siret_or_vat}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={styles.colDesc}>Prestation</Text>
          <Text style={styles.colNum}>Total</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>{label}</Text>
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
          <Text style={styles.note}>
            {quote.vat_mention || "TVA non applicable, article 293 B du CGI"}
          </Text>
        ) : null}

        {quote.valid_until ? (
          <Text style={styles.validity}>
            Devis valable jusqu&apos;au {frDate(quote.valid_until)}.
          </Text>
        ) : null}

        {quote.notes ? <Text style={styles.note}>{quote.notes}</Text> : null}

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
          <Text>
            Devis sans engagement. Bon pour accord à retourner daté et signé.
          </Text>
        </View>
      </Page>
    </Document>
  )

  return await renderToBuffer(doc)
}
