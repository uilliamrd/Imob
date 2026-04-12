-- ============================================================
-- RealState Intelligence — Migration v2
-- Execute this in Supabase SQL Editor
-- ============================================================

-- 1. Developments table (Empreendimentos)
create table if not exists developments (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  address       text,
  neighborhood  text,
  city          text,
  org_id        uuid references organizations(id) on delete set null,
  is_lancamento boolean not null default false,
  description   text,
  cover_image   text,
  created_at    timestamptz default now()
);

-- 2. Add code (unique numeric ID) to properties
create sequence if not exists property_code_seq start 1000;
alter table properties add column if not exists code integer default nextval('property_code_seq');
create unique index if not exists idx_properties_code on properties(code);

-- 3. Add development_id to properties
alter table properties add column if not exists development_id uuid references developments(id) on delete set null;

-- 4. Property listings junction table (for imobiliária/corretor curated lists)
create table if not exists property_listings (
  id          uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  org_id      uuid references organizations(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  created_at  timestamptz default now()
);

-- 5. Add is_active to profiles
alter table profiles add column if not exists is_active boolean not null default true;

-- 6. Fix INSERT policy for properties (add WITH CHECK)
drop policy if exists "properties_write_org" on properties;
create policy "properties_write_org" on properties
  for all using (
    created_by = auth.uid() or
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'imobiliaria', 'construtora')
    )
  )
  with check (
    created_by = auth.uid() or
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'imobiliaria', 'construtora')
    )
  );

-- 7. Admin can read all profiles (replaces profiles_read_own for admins)
drop policy if exists "profiles_read_own" on profiles;
create policy "profiles_read_own" on profiles
  for select using (
    auth.uid() = id or
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 8. Admin can update all profiles
drop policy if exists "profiles_admin_update_all" on profiles;
create policy "profiles_admin_update_all" on profiles
  for update using (
    auth.uid() = id or
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    auth.uid() = id or
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 9. Enable RLS on new tables
alter table developments enable row level security;
alter table property_listings enable row level security;

-- 10. Developments: authenticated users can read
create policy "developments_read_all" on developments
  for select using (auth.role() = 'authenticated');

-- 11. Developments: admin/construtora can write
create policy "developments_write" on developments
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'construtora')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'construtora')
    )
  );

-- 12. Property listings: users manage their own
create policy "listings_manage" on property_listings
  for all using (
    user_id = auth.uid() or
    org_id in (select organization_id from profiles where id = auth.uid())
  )
  with check (
    user_id = auth.uid() or
    org_id in (select organization_id from profiles where id = auth.uid())
  );

-- Indexes
create index if not exists idx_properties_development on properties(development_id);
create index if not exists idx_property_listings_property on property_listings(property_id);
create index if not exists idx_property_listings_user on property_listings(user_id);
create index if not exists idx_property_listings_org on property_listings(org_id);
create index if not exists idx_developments_org on developments(org_id);

-- Orgs: admin can insert/update/delete
drop policy if exists "orgs_write_admin" on organizations;
create policy "orgs_write_admin" on organizations
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
