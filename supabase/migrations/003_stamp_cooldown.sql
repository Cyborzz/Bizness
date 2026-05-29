-- Migration 003 : anti-fraude tampons (cooldown configurable par commerce).
-- Empêche d'ajouter plusieurs tampons à la même carte dans une courte fenêtre.
-- 0 = désactivé (comportement historique). Max 1440 min (24 h).

alter table public.businesses
  add column if not exists stamp_cooldown_minutes int not null default 0;

alter table public.businesses
  drop constraint if exists businesses_stamp_cooldown_check;
alter table public.businesses
  add constraint businesses_stamp_cooldown_check
  check (stamp_cooldown_minutes between 0 and 1440);
