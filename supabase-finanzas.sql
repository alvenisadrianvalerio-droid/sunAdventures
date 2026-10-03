-- Finanzas personales y compartidas de SunAdventures.
-- Ejecutar en Supabase SQL Editor después de supabase-groups.sql.

create table if not exists public.finanzas_ajustes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  moneda text not null default 'EUR' check (moneda in ('EUR', 'USD', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'VES')),
  created_at timestamptz not null default now()
);
create unique index if not exists finanzas_ajustes_personal_uidx
  on public.finanzas_ajustes(user_id) where grupo_id is null;
create unique index if not exists finanzas_ajustes_grupo_uidx
  on public.finanzas_ajustes(grupo_id) where grupo_id is not null;

create table if not exists public.finanzas_categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 40),
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  created_at timestamptz not null default now()
);
create unique index if not exists finanzas_categorias_personal_uidx
  on public.finanzas_categorias(user_id, lower(nombre), tipo) where grupo_id is null;
create unique index if not exists finanzas_categorias_grupo_uidx
  on public.finanzas_categorias(grupo_id, lower(nombre), tipo) where grupo_id is not null;

create table if not exists public.finanzas_movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  miembro_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references public.finanzas_categorias(id) on delete set null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  monto numeric(14, 2) not null check (monto > 0),
  fecha date not null default current_date,
  descripcion text not null default '' check (char_length(descripcion) <= 120),
  created_at timestamptz not null default now()
);
create index if not exists finanzas_movimientos_personal_idx
  on public.finanzas_movimientos(user_id, fecha desc) where grupo_id is null;
create index if not exists finanzas_movimientos_grupo_idx
  on public.finanzas_movimientos(grupo_id, fecha desc) where grupo_id is not null;

create table if not exists public.finanzas_presupuestos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  categoria_id uuid references public.finanzas_categorias(id) on delete set null,
  periodo date not null check (extract(day from periodo) = 1),
  limite numeric(14, 2) not null check (limite > 0),
  created_at timestamptz not null default now()
);
create unique index if not exists finanzas_presupuestos_personal_uidx
  on public.finanzas_presupuestos(user_id, periodo, coalesce(categoria_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where grupo_id is null;
create unique index if not exists finanzas_presupuestos_grupo_uidx
  on public.finanzas_presupuestos(grupo_id, periodo, coalesce(categoria_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where grupo_id is not null;

create table if not exists public.finanzas_metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 60),
  objetivo numeric(14, 2) not null check (objetivo > 0),
  fecha_objetivo date,
  created_at timestamptz not null default now()
);
create index if not exists finanzas_metas_personal_idx on public.finanzas_metas(user_id) where grupo_id is null;
create index if not exists finanzas_metas_grupo_idx on public.finanzas_metas(grupo_id) where grupo_id is not null;

create table if not exists public.finanzas_aportes (
  id uuid primary key default gen_random_uuid(),
  meta_id uuid not null references public.finanzas_metas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  monto numeric(14, 2) not null check (monto > 0),
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists finanzas_aportes_meta_idx on public.finanzas_aportes(meta_id, fecha);

alter table public.finanzas_ajustes enable row level security;
alter table public.finanzas_categorias enable row level security;
alter table public.finanzas_movimientos enable row level security;
alter table public.finanzas_presupuestos enable row level security;
alter table public.finanzas_metas enable row level security;
alter table public.finanzas_aportes enable row level security;

drop policy if exists "finanzas ajustes visibles" on public.finanzas_ajustes;
drop policy if exists "finanzas ajustes insertables" on public.finanzas_ajustes;
drop policy if exists "finanzas ajustes editables" on public.finanzas_ajustes;
create policy "finanzas ajustes visibles" on public.finanzas_ajustes for select using (
  (grupo_id is null and user_id = auth.uid()) or
  (grupo_id is not null and public.es_miembro_grupo(grupo_id))
);
create policy "finanzas ajustes insertables" on public.finanzas_ajustes for insert with check (
  user_id = auth.uid() and
  (grupo_id is null or public.es_miembro_grupo(grupo_id))
);
create policy "finanzas ajustes editables" on public.finanzas_ajustes for update
  using ((grupo_id is null and user_id = auth.uid()) or (grupo_id is not null and public.es_miembro_grupo(grupo_id)))
  with check ((grupo_id is null and user_id = auth.uid()) or (grupo_id is not null and public.es_miembro_grupo(grupo_id)));

drop policy if exists "finanzas categorias visibles" on public.finanzas_categorias;
drop policy if exists "finanzas categorias insertables" on public.finanzas_categorias;
drop policy if exists "finanzas categorias propias editables" on public.finanzas_categorias;
create policy "finanzas categorias visibles" on public.finanzas_categorias for select using (
  (grupo_id is null and user_id = auth.uid()) or
  (grupo_id is not null and public.es_miembro_grupo(grupo_id))
);
create policy "finanzas categorias insertables" on public.finanzas_categorias for insert with check (
  user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id))
);
create policy "finanzas categorias propias editables" on public.finanzas_categorias for all
  using (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)))
  with check (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)));

