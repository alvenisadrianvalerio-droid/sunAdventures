-- SunAdventures: soporte para mapa, chat privado y Web Push.
-- Ejecutar en Supabase SQL Editor antes de usar estas funciones.

alter table public.fotos
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists lugar text;

create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  room_id text not null default 'sunadventures-private',
  user_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null check (char_length(trim(contenido)) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.mensajes
  add column if not exists room_id text not null default 'sunadventures-private';

create index if not exists mensajes_created_at_idx on public.mensajes(created_at);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.fotos enable row level security;
alter table public.mensajes enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "fotos propias" on public.fotos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mensajes autenticados" on public.mensajes for select using (auth.role() = 'authenticated');
create policy "mensajes propios" on public.mensajes for insert with check (auth.uid() = user_id);
create policy "push propias" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.mensajes;
