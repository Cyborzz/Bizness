-- Parrainage : suit qui a parrainé qui, sert de garde-fou anti-doublon.
-- Les récompenses (parrain + filleul) sont créditées côté serveur après
-- insertion réussie dans cette table.

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  referrer_card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  referred_card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Une carte ne peut être parrainée qu'une seule fois.
  constraint referrals_referred_unique unique (referred_card_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_card_id);
create index if not exists referrals_business_idx
  on public.referrals (business_id);

alter table public.referrals enable row level security;

-- Lecture réservée aux admins du commerce / super admin.
-- Les insertions se font via la service role (qui contourne la RLS) lors de
-- l'inscription d'un filleul — aucune policy d'insert pour anon n'est requise.
create policy "business admins read referrals"
on public.referrals for select
to authenticated
using (
  public.is_super_admin()
  or business_id = public.current_admin_business_id()
);

create policy "super admin manage referrals"
on public.referrals for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());
