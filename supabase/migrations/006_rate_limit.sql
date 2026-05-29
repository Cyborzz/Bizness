-- Migration 006 : rate-limiting des actions publiques (anti-spam / anti-énumération).
-- Approche DB-backed (compatible serverless multi-instances, sans Redis).

create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_idx
  on public.rate_limit_hits (bucket, created_at desc);

-- RLS activée sans policy : seuls le service_role et la fonction security-definer
-- ci-dessous peuvent y accéder. Aucun accès anon/authenticated direct.
alter table public.rate_limit_hits enable row level security;

-- Renvoie true si l'action est autorisée (sous la limite), false si bloquée.
-- Compte les hits du bucket dans la fenêtre, puis enregistre le hit courant.
create or replace function public.check_rate_limit(
  p_bucket text,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hits int;
begin
  -- Nettoyage opportuniste des entrées anciennes de ce bucket.
  delete from public.rate_limit_hits
   where bucket = p_bucket
     and created_at < now() - make_interval(secs => p_window_seconds * 5);

  select count(*) into hits
    from public.rate_limit_hits
   where bucket = p_bucket
     and created_at > now() - make_interval(secs => p_window_seconds);

  if hits >= p_limit then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int)
  to anon, authenticated, service_role;
