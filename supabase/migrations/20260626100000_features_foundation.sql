-- =============================================================================
-- Brandeal — Migration fondation « copilote complet »
-- Ajoute toutes les tables/colonnes nécessaires aux nouvelles fonctionnalités :
--   devis, bibliothèque de modèles, profils créateurs multiples, analyses IA de
--   contrats entrants, espace marque (tokens), relances de paiement, signatures.
-- Respecte les garde-fous : soft delete (deleted_at), aucune policy DELETE côté
-- client, propriété restreinte au user_id = auth.uid().
-- =============================================================================

-- --- Timeline des deals (assistant partenariat) ------------------------------
-- On enrichit `deals` de jalons horodatés pour la timeline visuelle.
alter table public.deals
  add column if not exists template_kind text default 'partnership',
  add column if not exists sent_at timestamptz,
  add column if not exists signed_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists creator_profile_id uuid;

-- --- Profils créateurs multiples ---------------------------------------------
-- Un compte (auth user) peut piloter plusieurs identités créateur (managers,
-- agences). Le profil "principal" reste dans public.profiles ; les profils
-- additionnels vivent ici. Limites appliquées côté app selon le plan.
create table if not exists public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  full_name text,
  legal_status text
    check (legal_status in ('auto_entrepreneur','eirl','eurl','sasu','sas','autre')),
  siret text,
  is_vat_applicable boolean default false,
  address_line text,
  postal_code text,
  city text,
  country text default 'France',
  is_default boolean default false,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- --- Bibliothèque de modèles de contrats -------------------------------------
-- Modèles prêts à l'emploi (partenariat, UGC, exclusivité, ambassadeur…).
-- Le contenu légal reste piloté par legal_template_versions ; ici on stocke le
-- "type" de collaboration et ses options de pré-remplissage.
create table if not exists public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  kind text not null unique,
  name text not null,
  description text not null,
  icon text,
  -- valeurs de pré-remplissage du wizard (durée de droits, exclusivité, etc.)
  defaults jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- --- Devis (quotes) ----------------------------------------------------------
-- Précède le contrat. Un devis accepté se transforme en contrat puis facture
-- sans ressaisie (on réutilise le deal lié).
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  quote_number text not null,
  issue_date date not null default current_date,
  valid_until date,
  amount_ht numeric(10,2) not null default 0,
  vat_rate numeric(5,2) default 0,
  vat_mention text default 'TVA non applicable, article 293 B du CGI',
  notes text,
  status text not null default 'draft'
    check (status in ('draft','sent','accepted','refused','expired')),
  pdf_storage_path text,
  accepted_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, quote_number)
);

-- --- Analyses IA de contrats entrants ----------------------------------------
-- Le créateur dépose un contrat reçu d'une marque ; l'IA renvoie un rapport.
create table if not exists public.contract_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  source_filename text,
  source_text text,                 -- texte brut analysé (jamais le PDF original en clair longue durée)
  status text not null default 'pending'
    check (status in ('pending','processing','done','error')),
  score int,                        -- 0..100
  balance text,                     -- 'favorable_brand' | 'balanced' | 'favorable_creator'
  summary text,                     -- résumé en langage simple
  findings jsonb,                   -- [{severity, title, detail, clause}]
  missing_mentions jsonb,           -- [string]
  error_message text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- --- Espace marque : jetons de partage ---------------------------------------
-- Lien public (token) donnant à une marque l'accès à un deal : voir/signer le
-- contrat, télécharger la facture, consulter l'historique. Sans compte.
create table if not exists public.brand_share_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  last_viewed_at timestamptz,
  created_at timestamptz default now()
);

-- --- Signatures électroniques ------------------------------------------------
-- Signature du contrat (créateur et/ou marque) depuis l'espace marque.
-- Garde-fou : aucune donnée bancaire ; on stocke seulement la preuve de signature.
create table if not exists public.contract_signatures (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  signer_role text not null check (signer_role in ('creator','advertiser')),
  signer_name text not null,
  signer_email text,
  signature_data text,              -- tracé base64 (image) ou référence prestataire
  provider text default 'native',   -- 'native' | 'yousign' | ...
  provider_ref text,
  signed_ip text,
  signed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- --- Relances de paiement ----------------------------------------------------
-- Trace des relances envoyées (J+7/J+15/J+30) pour les factures impayées.
create table if not exists public.payment_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  step int not null,                -- 1,2,3
  channel text not null default 'email',
  sent_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (invoice_id, step)
);

