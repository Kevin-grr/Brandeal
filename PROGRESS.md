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

## ✅ Phase 2 — Onboarding & profil

**Fait :**
- `lib/validations/profile.ts` : schéma Zod du profil (SIRET 14 chiffres
  optionnel, statut légal énuméré, `is_vat_franchise` ↔ `is_vat_applicable`).
- `lib/profile.ts` : `getProfile()` (profil du user courant ou null).
- `components/profile-form.tsx` : formulaire partagé (RHF + Zod + shadcn
  Select/Checkbox), modes `onboarding` / `settings`, upsert via le client
  Supabase ; en onboarding, crée aussi la ligne d'abonnement `free`.
- `app/onboarding/page.tsx` : page d'onboarding (redirige vers /dashboard si le
  profil existe déjà).
- `app/(app)/settings/page.tsx` : édition du profil.
- Gate de profil dans `app/(app)/layout.tsx` : redirige vers /onboarding tant
  que le profil n'est pas créé. Nav (Tableau de bord, Paramètres).

**Critère « Done » :** build/lint/types ✅. Validation Zod sur tous les champs
obligatoires. Vérification fonctionnelle = nécessite Supabase (cf. Phase 1).

## ✅ Phase 3 — Marques

**Fait :**
- `lib/validations/brand.ts` : schéma Zod marque.
- `components/brand-form.tsx` : formulaire marque (RHF + Zod), insert/update via
  le client Supabase, renvoie la ligne créée.
- `components/brand-dialog.tsx` : dialog réutilisable (réutilisé par le wizard en
  Phase 4 pour la création rapide inline).
- `components/brands-manager.tsx` : liste (table), création/édition (dialog),
  suppression (soft delete, AlertDialog contrôlé).
- `app/(app)/brands/page.tsx` : liste filtrée `deleted_at is null` + RLS.
- Nav : ajout de « Marques ».

**Décisions :** D-017 (soft delete systématique), D-018 (API Base UI `render`).

**Critère « Done » :** build/lint/types ✅. CRUD complet ; l'isolation par RLS
(`user_id = auth.uid()`) garantit qu'un user ne voit pas les marques d'un autre.
Vérification fonctionnelle = nécessite Supabase.

## ✅ Phase 4 — Wizard deals + logique de seuil

**Fait :**
- `lib/validations/deal.ts` : schéma Zod + constantes (plateformes, types de
  contenu, durées d'exploitation) + superRefine (avantage en nature, exclusivité,
  rémunération non nulle).
- `lib/threshold.ts` + `lib/threshold.test.ts` : logique pure du seuil, **4 tests
  node:test** (sous / au / au-dessus du seuil + avantage ignoré) — `npm test` ✅.
- `lib/format.ts` (formatEur/formatDate), `lib/legal.ts` (template actif typé).
- `components/deal-wizard.tsx` : wizard 5 étapes, état conservé dans RHF (pas de
  rechargement), validation par étape, **calcul du seuil en temps réel** via la
  RPC `get_brand_yearly_total`, barre de progression + alerte de franchissement.
- `components/legal-disclaimer.tsx`, `components/deal-status-badge.tsx`.
- `app/(app)/deals/new/page.tsx` (charge marques + seuil + disclaimer),
  `app/(app)/deals/[id]/page.tsx` (détail, enrichi en Phase 5).
- Dashboard : bouton « Nouveau partenariat ».
- Scripts `npm test` / `npm run format`.

**Décisions :** D-019 (génération PDF déplacée sur /deals/[id]), D-020 (Select
marque), D-021 (tests node:test).

**Critère « Done » :** build ✅ + tests seuil ✅ (3 scénarios requis). Création de
deal complète. Vérification e2e = nécessite Supabase.

## ✅ Phase 5 — Génération PDF contrat

**Fait :**
- `lib/pdf/generateContract.tsx` : moteur react-pdf produisant le contrat selon
  la structure de la section 5 (en-tête + réf doc, parties avec résidence
  fiscale, articles 1→5, signatures, **disclaimer en pied de chaque page**,
  watermark 1ʳᵉ page si plan gratuit). Textes légaux issus de la base.
- `app/api/deals/[id]/contract/route.ts` (POST, runtime nodejs) : génère, upload
  Storage `{user_id}/{deal_id}/v{n}.pdf` (RLS), insère `contracts` (versioning).
- `components/deal-actions.tsx` : statut (select), générer/régénérer le contrat,
  télécharger (URL signée), supprimer (soft delete, AlertDialog).