drop policy if exists "finanzas movimientos visibles" on public.finanzas_movimientos;
drop policy if exists "finanzas movimientos insertables" on public.finanzas_movimientos;
drop policy if exists "finanzas movimientos propios editables" on public.finanzas_movimientos;
drop policy if exists "finanzas movimientos propios eliminables" on public.finanzas_movimientos;
create policy "finanzas movimientos visibles" on public.finanzas_movimientos for select using (
  (grupo_id is null and user_id = auth.uid()) or
  (grupo_id is not null and public.es_miembro_grupo(grupo_id))
);
create policy "finanzas movimientos insertables" on public.finanzas_movimientos for insert with check (
  user_id = auth.uid() and (
    (grupo_id is null and miembro_id = auth.uid()) or
    (grupo_id is not null and public.es_miembro_grupo(grupo_id) and exists (
      select 1 from public.grupo_miembros gm
      where gm.grupo_id = finanzas_movimientos.grupo_id and gm.user_id = finanzas_movimientos.miembro_id
    ))
  ) and (
    finanzas_movimientos.categoria_id is null or exists (
      select 1 from public.finanzas_categorias c
      where c.id = finanzas_movimientos.categoria_id
        and c.tipo = finanzas_movimientos.tipo
        and ((finanzas_movimientos.grupo_id is null and c.grupo_id is null and c.user_id = auth.uid())
          or (finanzas_movimientos.grupo_id is not null and c.grupo_id = finanzas_movimientos.grupo_id))
    )
  )
);
create policy "finanzas movimientos propios editables" on public.finanzas_movimientos for update
  using (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)))
  with check (
    user_id = auth.uid() and (
      (grupo_id is null and miembro_id = auth.uid()) or
      (grupo_id is not null and public.es_miembro_grupo(grupo_id) and exists (
        select 1 from public.grupo_miembros gm
        where gm.grupo_id = finanzas_movimientos.grupo_id and gm.user_id = finanzas_movimientos.miembro_id
      ))
    ) and (
      categoria_id is null or exists (
        select 1 from public.finanzas_categorias c
        where c.id = finanzas_movimientos.categoria_id
          and c.tipo = finanzas_movimientos.tipo
          and ((finanzas_movimientos.grupo_id is null and c.grupo_id is null and c.user_id = auth.uid())
            or (finanzas_movimientos.grupo_id is not null and c.grupo_id = finanzas_movimientos.grupo_id))
      )
    )
  );
create policy "finanzas movimientos propios eliminables" on public.finanzas_movimientos for delete
  using (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)));

drop policy if exists "finanzas presupuestos visibles" on public.finanzas_presupuestos;
drop policy if exists "finanzas presupuestos insertables" on public.finanzas_presupuestos;
drop policy if exists "finanzas presupuestos propios editables" on public.finanzas_presupuestos;
create policy "finanzas presupuestos visibles" on public.finanzas_presupuestos for select using (
  (grupo_id is null and user_id = auth.uid()) or
  (grupo_id is not null and public.es_miembro_grupo(grupo_id))
);
create policy "finanzas presupuestos insertables" on public.finanzas_presupuestos for insert with check (
  user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id))
);
create policy "finanzas presupuestos propios editables" on public.finanzas_presupuestos for all
  using (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)))
  with check (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)));

drop policy if exists "finanzas metas visibles" on public.finanzas_metas;
drop policy if exists "finanzas metas insertables" on public.finanzas_metas;
drop policy if exists "finanzas metas propias editables" on public.finanzas_metas;
create policy "finanzas metas visibles" on public.finanzas_metas for select using (
  (grupo_id is null and user_id = auth.uid()) or
  (grupo_id is not null and public.es_miembro_grupo(grupo_id))
);
create policy "finanzas metas insertables" on public.finanzas_metas for insert with check (
  user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id))
);
create policy "finanzas metas propias editables" on public.finanzas_metas for all
  using (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)))
  with check (user_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)));

drop policy if exists "finanzas aportes visibles" on public.finanzas_aportes;
drop policy if exists "finanzas aportes insertables" on public.finanzas_aportes;
create policy "finanzas aportes visibles" on public.finanzas_aportes for select using (
  (grupo_id is null and user_id = auth.uid()) or
  (grupo_id is not null and public.es_miembro_grupo(grupo_id))
);
create policy "finanzas aportes insertables" on public.finanzas_aportes for insert with check (
  user_id = auth.uid() and (
    (grupo_id is null and exists (select 1 from public.finanzas_metas m where m.id = meta_id and m.user_id = auth.uid() and m.grupo_id is null)) or
    (grupo_id is not null and public.es_miembro_grupo(grupo_id) and exists (
      select 1 from public.finanzas_metas m where m.id = meta_id and m.grupo_id = grupo_id
    ))
  )
);
