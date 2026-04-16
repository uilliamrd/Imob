-- Anti "bola nas costas": detecta quando um lead (pelo telefone) já estava
-- sendo atendido por outro corretor e notifica o corretor original.

create table if not exists lead_conflicts (
  id                   uuid primary key default gen_random_uuid(),
  phone                text not null,
  original_lead_id     uuid references leads(id) on delete cascade,
  original_corretor_id uuid references profiles(id) on delete cascade,
  conflict_lead_id     uuid references leads(id) on delete cascade,
  acknowledged         boolean not null default false,
  created_at           timestamptz not null default now()
);

-- Índice para busca rápida por corretor (dashboard de leads)
create index if not exists idx_lead_conflicts_corretor
  on lead_conflicts(original_corretor_id, acknowledged);

-- Índice para evitar conflitos duplicados
create unique index if not exists idx_lead_conflicts_unique
  on lead_conflicts(original_lead_id, conflict_lead_id);
