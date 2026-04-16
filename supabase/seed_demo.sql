-- =============================================================
-- SEED DE DADOS DEMO — RealState Intelligence
-- Rodar APÓS migration_v12.sql no Supabase SQL Editor
-- =============================================================

DO $$
DECLARE
  admin_id            uuid;
  org_horizonte_id    uuid;
  bairro_jardins_id   uuid;
  bairro_moema_id     uuid;
  bairro_itaim_id     uuid;
  bairro_boavista_id  uuid;
  logr_oscar_id       uuid;
  logr_santos_id      uuid;
  logr_ibirapuera_id  uuid;
  logr_groenlandia_id uuid;
  dev_lumiere_id      uuid;
  dev_pedras_id       uuid;
BEGIN

-- ──────────────────────────────────────────────────────────────
-- 0. USUÁRIO ADMIN
-- ──────────────────────────────────────────────────────────────
SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
IF admin_id IS NULL THEN
  RAISE EXCEPTION 'Nenhum usuário admin encontrado. Crie um admin antes de rodar o seed.';
END IF;

-- ──────────────────────────────────────────────────────────────
-- 1. ORGANIZAÇÃO — Construtora Horizonte
-- ──────────────────────────────────────────────────────────────
INSERT INTO organizations (
  name, slug, type, brand_colors,
  hero_tagline, portfolio_desc,
  about_text,
  whatsapp, website,
  has_lancamentos
) VALUES (
  'Construtora Horizonte',
  'horizonte',
  'construtora',
  '{"primary": "#C9A96E", "secondary": "#1a1a1a", "accent": "#e8d5a3"}'::jsonb,
  'Construindo futuros com excelência há 30 anos.',
  'Especializada em empreendimentos residenciais de alto padrão em São Paulo, a Horizonte entrega projetos que aliam arquitetura contemporânea, localização estratégica e acabamentos excepcionais.',
  'Fundada em 1994, a Construtora Horizonte acumula mais de 40 empreendimentos entregues em São Paulo, sempre com foco em qualidade, pontualidade e valorização do patrimônio dos seus clientes. Nosso portfólio abrange desde coberturas exclusivas nos Jardins até condomínios de lotes premium em áreas de preservação ambiental.',
  '5511999990000',
  'https://construtora-horizonte.com.br',
  true
) RETURNING id INTO org_horizonte_id;

-- ──────────────────────────────────────────────────────────────
-- 2. BAIRROS
-- ──────────────────────────────────────────────────────────────
INSERT INTO bairros (name, city, state) VALUES ('Jardins', 'São Paulo', 'SP')
  RETURNING id INTO bairro_jardins_id;

INSERT INTO bairros (name, city, state) VALUES ('Moema', 'São Paulo', 'SP')
  RETURNING id INTO bairro_moema_id;

INSERT INTO bairros (name, city, state) VALUES ('Itaim Bibi', 'São Paulo', 'SP')
  RETURNING id INTO bairro_itaim_id;

INSERT INTO bairros (name, city, state) VALUES ('Alto da Boa Vista', 'São Paulo', 'SP')
  RETURNING id INTO bairro_boavista_id;

-- ──────────────────────────────────────────────────────────────
-- 3. LOGRADOUROS
-- ──────────────────────────────────────────────────────────────
INSERT INTO logradouros (type, name, bairro_id, city, cep)
  VALUES ('Rua', 'Oscar Freire', bairro_jardins_id, 'São Paulo', '01426-000')
  RETURNING id INTO logr_oscar_id;

INSERT INTO logradouros (type, name, bairro_id, city, cep)
  VALUES ('Alameda', 'Santos', bairro_jardins_id, 'São Paulo', '01419-002')
  RETURNING id INTO logr_santos_id;

INSERT INTO logradouros (type, name, bairro_id, city, cep)
  VALUES ('Avenida', 'Ibirapuera', bairro_moema_id, 'São Paulo', '04029-000')
  RETURNING id INTO logr_ibirapuera_id;

INSERT INTO logradouros (type, name, bairro_id, city, cep)
  VALUES ('Rua', 'Groenlândia', bairro_itaim_id, 'São Paulo', '01440-050')
  RETURNING id INTO logr_groenlandia_id;

-- ──────────────────────────────────────────────────────────────
-- 4. EMPREENDIMENTOS
-- ──────────────────────────────────────────────────────────────

