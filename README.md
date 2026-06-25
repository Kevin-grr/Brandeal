# ContratCréateur

Outil SaaS d'aide à la rédaction de **contrats de partenariat** et de **factures**
conformes pour les créateurs de contenu français, avec **suivi du seuil légal de
1 000 €** par marque (loi n°2023-451 « loi influenceurs » + décret n°2025-1137).

> ⚠️ **Avertissement.** ContratCréateur est un outil d'aide à la rédaction, pas un
> conseil juridique. **Avant tout lancement public, les modèles de contrat et de
> facture doivent être relus et validés par un avocat ou un expert-comptable
> spécialisé.**

---

## Stack

- **Next.js 15** (App Router, TypeScript strict)
- **Tailwind CSS v4** + **shadcn/ui** (style base-nova / Base UI)
- **Supabase** (PostgreSQL managé, Auth, Storage) — **région UE obligatoire (RGPD)**
- **Stripe** (Checkout, Billing Portal, Webhooks)
- **@react-pdf/renderer** (génération PDF côté serveur)
- **React Hook Form + Zod** (formulaires/validation)
- **Resend** (emails transactionnels — provisionné, voir « Limites connues »)
- Déploiement **Vercel**

Voir [`DECISIONS.md`](./DECISIONS.md) (journal des choix techniques) et
[`PROGRESS.md`](./PROGRESS.md) (avancement par phase).

---

## Prérequis

- Node.js ≥ 20 (développé sous Node 24)
- Un compte **Supabase**, un compte **Stripe**, (optionnel) un compte **Resend**

---

## Installation locale

```bash
git clone <url-du-repo> contrat-createur
cd contrat-createur
npm install
cp .env.example .env.local   # puis remplir les valeurs (voir ci-dessous)
npm run dev                  # http://localhost:3000
```

Autres commandes :

```bash
npm run build   # build de production
npm run start   # lancer le build
npm run lint    # ESLint
npm test        # tests unitaires (logique de seuil) via node:test
npm run format  # Prettier
```

---

## Variables d'environnement

Toutes les clés sont décrites dans [`.env.example`](./.env.example).

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (ex. `http://localhost:3000` en local, l'URL Vercel en prod). |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase (publique, protégée par RLS). |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role — **serveur uniquement** (webhooks). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publiable Stripe. |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe. |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook Stripe. |
| `STRIPE_PRICE_ID_PRO` | ID du prix récurrent mensuel du plan Pro. |
| `RESEND_API_KEY` | Clé API Resend (emails). |
| `RESEND_FROM_EMAIL` | Adresse d'expéditeur des emails. |

---

## Configuration Supabase (région UE)

1. Créer un projet Supabase **dans une région de l'Union européenne**
   (ex. `eu-west-1`, `eu-central-1`) — contrainte RGPD impérative.
2. Dans **Project Settings → API**, copier `Project URL`, `anon public` et
   `service_role` dans `.env.local`.
3. **Appliquer les migrations** (`supabase/migrations/`), au choix :
   - **SQL Editor** : exécuter chaque fichier `*.sql` dans l'ordre croissant ; ou
   - **CLI Supabase** :
     ```bash
     supabase link --project-ref <ref-du-projet>
     supabase db push
     ```
   Ces migrations créent les tables, les policies RLS, les fonctions
   (`get_brand_yearly_total`, `create_invoice`, trigger de limite gratuite), les
   buckets Storage privés (`contracts`, `invoices`) et **insèrent le template
   légal v1-2026** (mentions obligatoires).
4. (Optionnel) Activer **Google OAuth** dans **Authentication → Providers** et
   ajouter `<NEXT_PUBLIC_SITE_URL>/auth/callback` aux **Redirect URLs**.
5. Vérifier dans **Authentication → URL Configuration** que `Site URL` et les
   `Redirect URLs` correspondent à votre domaine.

> Pour régénérer les types TypeScript après modification du schéma :
> `supabase gen types typescript --linked > types/database.ts`

---

## Configuration Stripe

1. Créer un **produit** « ContratCréateur Pro » avec un **prix récurrent mensuel**
   (14,99 € par défaut, modifiable via `PRO_PRICE_EUR` dans `lib/config.ts`).
   Copier l'**ID du prix** (`price_…`) dans `STRIPE_PRICE_ID_PRO`.
2. Copier les clés API (test puis live) dans `.env.local`.
3. Créer un **webhook** pointant vers
   `<NEXT_PUBLIC_SITE_URL>/api/webhooks/stripe`, abonné aux événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Copier le **signing secret** dans `STRIPE_WEBHOOK_SECRET`.
4. En local, tester avec la CLI Stripe :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## Configuration Resend (optionnel)

Créer une clé API et une adresse d'expéditeur vérifiée, puis renseigner
`RESEND_API_KEY` et `RESEND_FROM_EMAIL`. (Voir « Limites connues ».)

---

## Déploiement sur Vercel

1. Importer le dépôt sur [Vercel](https://vercel.com/new) (framework Next.js
   détecté automatiquement — aucun `vercel.json` requis).
2. Renseigner **toutes les variables d'environnement** ci-dessus dans
   **Project Settings → Environment Variables** (mettre `NEXT_PUBLIC_SITE_URL` à
   l'URL de production).
3. Déployer.
4. **Après le premier déploiement** :
   - Mettre à jour le **webhook Stripe** vers l'URL de production
     (`https://<votre-domaine>/api/webhooks/stripe`).
   - Vérifier les **Redirect URLs** Supabase (Google OAuth, confirmation email).
5. Compléter l'identité légale de l'éditeur dans `lib/config.ts`
   (`LEGAL_ENTITY` : raison sociale, SIRET, adresse, email) avant ouverture
   au public.

---

## Structure du projet

```
app/
  (marketing)/      Landing, pricing, pages légales (public)
  (auth)/           login, signup
  (app)/            Espace connecté : dashboard, brands, deals, settings
  api/              Routes serveur (contrat, facture, stripe, webhook)
  onboarding/       Création du profil
components/          UI (shadcn) + composants métier
lib/                 supabase, stripe, pdf, validations, config, helpers
supabase/migrations/ Schéma SQL, RLS, fonctions, seed légal
types/               Types de la base de données
```

---

## Limites connues

- **Resend** : la confirmation de compte est gérée nativement par Supabase Auth.
  Les emails Resend (reçus de facture, relances de paiement Pro) sont prévus mais
  non encore câblés.
- **Polices** : Geist est chargée via `next/font` (auto-hébergée au build sur
  Vercel). En environnement hors-ligne, un fallback système s'applique.
- **Conformité légale** : les modèles juridiques doivent être validés par un
  professionnel avant exploitation commerciale (voir l'avertissement en tête).