- `app/(app)/deals/[id]/page.tsx` : détail complet + dernière version + lien de
  téléchargement signé + disclaimer.

**Décisions :** D-022 à D-025.

**Critère « Done » :** build ✅. **Smoke test react-pdf** : `Buffer` PDF valide
(`%PDF-`, footer fixe, watermark conditionnel, accents FR) ✅. La génération
end-to-end (upload Storage + DB) nécessite Supabase.

## ✅ Phase 6 — Dashboard

**Fait :**
- `app/(app)/dashboard/page.tsx` : liste des deals (marque, titre, statut,
  montant cash+nature, date), encarts de suivi par marque avec barre de
  progression vs seuil (totaux via la RPC `get_brand_yearly_total`), et
  **bandeaux d'alerte rouges** quand le seuil est atteint sans contrat signé
  cette année. Bouton « Nouveau partenariat ». État vide géré.

**Critère « Done » :** build ✅. Affichage deals + statuts + alertes de seuil par
marque conformes à la section 4.2. Vérification e2e = nécessite Supabase.

## ✅ Phase 7 — Facturation

**Fait :**
- Migration `…090006_invoice_function` : fonction `create_invoice()` avec
  **numérotation séquentielle atomique** (verrou transactionnel par user) —
  garantit une séquence continue sans trou ni race condition.
- `lib/pdf/generateInvoice.tsx` : facture conforme section 3.B (émetteur+SIRET,
  client+TVA, prestation, montants HT/TVA/TTC, mention 293 B si franchise,
  conservation 10 ans + disclaimer en pied de page).
- `app/api/deals/[id]/invoice/route.ts` : garde statut ≥ signé, **garde SIRET**
  (NO_SIRET → /settings), calcul TVA, appel RPC, génération + upload Storage.
- `components/invoice-section.tsx` : génération + liste + téléchargement (URL
  signée) ; `/deals/[id]` enrichi d'une carte « Factures ».
- Types DB : ajout de la fonction `create_invoice`.

**Décisions :** D-026 à D-028.

**Critère « Done » :** build ✅. Facturation conforme depuis un deal signé,
numérotation garantie sans trou (transaction Postgres). Vérification e2e =
nécessite Supabase.

## ✅ Phase 8 — Stripe & paywall

**Fait :**
- `lib/stripe.ts` (client serveur).
- `app/api/stripe/checkout` (Checkout abonnement Pro), `app/api/stripe/portal`
  (Billing Portal), `app/api/webhooks/stripe` (signature + maj `subscriptions`
  via service role : checkout.session.completed, customer.subscription.updated
  /deleted).
- Migration `…090007` : trigger `enforce_free_deal_limit` (2 deals/mois en
  gratuit, backstop DB).
- `components/subscription-section.tsx` (settings : plan + Passer au Pro / Gérer)
  et `components/paywall-dialog.tsx` (modal d'upgrade).
- Wizard : bannière proactive si limite atteinte + modal sur `FREE_DEAL_LIMIT`.
- `/settings` : section Abonnement. Constante prix `PRO_PRICE_EUR` (14,99 €).

**Décisions :** D-029 à D-031.

**Critère « Done » :** build ✅. Flux upgrade Stripe + webhook + limite 2/mois
appliquée (DB + UI). Vérification e2e = nécessite clés Stripe + Supabase.

## ✅ Phase 9 — Landing page & pages légales

**Fait :**
- Groupe `(marketing)` + `SiteHeader`/`SiteFooter` ; `app/page.tsx` placeholder
  supprimé.
- `/` : landing complète (hero, « pourquoi c'est important » avec le contexte
  légal en langage simple, 4 cards fonctionnalités, résumé pricing).
- `/pricing` : 2 offres (Gratuit / Pro), CTA contextuel (inscription si non
  connecté, Checkout si connecté, plan actuel si déjà Pro).
- Pages légales rédigées : `/legal/mentions-legales`, `/legal/cgu`,
  `/legal/politique-confidentialite` (RGPD : données stockées, hébergement UE,
  conservation, droits, contact), `/legal/avertissement-juridique` (disclaimer
  exact depuis la DB + développement).
- Liens légaux permanents en footer (public et espace connecté).

**Décisions :** D-032, D-033.

**Critère « Done » :** build ✅. Toutes les pages publiques rédigées intégralement
(aucun placeholder/lorem). Identité d'éditeur à compléter (lib/config) avant
lancement.

## ⬜ Phase 10 — Polish & déploiement
