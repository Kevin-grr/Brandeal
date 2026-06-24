-- =============================================================================
-- ContratCréateur — Schéma initial
-- Réf. brief section 2. Ajout de colonnes `deleted_at` (soft delete) pour
-- respecter le garde-fou #2 (jamais de suppression définitive). Voir DECISIONS.
-- =============================================================================

-- --- Profil créateur ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  display_name text,
  legal_status text not null
    check (legal_status in ('auto_entrepreneur','eirl','eurl','sasu','sas','autre')),
  siret text,
  vat_number text,
  is_vat_applicable boolean default false, -- false = "TVA non applicable, art. 293 B du CGI"
  address_line text,
  postal_code text,
  city text,
  country text default 'France',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --- Marques / annonceurs ----------------------------------------------------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  legal_name text,
  address_line text,
  siret_or_vat text,
  contact_name text,
  contact_email text,
  fiscal_country text default 'France',
  notes text,
  deleted_at timestamptz, -- soft delete
  created_at timestamptz default now()
);

-- --- Deals / partenariats ----------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  title text not null,
  status text not null default 'draft'
    check (status in ('draft','sent','signed','paid','cancelled')),
  mission_description text not null,
  platforms text[] not null default '{}',
  content_type text,
  deliverables_count int default 1,
  start_date date,
  end_date date,
  cash_amount_eur numeric(10,2) default 0,
  in_kind_value_eur numeric(10,2) default 0,
  in_kind_description text,
  ip_rights_duration text,
  exclusivity boolean default false,
  exclusivity_details text,
  french_law_applicable boolean default true,
  deleted_at timestamptz, -- soft delete
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --- Versions du template légal ----------------------------------------------
-- Permet de mettre à jour les mentions obligatoires sans redéployer le code.
create table if not exists public.legal_template_versions (
  id uuid primary key default gen_random_uuid(),
  version_label text not null,
  law_reference text not null,
  threshold_eur numeric(10,2) not null default 1000,
  mandatory_clauses jsonb not null,
  effective_date date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- --- Contrats générés --------------------------------------------------------
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  legal_template_version_id uuid not null
    references public.legal_template_versions (id),
  pdf_storage_path text,
  generated_at timestamptz default now(),
  is_final boolean default false,
  deleted_at timestamptz -- soft delete (garde-fou : jamais de suppression réelle)
);

-- --- Factures ----------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete set null,
  invoice_number text not null,
  issue_date date not null default current_date,
  amount_ht numeric(10,2) not null,
  vat_rate numeric(5,2) default 0,
  vat_mention text default 'TVA non applicable, article 293 B du CGI',
  pdf_storage_path text,
  status text not null default 'draft' check (status in ('draft','sent','paid')),
  deleted_at timestamptz, -- soft delete (garde-fou : conservation 10 ans)
  created_at timestamptz default now(),
  unique (user_id, invoice_number)
);

-- --- Abonnements Stripe ------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  unique (user_id)
);

-- --- Index utiles ------------------------------------------------------------
create index if not exists idx_brands_user on public.brands (user_id) where deleted_at is null;
create index if not exists idx_deals_user on public.deals (user_id) where deleted_at is null;
create index if not exists idx_deals_user_brand_year
  on public.deals (user_id, brand_id, start_date) where deleted_at is null;
create index if not exists idx_deals_status on public.deals (user_id, status) where deleted_at is null;
create index if not exists idx_contracts_deal on public.contracts (deal_id);
create index if not exists idx_invoices_user on public.invoices (user_id) where deleted_at is null;
create unique index if not exists idx_legal_active_one
  on public.legal_template_versions (is_active) where is_active = true;
