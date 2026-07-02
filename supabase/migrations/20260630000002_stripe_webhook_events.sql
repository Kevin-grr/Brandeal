-- Table d'idempotence pour les webhooks Stripe.
-- Évite le double-traitement d'un même événement.
create table if not exists stripe_webhook_events (
  id               uuid primary key default gen_random_uuid(),
  stripe_event_id  text not null unique,
  event_type       text not null,
  processed_at     timestamptz not null default now()
);

-- Nettoyage automatique des événements de plus de 30 jours.
create index stripe_webhook_events_date_idx
  on stripe_webhook_events (processed_at);