-- 4a. Edifício Lumière — torre residencial nos Jardins
INSERT INTO developments (
  name, address, neighborhood, city, org_id,
  is_lancamento, is_delivered,
  description, cover_image, images, documents
) VALUES (
  'Edifício Lumière',
  'Rua Oscar Freire, 1847',
  'Jardins',
  'São Paulo',
  org_horizonte_id,
  true,
  false,
  'O Lumière é a expressão máxima do viver sofisticado nos Jardins. Com 10 pavimentos e apenas 8 unidades — uma por andar — cada apartamento foi concebido para oferecer privacidade absoluta, acabamentos de altíssimo padrão e uma vista privilegiada para o skyline paulistano. Pé-direito de 3,2m, varanda integrada e tecnologia smart home em cada unidade.',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&auto=format&fit=crop&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80'
  ],
  '[]'::jsonb
) RETURNING id INTO dev_lumiere_id;

-- 4b. Condomínio Alto das Pedras — loteamento fechado
INSERT INTO developments (
  name, address, neighborhood, city, org_id,
  is_lancamento, is_delivered,
  description, cover_image, images, documents
) VALUES (
  'Condomínio Alto das Pedras',
  'Estrada das Pedras, km 3',
  'Alto da Boa Vista',
  'São Paulo',
  org_horizonte_id,
  false,
  false,
  'Um refúgio exclusivo a apenas 20 minutos do centro de São Paulo. 12 lotes de alto padrão em área de preservação ambiental permanente, com infraestrutura completa de água, esgoto, energia e fibra ótica enterrada. Portaria 24h, clube privativo com piscina, quadras e salão gourmet. Projeto paisagístico assinado com trilhas ecológicas e lago artificial.',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80'
  ],
  '[{"name": "Tabela de Preços — Alto das Pedras 2025", "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf", "type": "PDF"}, {"name": "Memorial Descritivo do Condomínio", "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf", "type": "PDF"}]'::jsonb
) RETURNING id INTO dev_pedras_id;

-- ──────────────────────────────────────────────────────────────
-- 5. IMÓVEIS AVULSOS — 3 com proprietários
-- ──────────────────────────────────────────────────────────────

-- 5a. Cobertura Duplex — Jardins (proprietário: Marcos Oliveira)
INSERT INTO properties (
  title, slug, description, price,
  features, tags, status, visibility,
  created_by, org_id,
  images, address, neighborhood, city, cep,
  bairro_id, logradouro_id,
  categoria, tipo_negocio
) VALUES (
  'Cobertura Duplex — Jardins',
  'cobertura-duplex-jardins',
  'Obra-prima de 420m² privativos com 180m² de terraço e piscina aquecida com borda infinita. Concebida pelo arquiteto Felipe Assumpção, combina mármore Calacatta, madeira nogueira e automação Lutron em cada ambiente. Living triplo integrado com varanda gourmet, wine bar climatizado e home theater imersivo. Duas vagas duplas com elevador de veículos. O único cobertura disponível no condomínio.',
  4200000,
  '{"suites": 4, "banheiros": 5, "vagas": 4, "area_m2": 420, "area_total": 600, "andar": 15, "numero_apto": "152/154", "mobiliado": "Parcialmente", "nome_proprietario": "Marcos Oliveira", "contato_proprietario": "(11) 99876-5432"}'::jsonb,
  ARRAY['CB', 'AL', 'SC', 'VV', 'SG', 'SM'],
  'disponivel',
  'publico',
  admin_id,
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80'
  ],
  'Alameda Santos, 2340 — Apto 152',
  'Jardins',
  'São Paulo',
  '01419-002',
  bairro_jardins_id,
  logr_santos_id,
  'Cobertura',
  'Venda'
);

-- 5b. Casa em Condomínio — Moema (proprietária: Ana Beatriz Costa)
INSERT INTO properties (
  title, slug, description, price,
  features, tags, status, visibility,
  created_by, org_id,
  images, address, neighborhood, city, cep,
  bairro_id, logradouro_id,
  categoria, tipo_negocio
) VALUES (
  'Casa em Condomínio — Moema',
  'casa-condominio-moema',
  'Residência contemporânea de 380m² em condomínio de altíssimo padrão na Av. Ibirapuera. Projeto do escritório Studio Arthur Casas, com fachada de pedra Goiás e jardim vertical assinado. Quatro suítes, sendo uma master com closet duplo e banheira de imersão. Área de lazer privativa com piscina aquecida, deck de madeira cumaru e espaço gourmet coberto. A 500m do Parque Ibirapuera.',
  2800000,
  '{"suites": 4, "banheiros": 5, "vagas": 3, "area_m2": 380, "area_terreno": 650, "nome_proprietario": "Ana Beatriz Costa", "contato_proprietario": "(11) 98765-4321", "mobiliado": "Não"}'::jsonb,
  ARRAY['VV', 'AL', 'GR', 'SG', 'SC'],
  'disponivel',
  'publico',
  admin_id,
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80'
  ],
  'Avenida Ibirapuera, 3103',
  'Moema',
  'São Paulo',
  '04029-907',
  bairro_moema_id,
  logr_ibirapuera_id,
  'Casa em Condomínio',
  'Venda'
);

