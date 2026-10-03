-- Ejecutar después de supabase-finanzas.sql y supabase-groups.sql.
-- El precio se consulta desde proveedores públicos; esta tabla solo guarda
-- la preferencia de aviso y el último valor necesario para detectar cambios.

alter table public.finanzas_ajustes
  drop constraint if exists finanzas_ajustes_moneda_check;
alter table public.finanzas_ajustes
  add constraint finanzas_ajustes_moneda_check
  check (moneda in ('EUR', 'USD', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'VES'));

create table if not exists public.finanzas_alertas_precio (
  user_id uuid primary key references auth.users(id) on delete cascade,
  moneda text not null default 'VES'
    check (moneda in ('EUR', 'USD', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'VES')),
  enabled boolean not null default false,
  last_usd_value numeric,
  last_usdt_value numeric,
  last_alert_usd_value numeric,
  last_alert_usdt_value numeric,
  last_checked_at timestamptz,
  last_notified_at timestamptz,
  history jsonb not null default '[]'::jsonb
    check (jsonb_typeof(history) = 'array' and jsonb_array_length(history) <= 60),
  updated_at timestamptz not null default now()
);

alter table public.finanzas_alertas_precio enable row level security;
drop policy if exists "finanzas alertas de precio propias" on public.finanzas_alertas_precio;
create policy "finanzas alertas de precio propias" on public.finanzas_alertas_precio for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
