-- Migration 011 : lien d'avis Google par commerce.
-- Affiché au client au bon moment (récompense débloquée) pour transformer la
-- satisfaction en avis Google — fort argument de valeur pour le commerçant.

alter table public.businesses
  add column if not exists google_review_url text;

alter table public.businesses
  drop constraint if exists businesses_google_review_url_check;
alter table public.businesses
  add constraint businesses_google_review_url_check
  check (google_review_url is null or google_review_url ~* '^https?://');
