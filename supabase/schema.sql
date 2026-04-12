-- ============================================================
-- RealState Intelligence — Supabase Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── ENUMS ────────────────────────────────────────────────────
create type user_role as enum ('admin', 'imobiliaria', 'corretor', 'construtora');
create type org_type as enum ('imobiliaria', 'construtora');
create type property_status as enum ('disponivel', 'vendido', 'reserva');
create type property_visibility as enum ('publico', 'equipe', 'privado');

-- ─── ORGANIZATIONS ────────────────────────────────────────────
create table organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  type          org_type not null,
  logo          text,
  brand_colors  jsonb default '{}',
  portfolio_desc text,
  website       text,
  created_at    timestamptz default now()
);

-- ─── PROFILES ─────────────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  avatar_url      text,
  role            user_role not null default 'corretor',
  bio             text,
  whatsapp        text,
  creci           text,
  organization_id uuid references organizations(id) on delete set null,
  created_at      timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── PROPERTIES ───────────────────────────────────────────────
create table properties (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  description  text,
  price        decimal(15,2) not null,
  features     jsonb not null default '{}',
  tags         text[] default '{}',
  status       property_status not null default 'disponivel',
  visibility   property_visibility not null default 'publico',
  created_by   uuid references profiles(id) on delete set null,
  org_id       uuid references organizations(id) on delete set null,
  images       text[] default '{}',
  video_url    text,
  address      text,
  neighborhood text,
  city         text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── RLS POLICIES ─────────────────────────────────────────────
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table properties enable row level security;

-- Profiles: users can read their own + public fields
create policy "profiles_read_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Organizations: any authenticated user can read
create policy "orgs_read_all" on organizations
  for select using (auth.role() = 'authenticated');

-- Properties RBAC:
-- 1. Public properties: visible to everyone
create policy "properties_read_public" on properties
  for select using (visibility = 'publico');

-- 2. Team properties: visible to same org members
create policy "properties_read_team" on properties
  for select using (
    visibility = 'equipe' and
    org_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

-- 3. Private properties: only creator
create policy "properties_read_private" on properties
  for select using (
    visibility = 'privado' and created_by = auth.uid()
  );

-- 4. Insert/Update/Delete: only org members or admins
create policy "properties_write_org" on properties
  for all using (
    created_by = auth.uid() or
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'imobiliaria', 'construtora')
    )
  );

-- ─── INDEXES ──────────────────────────────────────────────────
create index idx_properties_slug on properties(slug);
create index idx_properties_org on properties(org_id);
create index idx_properties_status on properties(status);
create index idx_profiles_org on profiles(organization_id);
create index idx_profiles_role on profiles(role);

-- ─── STORAGE BUCKETS ──────────────────────────────────────────
-- Run in Supabase Storage UI or via API:
-- Bucket: "property-images" (public)
-- Bucket: "org-logos" (public)
-- Bucket: "avatar-photos" (public)
