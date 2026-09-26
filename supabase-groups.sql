-- SunAdventures: perfiles, amigos, grupos privados y contenido compartido.
-- Ejecutar después de la migración base.

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_-]{3,20}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null default 'Nuestro grupo de aventuras',
  creado_por uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.grupo_miembros (
  grupo_id uuid not null references public.grupos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null default 'miembro' check (rol in ('owner', 'miembro')),
  created_at timestamptz not null default now(),
  primary key (grupo_id, user_id)
);

create table if not exists public.invitaciones_grupo (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos(id) on delete cascade,
  invitado_id uuid not null references auth.users(id) on delete cascade,
  invitado_por uuid not null references auth.users(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptada', 'rechazada')),
  created_at timestamptz not null default now(),
  unique (grupo_id, invitado_id)
);

alter table public.fotos add column if not exists grupo_id uuid references public.grupos(id) on delete cascade;
alter table public.notas add column if not exists grupo_id uuid references public.grupos(id) on delete cascade;
alter table public.playlists add column if not exists grupo_id uuid references public.grupos(id) on delete cascade;
alter table public.mensajes add column if not exists grupo_id uuid references public.grupos(id) on delete cascade;

update public.mensajes m
set grupo_id = gm.grupo_id,
    room_id = gm.grupo_id::text
from public.grupo_miembros gm
where m.grupo_id is null
  and gm.user_id = m.user_id
  and gm.grupo_id = (
    select gm2.grupo_id
    from public.grupo_miembros gm2
    where gm2.user_id = m.user_id
    order by gm2.grupo_id
    limit 1
  );

create index if not exists grupo_miembros_user_idx on public.grupo_miembros(user_id);
create index if not exists invitaciones_invitado_idx on public.invitaciones_grupo(invitado_id);
create index if not exists fotos_grupo_idx on public.fotos(grupo_id);
create index if not exists notas_grupo_idx on public.notas(grupo_id);
create index if not exists playlists_grupo_idx on public.playlists(grupo_id);

create or replace function public.es_miembro_grupo(grupo uuid)
returns boolean language sql security definer set search_path = public
as $$ select exists (select 1 from public.grupo_miembros where grupo_id = $1 and user_id = auth.uid()) $$;

alter table public.perfiles enable row level security;
alter table public.grupos enable row level security;
alter table public.grupo_miembros enable row level security;
alter table public.invitaciones_grupo enable row level security;

drop policy if exists "perfiles visibles para usuarios autenticados" on public.perfiles;
drop policy if exists "perfil propio editable" on public.perfiles;
drop policy if exists "perfil propio actualizable" on public.perfiles;
drop policy if exists "grupos miembros visibles" on public.grupos;
drop policy if exists "grupo propio visible" on public.grupos;
drop policy if exists "crear grupo propio" on public.grupos;
drop policy if exists "miembros visibles" on public.grupo_miembros;
drop policy if exists "crear membresía del grupo propio" on public.grupo_miembros;
drop policy if exists "aceptar invitación" on public.grupo_miembros;
drop policy if exists "invitaciones propias o enviadas" on public.invitaciones_grupo;
drop policy if exists "crear invitaciones como miembro" on public.invitaciones_grupo;
drop policy if exists "responder invitaciones" on public.invitaciones_grupo;

create policy "perfiles visibles para usuarios autenticados" on public.perfiles for select using (auth.role() = 'authenticated');
create policy "perfil propio editable" on public.perfiles for insert with check (auth.uid() = id);
create policy "perfil propio actualizable" on public.perfiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "grupos miembros visibles" on public.grupos for select using (public.es_miembro_grupo(id));
create policy "grupo propio visible" on public.grupos for select using (auth.uid() = creado_por);
create policy "crear grupo propio" on public.grupos for insert with check (auth.uid() = creado_por);
create policy "miembros visibles" on public.grupo_miembros for select using (public.es_miembro_grupo(grupo_id));
create policy "crear membresía del grupo propio" on public.grupo_miembros for insert with check (exists (select 1 from public.grupos where id = grupo_miembros.grupo_id and creado_por = auth.uid()) and user_id = auth.uid());
create policy "aceptar invitación" on public.grupo_miembros for insert with check (auth.uid() = user_id and exists (select 1 from public.invitaciones_grupo where grupo_id = grupo_miembros.grupo_id and invitado_id = auth.uid() and estado = 'pendiente'));
create policy "invitaciones propias o enviadas" on public.invitaciones_grupo for select using (auth.uid() = invitado_id or auth.uid() = invitado_por);
create policy "crear invitaciones como miembro" on public.invitaciones_grupo for insert with check (auth.uid() = invitado_por and public.es_miembro_grupo(grupo_id));
create policy "responder invitaciones" on public.invitaciones_grupo for update using (auth.uid() = invitado_id) with check (auth.uid() = invitado_id);

-- Sustituye el acceso personal por acceso a cualquier grupo del usuario.
drop policy if exists "fotos propias" on public.fotos;
drop policy if exists "notas propias" on public.notas;
drop policy if exists "playlists propias" on public.playlists;
drop policy if exists "fotos del grupo" on public.fotos;
drop policy if exists "notas del grupo" on public.notas;
drop policy if exists "playlists del grupo" on public.playlists;
create policy "fotos del grupo" on public.fotos for all using (public.es_miembro_grupo(grupo_id) or auth.uid() = user_id) with check (public.es_miembro_grupo(grupo_id) or auth.uid() = user_id);
create policy "notas del grupo" on public.notas for all using (public.es_miembro_grupo(grupo_id) or auth.uid() = user_id) with check (public.es_miembro_grupo(grupo_id) or auth.uid() = user_id);
create policy "playlists del grupo" on public.playlists for all using (public.es_miembro_grupo(grupo_id) or auth.uid() = user_id) with check (public.es_miembro_grupo(grupo_id) or auth.uid() = user_id);

drop policy if exists "mensajes autenticados" on public.mensajes;
drop policy if exists "mensajes propios" on public.mensajes;
drop policy if exists "mensajes del grupo" on public.mensajes;
drop policy if exists "mensajes propios del grupo" on public.mensajes;
create policy "mensajes del grupo" on public.mensajes for select using (public.es_miembro_grupo(grupo_id));
create policy "mensajes propios del grupo" on public.mensajes for insert with check (auth.uid() = user_id and public.es_miembro_grupo(grupo_id));

-- Permite que un miembro vea solo los archivos vinculados a contenido de su grupo.
drop policy if exists "fotos del grupo en storage" on storage.objects;
drop policy if exists "canciones del grupo en storage" on storage.objects;

create policy "fotos del grupo en storage" on storage.objects for select using (
  bucket_id = 'album' and exists (
    select 1 from public.fotos
    where public.fotos.path = storage.objects.name
      and public.es_miembro_grupo(public.fotos.grupo_id)
  )
);

create policy "canciones del grupo en storage" on storage.objects for select using (
  bucket_id = 'canciones' and exists (
    select 1 from public.playlists p
    where public.es_miembro_grupo(p.grupo_id)
      and exists (
        select 1 from jsonb_array_elements(coalesce(p.canciones, '[]'::jsonb)) cancion
        where cancion->>'url' = 'storage:' || storage.objects.name
      )
  )
);
