-- Slug para corretor (URL amigável do minisite)
-- Rastreamento de rodízio de leads + ranking por pontos

alter table profiles
  add column if not exists slug text;

create unique index if not exists idx_profiles_slug
  on profiles(slug) where slug is not null;

-- Registra quando o corretor recebeu o último lead via rodízio
alter table profiles
  add column if not exists last_lead_at timestamptz;

-- View de ranking de corretores para rodízio
-- Score = minisite completo (50) + seleções (5/un) + views de seleções (1/view, max 100) + imóveis (3/un)
create or replace view corretor_scores as
select
  p.id,
  p.full_name,
  p.organization_id,
  p.last_lead_at,
  (
    case when (
      p.bio is not null and p.avatar_url is not null
      and p.whatsapp is not null and p.creci is not null
    ) then 50 else 0 end
    + coalesce((select count(*)::int * 5 from selections s where s.corretor_id = p.id), 0)
    + least(coalesce((select sum(s.views)::int from selections s where s.corretor_id = p.id), 0), 100)
    + coalesce((select count(*)::int * 3 from properties pr where pr.created_by = p.id), 0)
  ) as score
from profiles p
where p.role = 'corretor' and p.is_active = true;
