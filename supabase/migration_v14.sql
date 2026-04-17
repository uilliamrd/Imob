-- migration_v14: property_ads — monetização via anúncios de imóveis

create table if not exists property_ads (
  id            uuid        primary key default gen_random_uuid(),
  property_id   uuid        not null references properties(id) on delete cascade,
  org_id        uuid        references organizations(id) on delete set null,
  tier          text        not null default 'destaque'
                            check (tier in ('destaque', 'super_destaque')),
  status        text        not null default 'pending'
                            check (status in ('pending', 'active', 'paused', 'expired')),
  starts_at     timestamptz,
  expires_at    timestamptz,
  created_by    uuid        references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  notes         text
);

-- Índice para busca rápida de anúncios ativos por tier (usado no portal)
create index if not exists idx_property_ads_active_tier
  on property_ads(tier, status)
  where status = 'active';

create index if not exists idx_property_ads_property
  on property_ads(property_id);

create index if not exists idx_property_ads_org
  on property_ads(org_id);

-- RLS: admin lê e escreve tudo; outros roles só leem os próprios
alter table property_ads enable row level security;

create policy "admin full access" on property_ads
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "org read own ads" on property_ads
  for select using (
    org_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );
