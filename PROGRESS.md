# Avancement — ContratCréateur

Suivi phase par phase (voir le brief, section 8). Mis à jour après chaque phase.

Légende : ✅ terminé · 🚧 en cours · ⬜ à faire

---

## ✅ Phase 0 — Setup

**Fait :**
- Projet Next.js **15.5.19** (App Router, TypeScript strict) dans `~/contrat-createur`.
- Tailwind CSS v4 + shadcn/ui (style base-nova) configurés.
- Composants UI de base ajoutés : button, input, label, textarea, card, form,
  select, badge, dialog, sonner (toasts), checkbox, separator, progress.
- Helpers Supabase : `lib/supabase/client.ts` (browser), `server.ts` (SSR
  cookies), `admin.ts` (service role serveur-only).
- `lib/config.ts` (constantes app — sans contenu légal codé en dur).
- `.env.example` complet (Supabase UE, Stripe, Resend).
- ESLint + Prettier (config sans point-virgule, plugin Tailwind) + flat config.
- Structure de dossiers : `app/`, `components/`, `lib/`, `supabase/migrations/`,
  `types/`.
- `app/layout.tsx` : `lang="fr"`, metadata produit, `<Toaster />`.
- `app/page.tsx` : placeholder propre (landing réelle en Phase 9).

**Décisions clés :** voir `DECISIONS.md` (D-001 à D-009). Notamment : pin sur
Next.js 15 (et non 16), shadcn base-nova (Base UI), `form.tsx` écrit à la main.

**Critère « Done » :** `npm run dev` / `npm run build` compilent sans erreur. ✅

**Reste pour plus tard :** types DB générés (Phase 1), README complet (Phase 10).

---

## ✅ Phase 1 — Base de données & Auth (code-complet)

**Fait :**
- Migrations SQL (`supabase/migrations/`) :
  - `…090001_init_schema` : toutes les tables du brief + colonnes `deleted_at`
    (soft delete) + index.
  - `…090002_rls_policies` : RLS activée partout, policies `user_id = auth.uid()`,
    **aucune policy DELETE** (suppression physique bloquée côté client).
  - `…090003_functions_triggers` : `set_updated_at`, et la fonction cœur
    `get_brand_yearly_total(user_id, brand_id, year)`.
  - `…090004_storage_buckets` : buckets privés `contracts`/`invoices` + RLS par
    dossier `{user_id}`.
  - `…090005_seed_legal_template` : seed `legal_template_versions` v1-2026
    (contenu légal verbatim des sections 3.A/3.B/3.C en jsonb).
- `types/database.ts` : types fidèles au schéma (à régénérer via
  `supabase gen types` une fois le projet lié) + type `LegalClauses`.
- Auth Supabase : `lib/supabase/middleware.ts` (refresh session + gardes de
  routes), `middleware.ts`, `lib/auth.ts` (`getUser`/`requireUser`).
- Pages `/login` et `/signup` (RHF + Zod + shadcn Form, email/mot de passe +
  Google OAuth), `/auth/callback` (échange code → session), `signOut` (server
  action), shell d'app protégé + `/dashboard` placeholder.

**Critère « Done » :** build/lint/types ✅. La vérification fonctionnelle
(inscription / connexion / déconnexion / persistance de session) nécessite un
**projet Supabase réel (région UE) + les clés dans `.env.local` + l'application
des migrations** — étape manuelle décrite dans le README (Phase 10). Le code est
complet et prêt à être branché.

## ⬜ Phase 2 — Onboarding & profil
## ⬜ Phase 3 — Marques
## ⬜ Phase 4 — Wizard deals + logique de seuil
## ⬜ Phase 5 — Génération PDF contrat
## ⬜ Phase 6 — Dashboard
## ⬜ Phase 7 — Facturation
## ⬜ Phase 8 — Stripe & paywall
## ⬜ Phase 9 — Landing page & pages légales
## ⬜ Phase 10 — Polish & déploiement
