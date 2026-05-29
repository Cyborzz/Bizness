-- Migration 004 : récompense d'anniversaire + statut client (milestones).
-- Récompenser les comportements/dates, pas seulement les achats.
-- Le statut VIP est dérivé de total_stamps (aucune colonne nécessaire).

alter table public.customers
  add column if not exists birthdate date;

alter table public.businesses
  add column if not exists birthday_reward_enabled boolean not null default false;
