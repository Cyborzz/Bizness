-- ════════════════════════════════════════════════════════════════════════
-- Fidélise-moi — Bundle migrations 003 → 007 (à coller dans l'éditeur SQL Supabase)
-- ════════════════════════════════════════════════════════════════════════
-- Regroupe les 5 migrations de la PR "rétention & robustesse".
-- Idempotent : ré-exécutable sans risque (if not exists / drop if exists).
-- À exécuter UNE fois sur la base de prod, puis redéployer Vercel.
-- ════════════════════════════════════════════════════════════════════════


-- ─── 003 : Anti-fraude tampons (cooldown configurable par commerce) ───
-- 0 = désactivé (comportement historique). Max 1440 min (24 h).

alter table public.businesses
  add column if not exists stamp_cooldown_minutes int not null default 0;

alter table public.businesses
  drop constraint if exists businesses_stamp_cooldown_check;
alter table public.businesses
  add constraint businesses_stamp_cooldown_check
  check (stamp_cooldown_minutes between 0 and 1440);


-- ─── 004 : Récompense d'anniversaire + milestones ───
-- Le statut VIP est dérivé de total_stamps (aucune colonne nécessaire).

alter table public.customers
  add column if not exists birthdate date;

alter table public.businesses
  add column if not exists birthday_reward_enabled boolean not null default false;


-- ─── 005 : Réengagement push automatique (cron quotidien) ───
-- extract() est IMMUTABLE → utilisable en colonne générée (contrairement à to_char).

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


-- ─── 006 : Rate-limiting des actions publiques (anti-spam / anti-énumération) ───

create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_idx
  on public.rate_limit_hits (bucket, created_at desc);

alter table public.rate_limit_hits enable row level security;

create or replace function public.check_rate_limit(
  p_bucket text,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hits int;
begin
  delete from public.rate_limit_hits
   where bucket = p_bucket
     and created_at < now() - make_interval(secs => p_window_seconds * 5);

  select count(*) into hits
    from public.rate_limit_hits
   where bucket = p_bucket
     and created_at > now() - make_interval(secs => p_window_seconds);

  if hits >= p_limit then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int)
  to anon, authenticated, service_role;


-- ─── 007 : Mode "points" (seuil dédié) ───

alter table public.businesses
  add column if not exists points_required int not null default 100;

alter table public.businesses
  drop constraint if exists businesses_points_required_check;
alter table public.businesses
  add constraint businesses_points_required_check
  check (points_required between 1 and 1000000);

-- ════════════════════════════════════════════════════════════════════════
-- Fin du bundle. Après exécution : définir CRON_SECRET dans Vercel et redéployer.
-- ════════════════════════════════════════════════════════════════════════
