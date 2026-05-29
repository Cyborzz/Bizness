insert into public.businesses (
  id,
  name,
  slug,
  reward_label,
  stamps_required,
  primary_color,
  business_type,
  is_active
) values (
  '00000000-0000-0000-0000-000000000001',
  'Snack Démo',
  'snack-demo',
  '1 menu offert',
  10,
  '#111827',
  'Snack / fast-food',
  true
) on conflict (slug) do update set
  name = excluded.name,
  reward_label = excluded.reward_label,
  stamps_required = excluded.stamps_required,
  primary_color = excluded.primary_color,
  business_type = excluded.business_type,
  is_active = excluded.is_active;

insert into public.customers (
  id,
  business_id,
  first_name,
  phone,
  email,
  consent_loyalty,
  consent_marketing
) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Amine', '0600000001', 'amine@example.com', true, true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Sarah', '0600000002', 'sarah@example.com', true, false),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Yassine', '0600000003', 'yassine@example.com', true, true)
on conflict (business_id, phone) where phone is not null and phone <> '' do update set
  first_name = excluded.first_name,
  email = excluded.email,
  consent_marketing = excluded.consent_marketing;

insert into public.loyalty_cards (
  id,
  business_id,
  customer_id,
  current_stamps,
  total_stamps,
  rewards_available,
  status
) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 4, 4, 0, 'active'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 9, 9, 0, 'active'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 0, 12, 1, 'active')
on conflict (business_id, customer_id) where status = 'active' do update set
  current_stamps = excluded.current_stamps,
  total_stamps = excluded.total_stamps,
  rewards_available = excluded.rewards_available,
  status = excluded.status;

insert into public.transactions (
  business_id,
  customer_id,
  card_id,
  type,
  value,
  note
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 'card_created', 0, 'Seed démo'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 'stamp_added', 4, 'Progression initiale'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000202', 'stamp_added', 9, 'Progression initiale'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', 'reward_earned', 1, 'Récompense disponible');

-- Après création du premier utilisateur Supabase Auth, exécuter :
-- insert into public.admin_users (id, email, role)
-- values ('AUTH_USER_UUID_ICI', 'admin@example.com', 'super_admin');
