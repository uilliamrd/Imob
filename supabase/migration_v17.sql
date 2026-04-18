-- migration_v17: property visibility 4 levels + CRM fields for leads

-- ── Phase 9: Add 'corretores' visibility level ───────────────────────────────

-- Add new enum value (safe if already exists)
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumtypid = 'property_visibility'::regtype
      and enumlabel = 'corretores'
  ) then
    alter type property_visibility add value 'corretores';
  end if;
end $$;

-- RLS: allow any logged-in professional to read visibility='corretores' properties
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'properties'
      and policyname = 'professionals_read_corretores_properties'
  ) then
    execute $policy$
      create policy "professionals_read_corretores_properties"
        on properties
        for select
        using (
          visibility = 'corretores'
          and exists (
            select 1 from profiles
            where id = auth.uid()
              and role in ('admin', 'imobiliaria', 'corretor', 'construtora')
          )
        )
    $policy$;
  end if;
end $$;

-- ── Phase 10: CRM fields for leads ─────────────────────────────────────────

alter table leads
  add column if not exists cidade_cliente   text,
  add column if not exists perfil_imovel    text,
  add column if not exists preco_min        numeric(15,2),
  add column if not exists preco_max        numeric(15,2),
  add column if not exists tipo_negociacao  text;
