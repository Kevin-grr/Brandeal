-- Table de tracking des appels IA pour le rate limiting.
-- Pas de RLS : insérée côté serveur via service role uniquement.
create table if not exists ai_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  created_at  timestamptz not null default now()
);

create index ai_usage_user_day_idx
  on ai_usage (user_id, created_at);

-- Nettoyage automatique des entrées de plus de 7 jours.
create or replace function cleanup_ai_usage() returns void
  language sql security definer as $$
    delete from ai_usage where created_at < now() - interval '7 days';
  $$;
