create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text not null default '#111827',
  address text,
  phone text,
  email text,
  business_type text,
  loyalty_type text not null default 'stamps',
  stamps_required int not null default 10,
  reward_label text not null default '1 récompense offerte',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_loyalty_type_check check (loyalty_type in ('stamps', 'points')),
  constraint businesses_stamps_required_check check (stamps_required between 1 and 50),
  constraint businesses_primary_color_check check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint businesses_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  first_name text not null,
  last_name text,
  phone text,
  email text,
  consent_loyalty boolean not null default true,
  consent_marketing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_contact_required check (
    nullif(trim(coalesce(phone, '')), '') is not null
    or nullif(trim(coalesce(email, '')), '') is not null
  )
);

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  current_stamps int not null default 0,
  total_stamps int not null default 0,
  rewards_available int not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loyalty_cards_status_check check (status in ('active', 'inactive')),
  constraint loyalty_cards_non_negative_check check (
    current_stamps >= 0 and total_stamps >= 0 and rewards_available >= 0
  )
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  type text not null,
  value int not null default 0,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint transactions_type_check check (
    type in ('card_created', 'stamp_added', 'stamp_removed', 'reward_earned', 'reward_redeemed', 'customer_deleted')
  )
);

create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'business_owner',
  business_id uuid references public.businesses(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('super_admin', 'business_owner', 'staff'))
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_name text,
  business_type text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create unique index customers_business_phone_unique
  on public.customers (business_id, phone)
  where phone is not null and phone <> '';

create unique index customers_business_email_unique
  on public.customers (business_id, lower(email))
  where email is not null and email <> '';

create unique index loyalty_cards_active_customer_unique
  on public.loyalty_cards (business_id, customer_id)
  where status = 'active';

create index customers_business_id_idx on public.customers (business_id);
create index loyalty_cards_business_id_idx on public.loyalty_cards (business_id);
create index transactions_business_id_created_at_idx on public.transactions (business_id, created_at desc);
create index transactions_card_id_created_at_idx on public.transactions (card_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger loyalty_cards_updated_at
before update on public.loyalty_cards
for each row execute function public.set_updated_at();

create or replace function public.current_admin_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.admin_users where id = auth.uid()
$$;

create or replace function public.current_admin_business_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select business_id from public.admin_users where id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_admin_role() = 'super_admin', false)
$$;

alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.admin_users enable row level security;
alter table public.leads enable row level security;

create policy "public can read active businesses"
on public.businesses for select
to anon, authenticated
using (
  is_active = true
  or public.is_super_admin()
  or id = public.current_admin_business_id()
);

create policy "super admin can manage businesses"
on public.businesses for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "business users can update own business"
on public.businesses for update
to authenticated
using (id = public.current_admin_business_id() and public.current_admin_role() in ('business_owner', 'staff'))
with check (id = public.current_admin_business_id() and public.current_admin_role() in ('business_owner', 'staff'));

create policy "admin users can read own profile"
on public.admin_users for select
to authenticated
using (id = auth.uid() or public.is_super_admin());

create policy "super admin can manage admin users"
on public.admin_users for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "business admins read customers"
on public.customers for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());

create policy "business owners manage customers"
on public.customers for all
to authenticated
using (public.is_super_admin() or (business_id = public.current_admin_business_id() and public.current_admin_role() = 'business_owner'))
with check (public.is_super_admin() or (business_id = public.current_admin_business_id() and public.current_admin_role() = 'business_owner'));

create policy "business staff update customer consent"
on public.customers for update
to authenticated
using (business_id = public.current_admin_business_id() and public.current_admin_role() = 'staff')
with check (business_id = public.current_admin_business_id() and public.current_admin_role() = 'staff');

create policy "business admins read loyalty cards"
on public.loyalty_cards for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());

create policy "business staff manage loyalty cards"
on public.loyalty_cards for update
to authenticated
using (public.is_super_admin() or (business_id = public.current_admin_business_id() and public.current_admin_role() in ('business_owner', 'staff')))
with check (public.is_super_admin() or (business_id = public.current_admin_business_id() and public.current_admin_role() in ('business_owner', 'staff')));

create policy "business owners insert loyalty cards"
on public.loyalty_cards for insert
to authenticated
with check (public.is_super_admin() or (business_id = public.current_admin_business_id() and public.current_admin_role() = 'business_owner'));

create policy "business admins read transactions"
on public.transactions for select
to authenticated
using (public.is_super_admin() or business_id = public.current_admin_business_id());

create policy "business admins insert transactions"
on public.transactions for insert
to authenticated
with check (public.is_super_admin() or business_id = public.current_admin_business_id());

create policy "public can create leads"
on public.leads for insert
to anon, authenticated
with check (true);

create policy "super admin can manage leads"
on public.leads for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

create policy "public can read business logos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'business-logos');

create policy "admins can upload business logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-logos'
  and (public.is_super_admin() or public.current_admin_role() in ('business_owner', 'staff'))
);

create policy "admins can update business logos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'business-logos'
  and (public.is_super_admin() or public.current_admin_role() in ('business_owner', 'staff'))
)
with check (
  bucket_id = 'business-logos'
  and (public.is_super_admin() or public.current_admin_role() in ('business_owner', 'staff'))
);