-- 5c. Apartamento Alto Padrão — Itaim Bibi (proprietário: Roberto Ferreira)
INSERT INTO properties (
  title, slug, description, price,
  features, tags, status, visibility,
  created_by, org_id,
  images, address, neighborhood, city, cep,
  bairro_id, logradouro_id,
  categoria, tipo_negocio
) VALUES (
  'Apartamento Alto Padrão — Itaim Bibi',
  'apartamento-alto-padrao-itaim',
  'Apartamento de 210m² no coração do Itaim Bibi, com vistas livres para a cidade. Reformado em 2023 com projeto de interiores assinado, cozinha gourmet Bulthaup, piso de porcelanato italiano 120x120 e automação completa. Dois andares de lazer exclusivos no edifício com spa, piscina olímpica coberta e academia de alto nível. A 3 minutos a pé do metrô Faria Lima.',
  1650000,
  '{"suites": 3, "banheiros": 4, "vagas": 2, "area_m2": 210, "andar": 12, "numero_apto": "124", "mobiliado": "Sim", "nome_proprietario": "Roberto Ferreira", "contato_proprietario": "(11) 97654-3210"}'::jsonb,
  ARRAY['AL', 'SC', 'FT', 'SG', 'SM', 'GR'],
  'disponivel',
  'publico',
  admin_id,
  NULL,
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80'
  ],
  'Rua Groenlândia, 456 — Apto 124',
  'Itaim Bibi',
  'São Paulo',
  '01440-050',
  bairro_itaim_id,
  logr_groenlandia_id,
  'Apartamento',
  'Venda'
);

-- ──────────────────────────────────────────────────────────────
-- 6. IMÓVEIS AVULSOS — 2 da Construtora Horizonte
-- ──────────────────────────────────────────────────────────────

-- 6a. Terreno Comercial — Itaim Bibi
INSERT INTO properties (
  title, slug, description, price,
  features, tags, status, visibility,
  created_by, org_id,
  images, address, neighborhood, city, cep,
  bairro_id,
  categoria, tipo_negocio
) VALUES (
  'Terreno Comercial — Itaim Bibi',
  'terreno-comercial-itaim-horizonte',
  'Terreno plano de 1.200m² em esquina estratégica no Itaim Bibi, a 200m da Av. Brigadeiro Faria Lima. Zoneamento ZM-3b com potencial construtivo de 4x (4.800m² de área computável). Ideal para incorporação residencial ou comercial de alto padrão. Documentação completa, sem ônus. Oportunidade única nesta microregião de altíssima valorização.',
  3500000,
  '{"area_terreno": 1200}'::jsonb,
  ARRAY['PN', 'VV'],
  'disponivel',
  'publico',
  admin_id,
  org_horizonte_id,
  ARRAY[
    'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80'
  ],
  'Rua Groenlândia, 1200 — Esquina',
  'Itaim Bibi',
  'São Paulo',
  '01440-050',
  bairro_itaim_id,
  'Terreno',
  'Venda'
);

-- 6b. Loja em Galeria — Jardins
INSERT INTO properties (
  title, slug, description, price,
  features, tags, status, visibility,
  created_by, org_id,
  images, address, neighborhood, city, cep,
  bairro_id, logradouro_id,
  categoria, tipo_negocio
) VALUES (
  'Loja em Galeria — Oscar Freire',
  'loja-galeria-oscar-freire-horizonte',
  'Loja de 120m² em galeria premium na Rua Oscar Freire, o endereço mais valorizado do varejo de luxo paulistano. Pé-direito de 4m, fachada de vidro temperado com 6m de frente, depósito de 30m² e 2 vagas incluídas. Fluxo de pedestres de alto poder aquisitivo. Ótima opção para marcas nacionais e internacionais de luxo. Atualmente desocupada e disponível para entrega imediata.',
  890000,
  '{"area_m2": 120, "vagas": 2}'::jsonb,
  ARRAY['PN', 'SG'],
  'disponivel',
  'publico',
  admin_id,
  org_horizonte_id,
  ARRAY[
    'https://images.unsplash.com/photo-1551882547-ff40c599fb74?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=80'
  ],
  'Rua Oscar Freire, 900 — Loja 12',
  'Jardins',
  'São Paulo',
  '01426-000',
  bairro_jardins_id,
  logr_oscar_id,
  'Loja',
  'Venda'
);

