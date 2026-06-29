/**
 * Types de la base de données — rédigés à la main d'après les migrations
 * (`supabase/migrations/`). À régénérer avec `supabase gen types typescript`
 * une fois le projet Supabase lié (voir README).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type LegalStatus =
  | "auto_entrepreneur"
  | "eirl"
  | "eurl"
  | "sasu"
  | "sas"
  | "autre"

export type DealStatus = "draft" | "sent" | "signed" | "paid" | "cancelled"
export type InvoiceStatus = "draft" | "sent" | "paid"
export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "refused"
  | "expired"
export type ReviewStatus = "pending" | "processing" | "done" | "error"
export type ReviewBalance =
  | "favorable_brand"
  | "balanced"
  | "favorable_creator"
export type SignerRole = "creator" | "advertiser"
export type Plan = "free" | "creator" | "studio" | "expert"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          display_name: string | null
          legal_status: LegalStatus
          siret: string | null
          vat_number: string | null
          is_vat_applicable: boolean | null
          address_line: string | null
          postal_code: string | null
          city: string | null
          country: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          display_name?: string | null
          legal_status: LegalStatus
          siret?: string | null
          vat_number?: string | null
          is_vat_applicable?: boolean | null
          address_line?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          display_name?: string | null
          legal_status?: LegalStatus
          siret?: string | null
          vat_number?: string | null
          is_vat_applicable?: boolean | null
          address_line?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          legal_name: string | null
          address_line: string | null
          siret_or_vat: string | null
          contact_name: string | null
          contact_email: string | null
          fiscal_country: string | null
          notes: string | null
          deleted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          legal_name?: string | null
          address_line?: string | null
          siret_or_vat?: string | null
          contact_name?: string | null
          contact_email?: string | null
          fiscal_country?: string | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          legal_name?: string | null
          address_line?: string | null
          siret_or_vat?: string | null
          contact_name?: string | null
          contact_email?: string | null
          fiscal_country?: string | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          id: string
          user_id: string
          brand_id: string
          title: string
          status: DealStatus
          mission_description: string
          platforms: string[]
          content_type: string | null
          deliverables_count: number | null
          start_date: string | null
          end_date: string | null
          cash_amount_eur: number | null
          in_kind_value_eur: number | null
          in_kind_description: string | null
          ip_rights_duration: string | null
          exclusivity: boolean | null
          exclusivity_details: string | null
          french_law_applicable: boolean | null
          template_kind: string | null
          sent_at: string | null
          signed_at: string | null
          published_at: string | null
          paid_at: string | null
          creator_profile_id: string | null
          deleted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          brand_id: string
          title: string
          status?: DealStatus
          mission_description: string
          platforms?: string[]
          content_type?: string | null
          deliverables_count?: number | null
          start_date?: string | null
          end_date?: string | null
          cash_amount_eur?: number | null
          in_kind_value_eur?: number | null
          in_kind_description?: string | null
          ip_rights_duration?: string | null
          exclusivity?: boolean | null
          exclusivity_details?: string | null
          french_law_applicable?: boolean | null
          template_kind?: string | null
          sent_at?: string | null
          signed_at?: string | null
          published_at?: string | null
          paid_at?: string | null
          creator_profile_id?: string | null
          deleted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string
          title?: string
          status?: DealStatus
          mission_description?: string
          platforms?: string[]
          content_type?: string | null
          deliverables_count?: number | null
          start_date?: string | null
          end_date?: string | null
          cash_amount_eur?: number | null
          in_kind_value_eur?: number | null
          in_kind_description?: string | null
          ip_rights_duration?: string | null
          exclusivity?: boolean | null
          exclusivity_details?: string | null
          french_law_applicable?: boolean | null
          template_kind?: string | null
          sent_at?: string | null
          signed_at?: string | null
          published_at?: string | null
          paid_at?: string | null
          creator_profile_id?: string | null
          deleted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_template_versions: {
        Row: {
          id: string
          version_label: string
          law_reference: string
          threshold_eur: number
          mandatory_clauses: Json
          effective_date: string
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          version_label: string
          law_reference: string
          threshold_eur?: number
          mandatory_clauses: Json
          effective_date: string
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          version_label?: string
          law_reference?: string
          threshold_eur?: number
          mandatory_clauses?: Json
          effective_date?: string
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          id: string
          deal_id: string
          legal_template_version_id: string
          pdf_storage_path: string | null
          generated_at: string | null
          is_final: boolean | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          deal_id: string
          legal_template_version_id: string
          pdf_storage_path?: string | null
          generated_at?: string | null
          is_final?: boolean | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          deal_id?: string
          legal_template_version_id?: string
          pdf_storage_path?: string | null
          generated_at?: string | null
          is_final?: boolean | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          deal_id: string | null
          invoice_number: string
          issue_date: string
          amount_ht: number
          vat_rate: number | null
          vat_mention: string | null
          pdf_storage_path: string | null
          status: InvoiceStatus
          deleted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          deal_id?: string | null
          invoice_number: string
          issue_date?: string
          amount_ht: number
          vat_rate?: number | null
          vat_mention?: string | null
          pdf_storage_path?: string | null
          status?: InvoiceStatus
          deleted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          deal_id?: string | null
          invoice_number?: string
          issue_date?: string
          amount_ht?: number
          vat_rate?: number | null
          vat_mention?: string | null
          pdf_storage_path?: string | null
          status?: InvoiceStatus
          deleted_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: Plan
          status: string | null
          current_period_end: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: Plan
          status?: string | null
          current_period_end?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: Plan
          status?: string | null
          current_period_end?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          id: string
          owner_id: string
          display_name: string
          full_name: string | null
          legal_status: LegalStatus | null
          siret: string | null
          is_vat_applicable: boolean | null
          address_line: string | null
          postal_code: string | null
          city: string | null
          country: string | null
          is_default: boolean | null
          deleted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          display_name: string
          full_name?: string | null
          legal_status?: LegalStatus | null
          siret?: string | null
          is_vat_applicable?: boolean | null
          address_line?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          is_default?: boolean | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          display_name?: string
          full_name?: string | null
          legal_status?: LegalStatus | null
          siret?: string | null
          is_vat_applicable?: boolean | null
          address_line?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          is_default?: boolean | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          id: string
          kind: string
          name: string
          description: string
          icon: string | null
          defaults: Json
          sort_order: number
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          kind: string
          name: string
          description: string
          icon?: string | null
          defaults?: Json
          sort_order?: number
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          kind?: string
          name?: string
          description?: string
          icon?: string | null
          defaults?: Json
          sort_order?: number
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          deal_id: string | null
          brand_id: string | null
          quote_number: string
          issue_date: string
          valid_until: string | null
          amount_ht: number
          vat_rate: number | null
          vat_mention: string | null
          notes: string | null
          status: QuoteStatus
          pdf_storage_path: string | null
          accepted_at: string | null
          deleted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          deal_id?: string | null
          brand_id?: string | null
          quote_number: string
          issue_date?: string
          valid_until?: string | null
          amount_ht?: number
          vat_rate?: number | null
          vat_mention?: string | null
          notes?: string | null
          status?: QuoteStatus
          pdf_storage_path?: string | null
          accepted_at?: string | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          deal_id?: string | null
          brand_id?: string | null
          quote_number?: string
          issue_date?: string
          valid_until?: string | null
          amount_ht?: number
          vat_rate?: number | null
          vat_mention?: string | null
          notes?: string | null
          status?: QuoteStatus
          pdf_storage_path?: string | null
          accepted_at?: string | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      contract_reviews: {
        Row: {
          id: string
          user_id: string
          brand_id: string | null
          source_filename: string | null
          source_text: string | null
          status: ReviewStatus
          score: number | null
          balance: ReviewBalance | null
          summary: string | null
          findings: Json | null
          missing_mentions: Json | null
          error_message: string | null
          deleted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          brand_id?: string | null
          source_filename?: string | null
          source_text?: string | null
          status?: ReviewStatus
          score?: number | null
          balance?: ReviewBalance | null
          summary?: string | null
          findings?: Json | null
          missing_mentions?: Json | null
          error_message?: string | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string | null
          source_filename?: string | null
          source_text?: string | null
          status?: ReviewStatus
          score?: number | null
          balance?: ReviewBalance | null
          summary?: string | null
          findings?: Json | null
          missing_mentions?: Json | null
          error_message?: string | null
          deleted_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      brand_share_tokens: {
        Row: {
          id: string
          user_id: string
          deal_id: string
          token: string
          expires_at: string | null
          revoked_at: string | null
          last_viewed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          deal_id: string
          token: string
          expires_at?: string | null
          revoked_at?: string | null
          last_viewed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          deal_id?: string
          token?: string
          expires_at?: string | null
          revoked_at?: string | null
          last_viewed_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      contract_signatures: {
        Row: {
          id: string
          contract_id: string
          deal_id: string
          signer_role: SignerRole
          signer_name: string
          signer_email: string | null
          signature_data: string | null
          provider: string | null
          provider_ref: string | null
          signed_ip: string | null
          signed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          contract_id: string
          deal_id: string
          signer_role: SignerRole
          signer_name: string
          signer_email?: string | null
          signature_data?: string | null
          provider?: string | null
          provider_ref?: string | null
          signed_ip?: string | null
          signed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string
          deal_id?: string
          signer_role?: SignerRole
          signer_name?: string
          signer_email?: string | null
          signature_data?: string | null
          provider?: string | null
          provider_ref?: string | null
          signed_ip?: string | null
          signed_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          id: string
          user_id: string
          invoice_id: string
          step: number
          channel: string
          sent_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          invoice_id: string
          step: number
          channel?: string
          sent_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          invoice_id?: string
          step?: number
          channel?: string
          sent_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      get_brand_yearly_total: {
        Args: { p_user_id: string; p_brand_id: string; p_year: number }
        Returns: number
      }
      create_invoice: {
        Args: {
          p_deal_id: string
          p_amount_ht: number
          p_vat_rate: number
          p_vat_mention: string
        }
        Returns: Database["public"]["Tables"]["invoices"]["Row"]
      }
      create_quote: {
        Args: {
          p_brand_id: string
          p_deal_id: string
          p_amount_ht: number
          p_vat_rate: number
          p_vat_mention: string
          p_valid_until: string
          p_notes: string
        }
        Returns: Database["public"]["Tables"]["quotes"]["Row"]
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

// --- Alias de confort -------------------------------------------------------
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Brand = Database["public"]["Tables"]["brands"]["Row"]
export type Deal = Database["public"]["Tables"]["deals"]["Row"]
export type Contract = Database["public"]["Tables"]["contracts"]["Row"]
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"]
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
export type LegalTemplateVersion =
  Database["public"]["Tables"]["legal_template_versions"]["Row"]
export type CreatorProfile =
  Database["public"]["Tables"]["creator_profiles"]["Row"]
export type ContractTemplate =
  Database["public"]["Tables"]["contract_templates"]["Row"]
export type Quote = Database["public"]["Tables"]["quotes"]["Row"]
export type ContractReview =
  Database["public"]["Tables"]["contract_reviews"]["Row"]
export type BrandShareToken =
  Database["public"]["Tables"]["brand_share_tokens"]["Row"]
export type ContractSignature =
  Database["public"]["Tables"]["contract_signatures"]["Row"]
export type PaymentReminder =
  Database["public"]["Tables"]["payment_reminders"]["Row"]

/** Une anomalie détectée par l'analyse IA d'un contrat entrant. */
export type ReviewFinding = {
  severity: "info" | "warning" | "critical"
  title: string
  detail: string
  clause?: string
}

/**
 * Forme typée du JSON `mandatory_clauses` (seed `legal_template_versions`).
 * Sert au moteur PDF (Phase 5) et aux affichages légaux.
 */
export type LegalClauses = {
  threshold_eur: number
  threshold_basis: string
  threshold_period: string
  threshold_rule: string
  contract: {
    title: string
    mandatory_clauses: { key: string; label: string; requirement: string }[]
    article_titles: {
      objet: string
      remuneration: string
      propriete_intellectuelle: string
      droit_applicable: string
      transparence: string
    }
    signature_labels: { creator: string; advertiser: string }
  }
  invoice: {
    mandatory_mentions: string[]
    vat_franchise_mention: string
    retention_note: string
  }
  disclaimer: string
  advertising_transparency_on_screen_note: string
}
