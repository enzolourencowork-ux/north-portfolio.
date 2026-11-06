-- Execute no SQL Editor de um projeto Supabase da NORTH.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 160),
  client text not null default '',
  category text not null default 'Audiovisual',
  year text not null default '',
  description text not null default '',
  brief text not null default '',
  objective text not null default '',
  tone text not null default '',
  video_url text not null default '',
  cover_url text not null default '',
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
for each row execute procedure public.set_updated_at();

-- Ninguém consulta ou altera projetos diretamente usando a chave pública.
-- A API Next.js usa somente a service role, do lado do servidor.
alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;

-- Mídias publicamente acessíveis, mas upload apenas por URL assinada gerada
-- após autenticação no painel privado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('north-media', 'north-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;
