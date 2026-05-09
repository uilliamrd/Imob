create table public.org_portfolio (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  nome        text not null,
  ano_entrega int,
  cidade      text,
  descricao   text,
  fotos       text[] not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.org_portfolio enable row level security;

-- public select (landing page)
create policy "portfolio_select" on public.org_portfolio
  for select using (true);

-- org members can manage their own records
create policy "portfolio_insert" on public.org_portfolio
  for insert with check (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid() and organization_id is not null
    )
  );

create policy "portfolio_update" on public.org_portfolio
  for update using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid() and organization_id is not null
    )
  );

create policy "portfolio_delete" on public.org_portfolio
  for delete using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid() and organization_id is not null
    )
  );