-- ──────────────────────────────────────────────────────────────
-- 7. EDIFÍCIO LUMIÈRE — 8 Apartamentos
-- ──────────────────────────────────────────────────────────────
-- Tipologia: 3 suítes, 178m², 3 vagas. 4 disponível, 2 reservado, 2 vendido.

INSERT INTO properties (title, slug, description, price, features, tags, status, visibility, created_by, org_id, development_id, images, neighborhood, city, categoria, tipo_negocio) VALUES
(
  'Lumière — 301',
  'lumiere-301',
  'Apartamento no 3º andar com living amplo voltado para o jardim interno. Cozinha integrada com ilha em mármore Calacatta, suíte master com closet e banheira de imersão. Varanda de 28m² com churrasqueira a gás e pergolado de madeira cumaru. Piso aquecido em todos os ambientes. Smart home Lutron completo.',
  3200000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 3, "numero_apto": "301", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG'],
  'vendido', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 401',
  'lumiere-401',
  'Apartamento no 4º andar com vistas livres para a Rua Oscar Freire. Ambientes amplos com pé-direito de 3,2m, janelas do piso ao teto e acabamentos em mármore importado. Suíte master com banheira freestanding e dois chuveiros. Depósito privativo de 8m² incluído.',
  3280000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 4, "numero_apto": "401", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG'],
  'vendido', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 501',
  'lumiere-501',
  'Apartamento no 5º andar em localização privilegiada no edifício. Suíte master com vista direta para o jardim dos Jardins, closet com iluminação embutida e banheiro com aquecedor a gás de demanda. Living e jantar integrados com 62m² de área social. Cozinha conceito aberto com todos os eletrodomésticos Miele incluídos.',
  3350000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 5, "numero_apto": "501", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG'],
  'reserva', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 601',
  'lumiere-601',
  'Apartamento no 6º andar com a melhor relação custo-benefício do empreendimento. Varanda com vista desafogada para o skyline dos Jardins, living integrado ao terraço por portas de vidro retráteis. Suíte master com closet em marcenaria sob medida. Banheiro social com porcelanato italiano e torneiras Dornbracht.',
  3420000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 6, "numero_apto": "601", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG'],
  'reserva', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 701',
  'lumiere-701',
  'Apartamento no 7º andar — o primeiro pavimento com vista privilegiada para o topo das árvores dos Jardins. Living de 65m² com pé-direito duplo na área de jantar, criando um ambiente de proporções monumentais. Adega climatizada embutida para 180 garrafas. Banheiro master com sauna seca privativa.',
  3520000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 7, "numero_apto": "701", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG', 'GR'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 801',
  'lumiere-801',
  'Apartamento no 8º andar com panorâmica 180° sobre os telhados dos Jardins. Projeto de interiores personalizado entregue junto com o imóvel: revestimentos exclusivos de pedra natural, marcenaria lacada de alto brilho e iluminação cênica projetada. Varanda tripla com jardim vertical externo. Uma das unidades mais concorridas do empreendimento.',
  3650000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 8, "numero_apto": "801", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG', 'VV'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 901',
  'lumiere-901',
  'Apartamento no 9º andar com vista desimpedida para a cidade. Os Jardins se abrem completamente pela varanda panorâmica de 32m². Cozinha conceito com ilha de 3m em mármore Nero Marquina, total integração com a área de refeições e acesso direto ao terraço. Suíte master com ofurô e duche fria.',
  3780000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 9, "numero_apto": "901", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG', 'VV'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
),
(
  'Lumière — 1001 (Último Andar)',
  'lumiere-1001',
  'O auge do Edifício Lumière. Último andar com vista 360° sobre São Paulo, pé-direito de 3,6m (30cm acima dos demais pavimentos) e varanda panorâmica que envolve todo o apartamento em 52m². Acabamentos exclusivos: mármore Paonazzo nas paredes da suíte master, painéis de madeira pau-marfim no living e adega climatizada para 300 garrafas. A última unidade disponível nos andares superiores.',
  3920000,
  '{"suites": 3, "banheiros": 4, "vagas": 3, "area_m2": 178, "andar": 10, "numero_apto": "1001", "torre": "Única"}'::jsonb,
  ARRAY['AL', 'SC', 'SG', 'SM', 'VG', 'VV', 'PN'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_lumiere_id,
  ARRAY['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80'],
  'Jardins', 'São Paulo', 'Apartamento', 'Venda'
);

-- ──────────────────────────────────────────────────────────────
-- 8. CONDOMÍNIO ALTO DAS PEDRAS — 12 Lotes
-- Quadra A (4 lotes 300–360m²), B (4 lotes 400–480m²), C (4 lotes 500–600m²)
-- Status: 5 disponível, 4 vendido, 3 reservado
-- ──────────────────────────────────────────────────────────────

INSERT INTO properties (title, slug, description, price, features, tags, status, visibility, created_by, org_id, development_id, images, neighborhood, city, categoria, tipo_negocio) VALUES

-- Quadra A
(
  'Alto das Pedras — Quadra A, Lote 1',
  'alto-das-pedras-a1',
  'Lote plano de 300m² na entrada da Quadra A, com frente de 15m voltada para a área verde do condomínio. Topografia favorável para construção sem necessidade de contenção. Infraestrutura completa: água, esgoto, energia, fibra ótica e drenagem já implantados. Projeto de construção pode ser adquirido separadamente pela construtora.',
  280000,
  '{"area_terreno": 300, "quadra": "A", "lote": "1"}'::jsonb,
  ARRAY['VV', 'SG'],
  'vendido', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra A, Lote 2',
  'alto-das-pedras-a2',
  'Lote de 320m² com frente de 16m para a via principal da Quadra A. Localização privilegiada a 80m do clube do condomínio com piscina, quadras e salão gourmet. Terreno levemente inclinado no fundo, ideal para projeto com mezanino e garagem embutida. Vista parcial para o lago artificial.',
  295000,
  '{"area_terreno": 320, "quadra": "A", "lote": "2"}'::jsonb,
  ARRAY['VV', 'SG'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra A, Lote 3',
  'alto-das-pedras-a3',
  'Lote de 340m² em posição central na Quadra A, com frente de 17m. Cercado por vegetação nativa de todos os lados, proporcionando privacidade excepcional. Terreno plano em 100% da área útil — sem necessidade de movimentação de terra. Área de preservação permanente no fundo oferece vista verde perpétua.',
  310000,
  '{"area_terreno": 340, "quadra": "A", "lote": "3"}'::jsonb,
  ARRAY['VV', 'SG'],
  'vendido', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra A, Lote 4',
  'alto-das-pedras-a4',
  'Lote de 360m² na extremidade da Quadra A, com duas frentes — 18m para a via principal e 8m para a viela de acesso lateral. Ampla flexibilidade de projeto. O maior lote da Quadra A, com topografia plana e sombreamento natural pelas árvores nativas do entorno. Próximo à trilha ecológica do condomínio.',
  328000,
  '{"area_terreno": 360, "quadra": "A", "lote": "4"}'::jsonb,
  ARRAY['VV', 'SG'],
  'reserva', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),

-- Quadra B
(
  'Alto das Pedras — Quadra B, Lote 1',
  'alto-das-pedras-b1',
  'Lote de 400m² na entrada da Quadra B — a mais valorizada do condomínio por sua proximidade ao lago artificial e às trilhas ecológicas. Frente de 20m. Terreno plano com leve aclive nos últimos 5m, perfeito para criação de deck sobre a natureza. Vista direta para o lago a partir do fundo do lote.',
  370000,
  '{"area_terreno": 400, "quadra": "B", "lote": "1"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra B, Lote 2',
  'alto-das-pedras-b2',
  'Lote de 430m² com vista privilegiada para o lago artificial do condomínio. Frente de 20m. Posicionamento ideal para aproveitamento da orientação solar — sol da manhã na fachada principal e tarde sombreada. Um dos lotes mais procurados do empreendimento. Entrega com plantio de 3 árvores nativas incluído no preço.',
  395000,
  '{"area_terreno": 430, "quadra": "B", "lote": "2"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'vendido', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra B, Lote 3',
  'alto-das-pedras-b3',
  'Lote de 455m² em posição central da Quadra B, contíguo à área verde de convívio. Frente de 22m com calçada paisagística inclusa. Topografia 100% plana. O único lote da Quadra B com acesso direto à trilha ecológica sem passar por via interna. Arborização adulta no limite do terreno garante privacidade imediata.',
  415000,
  '{"area_terreno": 455, "quadra": "B", "lote": "3"}'::jsonb,
  ARRAY['VV', 'SG'],
  'reserva', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra B, Lote 4',
  'alto-das-pedras-b4',
  'Lote de 480m² — o maior da Quadra B — com frente dupla (24m principal + 12m lateral). Posição de esquina garante dois acessos independentes e máxima ventilação cruzada. Ideal para projetos com piscina de borda infinita voltada para a mata. Limita-se com área de preservação permanente em dois lados.',
  440000,
  '{"area_terreno": 480, "quadra": "B", "lote": "4"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),

-- Quadra C
(
  'Alto das Pedras — Quadra C, Lote 1',
  'alto-das-pedras-c1',
  'Lote de 500m² na Quadra C, a mais privativa e silenciosa do condomínio. Frente de 22m. Posição no ponto mais alto do terreno garante vista panorâmica sobre toda a reserva ambiental. Vento cruzado constante — ideal para construções bioclimáticas. A 5 minutos de caminhada da portaria principal.',
  460000,
  '{"area_terreno": 500, "quadra": "C", "lote": "1"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'vendido', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra C, Lote 2',
  'alto-das-pedras-c2',
  'Lote de 530m² com 25m de frente para a via principal da Quadra C. A altitude do terreno (1.050m) proporciona temperaturas 4–5°C mais amenas que o centro de São Paulo. Vista permanente para a mata atlântica secundária que circunda o condomínio. Projeto de casa sustentável disponível sob consulta com a construtora.',
  485000,
  '{"area_terreno": 530, "quadra": "C", "lote": "2"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra C, Lote 3',
  'alto-das-pedras-c3',
  'Lote de 560m² com vista frontal para o lago artificial do condomínio — o único da Quadra C nesta posição. Microclima excepcional com brisa constante do lago. Topografia levemente inclinada no sentido do lago, ideal para aproveitamento da vista em múltiplos níveis. Arborização adulta nas divisas garante privacidade imediata.',
  500000,
  '{"area_terreno": 560, "quadra": "C", "lote": "3"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'reserva', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
),
(
  'Alto das Pedras — Quadra C, Lote 4',
  'alto-das-pedras-c4',
  'O joia da coroa: lote de 600m² na extremidade da Quadra C, limítrofe com a área de preservação ambiental permanente em dois lados. Frente de 24m. O maior e mais exclusivo terreno do condomínio, com vista panorâmica 270° para a reserva. Silêncio absoluto — sem vizinhos nas divisas laterais e nos fundos. Oportunidade única e irreproduzível.',
  520000,
  '{"area_terreno": 600, "quadra": "C", "lote": "4"}'::jsonb,
  ARRAY['VV', 'SG', 'PN'],
  'disponivel', 'publico', admin_id, org_horizonte_id, dev_pedras_id,
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80'],
  'Alto da Boa Vista', 'São Paulo', 'Terreno', 'Venda'
);

-- ──────────────────────────────────────────────────────────────
-- RESUMO
-- ──────────────────────────────────────────────────────────────
RAISE NOTICE '✓ Construtora Horizonte criada (id: %)', org_horizonte_id;
RAISE NOTICE '✓ 4 bairros criados: Jardins, Moema, Itaim Bibi, Alto da Boa Vista';
RAISE NOTICE '✓ 4 logradouros criados';
RAISE NOTICE '✓ Edifício Lumière criado (id: %)', dev_lumiere_id;
RAISE NOTICE '✓ Condomínio Alto das Pedras criado (id: %)', dev_pedras_id;
RAISE NOTICE '✓ 3 imóveis avulsos com proprietários';
RAISE NOTICE '✓ 2 imóveis avulsos da Horizonte';
RAISE NOTICE '✓ 8 apartamentos Lumière (4 disp, 2 res, 2 vend)';
RAISE NOTICE '✓ 12 lotes Alto das Pedras (5 disp, 3 res, 4 vend)';
RAISE NOTICE '';
RAISE NOTICE 'Minisite da construtora: /construtora/horizonte';
RAISE NOTICE 'Lumière: /lancamento/%', dev_lumiere_id;
RAISE NOTICE 'Alto das Pedras: /lancamento/%', dev_pedras_id;

END $$;
