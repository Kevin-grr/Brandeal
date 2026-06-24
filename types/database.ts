/**
 * Type placeholder de la base de données.
 *
 * ⚠️ Sera remplacé en Phase 1 par les types générés depuis le schéma Supabase
 * (`supabase gen types typescript`). Pour l'instant il est volontairement
 * permissif afin de satisfaire les génériques de supabase-js sans bloquer le
 * build du squelette (Phase 0).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    >
    Views: Record<
      string,
      {
        Row: Record<string, unknown>
        Relationships: []
      }
    >
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>
        Returns: unknown
      }
    >
    Enums: Record<string, string>
    CompositeTypes: Record<string, Record<string, unknown>>
  }
}