-- --- Index utiles ------------------------------------------------------------
create index if not exists idx_creator_profiles_owner
  on public.creator_profiles (owner_id) where deleted_at is null;
create index if not exists idx_quotes_user
  on public.quotes (user_id) where deleted_at is null;
create index if not exists idx_quotes_brand
  on public.quotes (brand_id) where deleted_at is null;
create index if not exists idx_reviews_user
  on public.contract_reviews (user_id) where deleted_at is null;
create index if not exists idx_share_tokens_deal
  on public.brand_share_tokens (deal_id);
create index if not exists idx_signatures_contract
  on public.contract_signatures (contract_id);
create index if not exists idx_reminders_invoice
  on public.payment_reminders (invoice_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.creator_profiles    enable row level security;
alter table public.contract_templates  enable row level security;
alter table public.quotes               enable row level security;
alter table public.contract_reviews     enable row level security;
alter table public.brand_share_tokens   enable row level security;
alter table public.contract_signatures  enable row level security;
alter table public.payment_reminders    enable row level security;

-- creator_profiles : propriété par owner_id
create policy "creator_profiles_select_own" on public.creator_profiles
  for select to authenticated using (owner_id = auth.uid());
create policy "creator_profiles_insert_own" on public.creator_profiles
  for insert to authenticated with check (owner_id = auth.uid());
create policy "creator_profiles_update_own" on public.creator_profiles
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- contract_templates : référence partagée, lecture seule côté client
create policy "contract_templates_read_all" on public.contract_templates
  for select to authenticated, anon using (true);

-- quotes : propriété par user_id
create policy "quotes_select_own" on public.quotes
  for select to authenticated using (user_id = auth.uid());
create policy "quotes_insert_own" on public.quotes
  for insert to authenticated with check (user_id = auth.uid());
create policy "quotes_update_own" on public.quotes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- contract_reviews : propriété par user_id
create policy "contract_reviews_select_own" on public.contract_reviews
  for select to authenticated using (user_id = auth.uid());
create policy "contract_reviews_insert_own" on public.contract_reviews
  for insert to authenticated with check (user_id = auth.uid());
create policy "contract_reviews_update_own" on public.contract_reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- brand_share_tokens : le créateur gère ses jetons. L'accès public au deal via
-- un token NON révoqué/expiré se fait côté serveur (service role), jamais via RLS anon.
create policy "share_tokens_select_own" on public.brand_share_tokens
  for select to authenticated using (user_id = auth.uid());
create policy "share_tokens_insert_own" on public.brand_share_tokens
  for insert to authenticated with check (user_id = auth.uid());
create policy "share_tokens_update_own" on public.brand_share_tokens
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- contract_signatures : lecture par le propriétaire du deal. L'insertion par la
-- marque (via espace public) passe par le service role côté serveur.
create policy "signatures_select_own" on public.contract_signatures
  for select to authenticated using (
    exists (select 1 from public.deals d where d.id = contract_signatures.deal_id and d.user_id = auth.uid())
  );
create policy "signatures_insert_own" on public.contract_signatures
  for insert to authenticated with check (
    exists (select 1 from public.deals d where d.id = contract_signatures.deal_id and d.user_id = auth.uid())
  );

-- payment_reminders : propriété par user_id (insertion réelle via service role/cron)
create policy "reminders_select_own" on public.payment_reminders
  for select to authenticated using (user_id = auth.uid());

-- --- FK différée pour deals.creator_profile_id -------------------------------
alter table public.deals
  drop constraint if exists deals_creator_profile_fk;
alter table public.deals
  add constraint deals_creator_profile_fk
    foreign key (creator_profile_id)
    references public.creator_profiles (id) on delete set null;
