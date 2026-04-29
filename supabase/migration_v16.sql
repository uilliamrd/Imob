-- migration_v16: property_submissions — owner-submitted listings for review

create table if not exists property_submissions (
  id           uuid primary key default gen_random_uuid(),
  -- Owner contact
  owner_name   text not null,
  owner_phone  text not null,
  owner_email  text,
  -- Property
  address      text,
  neighborhood text,
  city         text,
  cep          text,
  tipo         text,         -- apartamento, casa, terreno, comercial, cobertura, etc.
  tipo_negocio text not null default 'venda',
  price        numeric,
  area_m2      numeric,
  quartos      int,
  vagas        int,
  description  text,
  -- Plan chosen during submission
  plan         text not null default 'free'
               check (plan in ('free', 'destaque', 'super_destaque', 'exclusivo')),
  -- Admin workflow
  status       text not null default 'pending'
               check (status in ('pending', 'reviewing', 'approved', 'rejected', 'duplicate')),
  matched_property_id uuid references properties(id) on delete set null,
  admin_notes  text,
  created_at   timestamptz not null default now()
);

alter table property_submissions enable row level security;

-- Admin: full access
create policy "admin_full_submissions" on property_submissions
  for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Public: anyone can submit (insert only)
create policy "public_insert_submissions" on property_submissions
  for insert with check (true);

-- Index for admin triage
create index if not exists idx_submissions_status_date
  on property_submissions (status, created_at desc);
