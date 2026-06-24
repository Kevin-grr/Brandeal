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

## ⬜ Phase 1 — Base de données & Auth
## ⬜ Phase 2 — Onboarding & profil
## ⬜ Phase 3 — Marques
## ⬜ Phase 4 — Wizard deals + logique de seuil
## ⬜ Phase 5 — Génération PDF contrat
## ⬜ Phase 6 — Dashboard
## ⬜ Phase 7 — Facturation
## ⬜ Phase 8 — Stripe & paywall
## ⬜ Phase 9 — Landing page & pages légales
## ⬜ Phase 10 — Polish & déploiement
