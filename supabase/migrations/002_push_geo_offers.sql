-- Migration 002 : géolocalisation, design enrichi, push notifications, offres marketing.

-- ───────────────────────────────────────────────
-- BUSINESSES : geo + design
-- ───────────────────────────────────────────────
alter table public.businesses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists welcome_message text,
  add column if not exists secondary_color text not null default '#7c3aed',
  add column if not exists card_style text not null default 'gradient';

alter table public.businesses
  drop constraint if exists businesses_card_style_check;
alter table public.businesses
  add constraint businesses_card_style_check
  check (card_style in ('gradient','solid','glass'));

alter table public.businesses
  drop constraint if exists businesses_secondary_color_check;
alter table public.businesses
  add constraint businesses_secondary_color_check
  check (secondary_color ~ '^#[0-9A-Fa-f]{6}$');

create index if not exists businesses_geo_idx
  on public.businesses (latitude, longitude)
  where latitude is not null and longitude is not null;

-- ───────────────────────────────────────────────
-- PUSH SUBSCRIPTIONS
-- ───────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_unique unique (endpoint)
);

create index if not exists push_subscriptions_business_id_idx
  on public.push_subscriptions(business_id);
create index if not exists push_subscriptions_customer_id_idx
  on public.push_subscriptions(customer_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "business admins read push subscriptions" on public.push_subscriptions;
create policy "business admins read push subscriptions"
on public.push_subscriptions for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());

-- ───────────────────────────────────────────────
-- OFFERS (annonces marketing)
-- ───────────────────────────────────────────────
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  body text not null,
  image_url text,
  cta_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  recipient_count int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  constraint offers_status_check check (status in ('draft','sent','cancelled')),
  constraint offers_title_length check (char_length(title) between 2 and 80),
  constraint offers_body_length check (char_length(body) between 2 and 280)
);

create index if not exists offers_business_id_created_at_idx
  on public.offers(business_id, created_at desc);

alter table public.offers enable row level security;

drop policy if exists "business admins read offers" on public.offers;
create policy "business admins read offers"
on public.offers for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());

drop policy if exists "business owners manage offers" on public.offers;
create policy "business owners manage offers"
on public.offers for all
to authenticated
using (
  public.is_super_admin()
  or (business_id = public.current_admin_business_id()
      and public.current_admin_role() in ('business_owner','staff'))
)
with check (
  public.is_super_admin()
  or (business_id = public.current_admin_business_id()
      and public.current_admin_role() in ('business_owner','staff'))
);

-- ───────────────────────────────────────────────
-- DELETION REQUESTS (RGPD self-service)
-- ───────────────────────────────────────────────
create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint deletion_requests_status_check check (status in ('pending','processed','cancelled'))
);

alter table public.deletion_requests enable row level security;

drop policy if exists "anon can create deletion requests" on public.deletion_requests;
create policy "anon can create deletion requests"
on public.deletion_requests for insert
to anon, authenticated
with check (true);

drop policy if exists "business admins read deletion requests" on public.deletion_requests;
create policy "business admins read deletion requests"
on public.deletion_requests for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());
