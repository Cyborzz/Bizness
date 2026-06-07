-- Migration 010 : intégration caisse (API d'attribution automatique).
-- Une clé API par commerce permet à n'importe quelle caisse / outil
-- d'automatisation (webhook natif SumUp/Square/Shopify, Zapier, Make, script
-- de caisse maison) de créditer un passage au moment du paiement.
-- La clé n'est jamais stockée en clair : seul son hash SHA-256 est conservé.

-- ───────────────────────────────────────────────
-- POS API KEYS
-- ───────────────────────────────────────────────
create table if not exists public.pos_api_keys (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  label text not null,
  -- Préfixe public (identification + lookup rapide) et hash secret.
  key_prefix text not null,
  key_hash text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint pos_api_keys_prefix_unique unique (key_prefix),
  constraint pos_api_keys_label_length check (char_length(label) between 1 and 60)
);

create index if not exists pos_api_keys_business_idx
  on public.pos_api_keys (business_id);

alter table public.pos_api_keys enable row level security;

drop policy if exists "business admins read pos keys" on public.pos_api_keys;
create policy "business admins read pos keys"
on public.pos_api_keys for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());

-- ───────────────────────────────────────────────
-- POS EVENTS (journal d'ingestion + idempotence)
-- ───────────────────────────────────────────────
create table if not exists public.pos_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  api_key_id uuid references public.pos_api_keys(id) on delete set null,
  external_ref text,
  customer_id uuid references public.customers(id) on delete set null,
  card_id uuid references public.loyalty_cards(id) on delete set null,
  status text not null,
  amount int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  constraint pos_events_status_check
    check (status in ('credited', 'duplicate', 'not_found', 'error'))
);

create index if not exists pos_events_business_created_idx
  on public.pos_events (business_id, created_at desc);

-- Idempotence : un même external_ref (id de transaction caisse) ne crédite
-- qu'une seule fois par commerce.
create unique index if not exists pos_events_external_ref_unique
  on public.pos_events (business_id, external_ref)
  where external_ref is not null;

alter table public.pos_events enable row level security;

drop policy if exists "business admins read pos events" on public.pos_events;
create policy "business admins read pos events"
on public.pos_events for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());
