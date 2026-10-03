-- Ejecutar después de supabase-finanzas.sql y supabase-groups.sql.
-- Las preferencias solo pueden ser consultadas o editadas por su propietario.

create table if not exists public.finanzas_recordatorios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete set null,
  personal_enabled boolean not null default true,
  group_enabled boolean not null default true,
  reminder_time time not null default '20:00',
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 64),
  locale text not null default 'es' check (locale in ('es', 'en', 'pt', 'zh', 'ja', 'ko', 'it', 'fr')),
  last_sent_date date,
  updated_at timestamptz not null default now(),
  check (not group_enabled or grupo_id is not null)
);

alter table public.finanzas_recordatorios
  drop constraint if exists finanzas_recordatorios_check;

alter table public.finanzas_recordatorios enable row level security;
drop policy if exists "finanzas recordatorios propios" on public.finanzas_recordatorios;
create policy "finanzas recordatorios propios" on public.finanzas_recordatorios for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (grupo_id is null or public.es_miembro_grupo(grupo_id))
  );

-- Tras desplegar finance-reminders, configura Vault y pg_cron con
-- supabase-finanzas-recordatorios-cron.sql. No guardes claves en el repositorio.
