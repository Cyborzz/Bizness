-- 012_rbac_hardening.sql
-- Resserre les politiques RLS pour aligner la base sur les restrictions déjà
-- appliquées côté UI et côté actions serveur (défense en profondeur).
--   * staff ne peut plus modifier le commerce (businesses)
--   * staff ne peut plus gérer les offres (offers)
--   * business_owner peut lire les membres de SA propre équipe (admin_users)
-- Le staff conserve : maj du consentement client, lecture/maj des cartes (tampons).
-- Idempotent : peut être rejoué sans risque.

-- 1) businesses : modification réservée au business_owner (et super_admin via l'autre policy)
drop policy if exists "business users can update own business" on public.businesses;
drop policy if exists "business owners update own business" on public.businesses;
create policy "business owners update own business"
on public.businesses for update
to authenticated
using (
  id = public.current_admin_business_id()
  and public.current_admin_role() = 'business_owner'
)
with check (
  id = public.current_admin_business_id()
  and public.current_admin_role() = 'business_owner'
);

-- 2) offers : gestion réservée au business_owner (et super_admin)
drop policy if exists "business owners manage offers" on public.offers;
create policy "business owners manage offers"
on public.offers for all
to authenticated
using (
  public.is_super_admin()
  or (business_id = public.current_admin_business_id()
      and public.current_admin_role() = 'business_owner')
)
with check (
  public.is_super_admin()
  or (business_id = public.current_admin_business_id()
      and public.current_admin_role() = 'business_owner')
);

-- 3) admin_users : un business_owner peut lire les membres de son propre commerce
--    (s'ajoute à la policy "admin users can read own profile" — les policies SELECT sont en OU)
drop policy if exists "business owner reads own team" on public.admin_users;
create policy "business owner reads own team"
on public.admin_users for select
to authenticated
using (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.current_admin_role() = 'business_owner'
    and business_id = public.current_admin_business_id()
  )
);
