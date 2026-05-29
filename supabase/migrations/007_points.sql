-- Migration 007 : activation réelle du mode "points".
-- Le seuil tampons (stamps_required, 1..50) est trop petit pour des points ;
-- on ajoute donc un seuil dédié points_required.

alter table public.businesses
  add column if not exists points_required int not null default 100;

alter table public.businesses
  drop constraint if exists businesses_points_required_check;
alter table public.businesses
  add constraint businesses_points_required_check
  check (points_required between 1 and 1000000);
