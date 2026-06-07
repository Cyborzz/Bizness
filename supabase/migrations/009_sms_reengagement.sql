-- Migration 009 : canal SMS + relance automatique des clients inactifs.
-- - businesses : configuration de la relance inactifs (opt-in, délai, offre)
--   + expéditeur SMS personnalisé (sinon fallback sur l'expéditeur global env).
-- - notification_log : nouveau kind 'inactive' (idempotence de la relance).
-- Aucune donnée perdue : tout est add-column / contrainte recréée à l'identique.

-- ───────────────────────────────────────────────
-- BUSINESSES : relance inactifs + expéditeur SMS
-- ───────────────────────────────────────────────
alter table public.businesses
  add column if not exists reengage_inactive_enabled boolean not null default false,
  add column if not exists reengage_inactive_days int not null default 45,
  add column if not exists reengage_offer_label text,
  add column if not exists sms_sender text;

alter table public.businesses
  drop constraint if exists businesses_reengage_days_check;
alter table public.businesses
  add constraint businesses_reengage_days_check
  check (reengage_inactive_days between 14 and 365);

-- Expéditeur SMS alphanumérique : 3 à 11 caractères (limite opérateurs/Brevo).
alter table public.businesses
  drop constraint if exists businesses_sms_sender_check;
alter table public.businesses
  add constraint businesses_sms_sender_check
  check (sms_sender is null or char_length(sms_sender) between 3 and 11);

-- ───────────────────────────────────────────────
-- NOTIFICATION_LOG : autoriser le kind 'inactive'
-- ───────────────────────────────────────────────
alter table public.notification_log
  drop constraint if exists notification_log_kind_check;
alter table public.notification_log
  add constraint notification_log_kind_check
  check (kind in ('birthday', 'almost_there', 'inactive'));
