-- Bootstrap : créer le premier super admin.
-- 1. Créez un utilisateur dans Supabase Auth (Dashboard > Authentication > Add user).
-- 2. Copiez l'UUID de l'utilisateur dans la requête ci-dessous, modifiez l'email, puis exécutez.

insert into public.admin_users (id, email, role)
values (
  '00000000-0000-0000-0000-000000000000', -- <- remplacez par l'UUID de l'utilisateur Auth
  'admin@example.com',                    -- <- remplacez par votre email
  'super_admin'
)
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role;

-- Vérification :
select id, email, role from public.admin_users;
