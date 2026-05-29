-- Migration 005 : réengagement push automatique (cron quotidien).
-- - colonnes générées mois/jour pour requêter les anniversaires du jour
--   (extract() est IMMUTABLE → utilisable en colonne générée, contrairement à to_char).
-- - notification_log : journal d'idempotence pour ne pas spammer.

alter table public.customers
  add column if not exists birth_month int
    generated always as (extract(month from birthdate)::int) stored,
  add column if not exists birth_day int
    generated always as (extract(day from birthdate)::int) stored;

create index if not exists customers_birthday_idx
  on public.customers (birth_month, birth_day)
  where birthdate is not null;

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now(),
  constraint notification_log_kind_check check (kind in ('birthday', 'almost_there'))
);

create index if not exists notification_log_lookup_idx
  on public.notification_log (customer_id, kind, created_at desc);

alter table public.notification_log enable row level security;

drop policy if exists "business admins read notification log" on public.notification_log;
create policy "business admins read notification log"
on public.notification_log for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());
