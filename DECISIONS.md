# Journal des décisions techniques — ContratCréateur

Ce fichier consigne les décisions prises de façon autonome quand le brief ne
tranchait pas, ou quand une contrainte technique a imposé une alternative.
Convention : la décision la plus simple, la plus standard, la mieux documentée.

---

## Phase 0 — Setup

### D-001 · Next.js 15 (et non 16) — re-scaffold volontaire
- **Contexte** : `create-next-app@latest` installe désormais Next.js **16.2.9**
  par défaut (juin 2026). Le brief impose explicitement Next.js 15.
- **Décision** : re-scaffold pinné sur **Next.js 15.5.19** (React 19.1.0).
- **Raison** : (1) exigence explicite du brief ; (2) le scaffold Next 16 affiche
  lui-même un avertissement « breaking changes vs training data » imposant une
  consultation constante des docs internes — risque accru de bugs subtils sur un
  produit de conformité légale ; (3) priorité du commanditaire à la fiabilité.
- **Réversibilité** : élevée (montée en version possible plus tard).

### D-002 · Répertoire du projet
- **Décision** : projet créé dans `~/contrat-createur` (le CWD initial était le
  dossier home `~`, hors d'un dépôt git).
- **Raison** : ne pas polluer le home ; nom dérivé du nom de produit provisoire.

### D-003 · Gestionnaire de paquets : npm
- **Décision** : npm (imposé par le brief, `--use-npm`).

### D-004 · UI : shadcn/ui sur registre « base-nova » (Base UI)
- **Contexte** : le CLI `shadcn@latest init` génère désormais par défaut le style
  **base-nova**, basé sur **Base UI** (`@base-ui/react`) et non plus Radix.
- **Décision** : conservé tel quel. L'API exposée (`<Button>`, `<Input>`, …)
  reste stable côté code applicatif, indépendamment de la librairie primitive.
- **Conséquence** : `components/ui/form.tsx` a dû être ajouté manuellement (voir
  D-005).

### D-005 · `components/ui/form.tsx` écrit à la main + `@radix-ui/react-slot`
- **Contexte** : `shadcn add form` échouait silencieusement (souci de registre).
- **Décision** : fichier `form.tsx` écrit avec le pattern shadcn canonique
  (wrapper React Hook Form), en utilisant `@radix-ui/react-slot` pour
  `FormControl`.
- **Raison** : `@radix-ui/react-slot` est un paquet minuscule et très stable dont
  le seul rôle est de cloner l'élément enfant avec les attributs ARIA ;
  parfaitement compatible avec des composants Base UI. Plus fiable que de
  réimplémenter le pattern `useRender` de Base UI.

### D-006 · Tailwind CSS v4 (sans `tailwind.config.ts`)
- **Décision** : Tailwind v4 (défaut de `create-next-app` 15.5 + shadcn), config
  via `@theme` dans `app/globals.css`, pas de fichier `tailwind.config.ts`.

### D-007 · Auth/SSR : `@supabase/ssr`
- **Décision** : helpers `lib/supabase/{client,server,admin}.ts` basés sur
  `@supabase/ssr` (browser + server avec cookies) + un client `service role`
  serveur-only pour les opérations privilégiées (webhooks, numérotation factures).

### D-008 · Formatage : Prettier sans point-virgule, guillemets doubles
- **Décision** : `.prettierrc.json` aligné sur le style des fichiers générés par
  shadcn (`semi: false`, `singleQuote: false`) + `prettier-plugin-tailwindcss`.
  `eslint-config-prettier` ajouté au flat config pour neutraliser les conflits.

### D-009 · `types/database.ts` placeholder
- **Décision** : type `Database` permissif en Phase 0, à remplacer par les types
  générés (`supabase gen types typescript`) en Phase 1.

---

## Phase 1 — Base de données & Auth

### D-010 · Soft delete via `deleted_at` + aucune policy DELETE
- **Contexte** : garde-fou #2 (jamais de suppression définitive de facture/
  contrat) mais schéma du brief sans colonne dédiée.
- **Décision** : ajout de `deleted_at timestamptz` sur `brands`, `deals`,
  `contracts`, `invoices`. RLS sans aucune policy DELETE → la suppression
  physique est impossible côté client (seul le service role peut purger).
- **Conséquence** : toutes les lectures filtrent `deleted_at is null`.

### D-011 · Sémantique de `get_brand_yearly_total`
- **Décision** : somme `cash + in_kind` des deals d'un user avec une marque,
  **par année basée sur `start_date`**, en **excluant** les deals `cancelled`,
  soft-deletés, ou sans `start_date`.
- **Raison** : un deal annulé ou non daté ne doit pas peser sur le seuil légal.

### D-012 · Un seul template légal actif
- **Décision** : index unique partiel `where is_active = true` sur
  `legal_template_versions` → garantit une seule version active à la fois.

### D-013 · Auth client + middleware SSR
- **Décision** : `/login` et `/signup` sont des composants client utilisant le
  browser client Supabase (`signInWithPassword`/`signUp`/OAuth Google) ; la
  session est rafraîchie par `middleware.ts` (@supabase/ssr) ; `signOut` est une
  server action ; `/auth/callback` échange le code (email/OAuth) contre session.
- **Raison** : flux le plus simple et standard avec @supabase/ssr.

### D-014 · Storage privé cloisonné par utilisateur
- **Décision** : buckets `contracts`/`invoices` privés ; RLS storage autorisant
  un user uniquement sur les objets dont le 1er segment de chemin = son
  `auth.uid()` (convention `{user_id}/...`).

### D-015 · Warning Edge `process.version` (supabase-js dans le middleware)
- **Contexte** : le build affiche un warning « Node.js API process.version not
  supported in Edge Runtime » via supabase-js importé dans le middleware.
- **Décision** : laissé tel quel. Warning connu et documenté par @supabase/ssr ;
  sans impact sur le fonctionnement de l'auth en middleware Edge.

### D-016 · `subscriptions` : insert (free) par le user, update par le webhook
- **Décision** : le propriétaire peut SELECT et INSERT sa ligne (plan `free`
  uniquement) ; les UPDATE de plan ne passent que par le service role (webhook
  Stripe) → impossible de s'auto-attribuer le plan Pro en éditant la ligne.

---

## Phase 3 — Marques

### D-017 · Marques : soft delete systématique
- **Contexte** : le brief évoque un hard delete quand aucun deal n'est lié, soft
  delete sinon. Mais la RLS (D-010) bloque toute suppression physique côté client.
- **Décision** : soft delete systématique (`deleted_at`) pour les marques.
  Comportement visible identique (la marque disparaît de la liste), plus sûr,
  cohérent avec le garde-fou « jamais de suppression réelle ».

### D-018 · API Base UI : `render` au lieu de `asChild`
- **Contexte** : les composants shadcn « base-nova » s'appuient sur Base UI, dont
  les primitives (Dialog/AlertDialog Trigger, Close…) utilisent le prop
  `render={<Composant />}` et non `asChild` (Radix).
- **Décision** : utiliser `render` pour les triggers ; pour les confirmations de
  suppression, piloter l'`AlertDialog` en **contrôlé** (`open`/`onOpenChange`)
  car `AlertDialogAction` est un simple `Button` qui ne ferme pas le dialog.
- **Note** : pattern à réutiliser dans le wizard (Phase 4) et au-delà.
