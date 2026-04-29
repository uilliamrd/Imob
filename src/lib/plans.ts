import type { OrgPlan, OrgType, UserRole } from "@/types/database"

export interface PlanLimits {
  max_properties: number | null     // null = ilimitado
  max_developments: number | null
  max_corretores: number | null
  max_highlights: number            // destaques de imóveis inclusos no plano
  max_super_highlights: number      // super destaques inclusos no plano
  max_section_highlights: number | null // destaque da org na seção portal (0, 1, ou null=ilimitado)
  max_users: number | null          // usuários por org
  can_view_leads: boolean
  can_view_market_data: boolean
  has_minisite: boolean
  can_access_listings: boolean
  has_ref_links: boolean
}

export type PlanEntityType = OrgType | 'corretor'

// ── Limites por entidade e plano ─────────────────────────────────────────────

const LIMITS: Record<PlanEntityType, Record<OrgPlan, PlanLimits>> = {
  construtora: {
    free:       { max_properties: 20,   max_developments: 1,    max_corretores: null, max_highlights: 0,  max_super_highlights: 0, max_section_highlights: 0,    max_users: 2, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
    starter:    { max_properties: 60,   max_developments: 2,    max_corretores: null, max_highlights: 2,  max_super_highlights: 1, max_section_highlights: 0,    max_users: 2, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
    pro:        { max_properties: 150,  max_developments: 5,    max_corretores: null, max_highlights: 5,  max_super_highlights: 3, max_section_highlights: 1,    max_users: 2, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
    enterprise: { max_properties: null, max_developments: null, max_corretores: null, max_highlights: 10, max_super_highlights: 5, max_section_highlights: null, max_users: 2, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
  },
  imobiliaria: {
    // max_properties e max_highlights são POR CORRETOR
    free:       { max_properties: 15,   max_developments: 0,    max_corretores: 5,    max_highlights: 1,  max_super_highlights: 0, max_section_highlights: 0, max_users: null, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
    starter:    { max_properties: 50,   max_developments: 0,    max_corretores: 15,   max_highlights: 3,  max_super_highlights: 1, max_section_highlights: 0, max_users: null, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
    pro:        { max_properties: 150,  max_developments: 0,    max_corretores: 25,   max_highlights: 5,  max_super_highlights: 3, max_section_highlights: 1, max_users: null, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
    enterprise: { max_properties: null, max_developments: null, max_corretores: null, max_highlights: 10, max_super_highlights: 5, max_section_highlights: 1, max_users: null, can_view_leads: true, can_view_market_data: true, has_minisite: true, can_access_listings: true, has_ref_links: true },
  },
  corretor: {
    free:       { max_properties: 5,   max_developments: 0,  max_corretores: null, max_highlights: 0, max_super_highlights: 0, max_section_highlights: 0, max_users: null, can_view_leads: false, can_view_market_data: false, has_minisite: false, can_access_listings: false, has_ref_links: false },
    starter:    { max_properties: 15,  max_developments: 1,  max_corretores: null, max_highlights: 1, max_super_highlights: 0, max_section_highlights: 0, max_users: null, can_view_leads: true,  can_view_market_data: false, has_minisite: true,  can_access_listings: true,  has_ref_links: true  },
    pro:        { max_properties: 50,  max_developments: 1,  max_corretores: null, max_highlights: 3, max_super_highlights: 1, max_section_highlights: 0, max_users: null, can_view_leads: true,  can_view_market_data: true,  has_minisite: true,  can_access_listings: true,  has_ref_links: true  },
    enterprise: { max_properties: 150, max_developments: 10, max_corretores: null, max_highlights: 5, max_super_highlights: 3, max_section_highlights: 0, max_users: null, can_view_leads: true,  can_view_market_data: true,  has_minisite: true,  can_access_listings: true,  has_ref_links: true  },
  },
}

// ── Nomes comerciais dos planos ──────────────────────────────────────────────

const NAMES: Record<PlanEntityType, Record<OrgPlan, string>> = {
  construtora: {
    free:       'Lançamento',
    starter:    'Expansão',
    pro:        'Escala',
    enterprise: 'Incorporação Total',
  },
  imobiliaria: {
    free:       'Equipe Start',
    starter:    'Equipe Pro',
    pro:        'Equipe Performance',
    enterprise: 'Equipe Dominante',
  },
  corretor: {
    free:       'Start',
    starter:    'Impulso',
    pro:        'Acelerador',
    enterprise: 'Dominância',
  },
}

// ── Preços mensais e de implantação ──────────────────────────────────────────

export const PLAN_PRICES: Record<PlanEntityType, Record<OrgPlan, {
  implantacao: number
  mensal: number
  landing_page_adicional?: number
}>> = {
  construtora: {
    free:       { implantacao: 1560, mensal: 495,  landing_page_adicional: 700 },
    starter:    { implantacao: 1890, mensal: 680,  landing_page_adicional: 700 },
    pro:        { implantacao: 2380, mensal: 945,  landing_page_adicional: 700 },
    enterprise: { implantacao: 3990, mensal: 1480, landing_page_adicional: 700 },
  },
  imobiliaria: {
    free:       { implantacao: 540,  mensal: 390  },
    starter:    { implantacao: 1200, mensal: 980  },
    pro:        { implantacao: 1850, mensal: 1490 },
    enterprise: { implantacao: 2400, mensal: 1680 },
  },
  corretor: {
    free:       { implantacao: 0,   mensal: 0   },
    starter:    { implantacao: 120, mensal: 97  },
    pro:        { implantacao: 120, mensal: 120 },
    enterprise: { implantacao: 120, mensal: 199 },
  },
}

// ── Destaques adicionais (upsell avulso) ─────────────────────────────────────
//
// Regras:
// - Super destaque aparece acima de todos os demais
// - Destaque tem prioridade sobre boost
// - Respeitam o limite de destaques do plano (max_highlights / max_super_highlights)
// - São complementares ao boost — não se substituem

export type HighlightUpsellId =
  | 'destaque_simples'
  | 'destaque_topo'
  | 'super_destaque'
  | 'destaque_regional'

export interface HighlightUpsell {
  id: HighlightUpsellId
  nome: string
  descricao: string
  preco: number
  // Nível de prioridade para ordenação: maior = mais visível
  prioridade: number
}

export const HIGHLIGHT_UPSELLS: Record<HighlightUpsellId, HighlightUpsell> = {
  destaque_simples: {
    id: 'destaque_simples',
    nome: 'Destaque',
    descricao: 'Aparece acima dos imóveis comuns',
    preco: 29,
    prioridade: 1,
  },
  destaque_regional: {
    id: 'destaque_regional',
    nome: 'Destaque Regional',
    descricao: 'Aparece primeiro na cidade/região do cliente',
    preco: 59,
    prioridade: 2,
  },
  destaque_topo: {
    id: 'destaque_topo',
    nome: 'Topo da Vitrine',
    descricao: 'Exibição prioritária na página inicial',
    preco: 79,
    prioridade: 3,
  },
  super_destaque: {
    id: 'super_destaque',
    nome: 'Super Destaque',
    descricao: 'Máxima visibilidade com selo premium',
    preco: 149,
    prioridade: 4,
  },
}

// ── Boosts de anúncio (impulsionamento por duração) ──────────────────────────
//
// Regras:
// - Pode ser aplicado a qualquer imóvel ativo
// - Não substitui destaque — são complementares (ambos podem estar ativos)
// - Usuários podem comprar múltiplos boosts sequenciais ou sobrepostos

export type BoostId =
  | 'boost_3_dias'
  | 'boost_7_dias'
  | 'boost_15_dias'
  | 'boost_30_dias'

export interface BoostOption {
  id: BoostId
  nome: string
  duracao_dias: number
  preco: number
}

export const BOOST_OPTIONS: Record<BoostId, BoostOption> = {
  boost_3_dias: {
    id: 'boost_3_dias',
    nome: 'Impulso Rápido',
    duracao_dias: 3,
    preco: 19,
  },
  boost_7_dias: {
    id: 'boost_7_dias',
    nome: 'Impulso Padrão',
    duracao_dias: 7,
    preco: 39,
  },
  boost_15_dias: {
    id: 'boost_15_dias',
    nome: 'Impulso Forte',
    duracao_dias: 15,
    preco: 69,
  },
  boost_30_dias: {
    id: 'boost_30_dias',
    nome: 'Impulso Máximo',
    duracao_dias: 30,
    preco: 119,
  },
}

// ── Tabela de funcionalidades (página de upgrade) ────────────────────────────
// Ordem das colunas: [free, starter, pro, enterprise]
// null = ilimitado, false = não incluso, true = incluso, number = quantidade

export type FeatureVal = boolean | number | null
export type PlanFeatureRow = { label: string; values: [FeatureVal, FeatureVal, FeatureVal, FeatureVal] }

export const PLAN_FEATURES: Record<PlanEntityType, PlanFeatureRow[]> = {
  construtora: [
    { label: "Imóveis cadastrados",                values: [20,    60,    150,   null ] },
    { label: "Lançamentos / landing pages",        values: [1,     2,     5,     null ] },
    { label: "Destaques no portal",                values: [0,     2,     5,     10   ] },
    { label: "Super destaques no portal",          values: [0,     1,     3,     5    ] },
    { label: "Destaque na seção Construtoras",     values: [false, false, true,  true ] },
    { label: "Número de usuários",                 values: [2,     2,     2,     2    ] },
    { label: "Minisite próprio",                   values: [true,  true,  true,  true ] },
    { label: "Apresentação de portfólio",          values: [true,  true,  true,  true ] },
    { label: "PDF do empreendimento para download",values: [true,  true,  true,  true ] },
    { label: "Análise de informações de mercado",  values: [true,  true,  true,  true ] },
    { label: "Análise de leads",                   values: [true,  true,  true,  true ] },
    { label: "Análise de corretores engajados",    values: [true,  true,  true,  true ] },
    { label: "Controle de disponibilidade",        values: [true,  true,  true,  true ] },
    { label: "Atualização automática do estoque",  values: [true,  true,  true,  true ] },
  ],
  imobiliaria: [
    { label: "Corretores na equipe",                  values: [5,     15,    25,    null ] },
    { label: "Imóveis na vitrine (por corretor)",      values: [15,    50,    150,   null ] },
    { label: "Destaques (por corretor)",               values: [1,     3,     5,     10   ] },
    { label: "Super destaques (por corretor)",         values: [0,     1,     3,     5    ] },
    { label: "Destaque na seção Imobiliárias",         values: [false, false, true,  true ] },
    { label: "Cadastro com controle de visibilidade",  values: [true,  true,  true,  true ] },
    { label: "Acesso aos anúncios das construtoras",   values: [true,  true,  true,  true ] },
    { label: "Acesso aos agenciamentos do sistema",    values: [true,  true,  true,  true ] },
    { label: "Acesso aos anúncios de terceiros",       values: [true,  true,  true,  true ] },
    { label: "Minisite próprio",                       values: [true,  true,  true,  true ] },
    { label: "Marcação de cliente por link",           values: [true,  true,  true,  true ] },
    { label: "Sistema Antipelota",                     values: [true,  true,  true,  true ] },
    { label: "CRM de leads",                           values: [true,  true,  true,  true ] },
    { label: "Rodízio de leads",                       values: [true,  true,  true,  true ] },
    { label: "Análise de informações de mercado",      values: [true,  true,  true,  true ] },
    { label: "Análise de leads",                       values: [true,  true,  true,  true ] },
    { label: "Análise de atividades da equipe",        values: [true,  true,  true,  true ] },
  ],
  corretor: [
    { label: "Imóveis na vitrine",                    values: [5,     15,    50,    150  ] },
    { label: "Destaques de imóveis",                  values: [0,     1,     3,     5    ] },
    { label: "Super destaques de imóveis",            values: [0,     0,     1,     3    ] },
    { label: "Cadastro com controle de visibilidade", values: [true,  true,  true,  true ] },
    { label: "Acesso aos agenciamentos do sistema",   values: [false, true,  true,  true ] },
    { label: "Acesso aos anúncios de terceiros",      values: [false, true,  true,  true ] },
    { label: "Minisite próprio",                      values: [false, true,  true,  true ] },
    { label: "Marcação de cliente por link",          values: [false, true,  true,  true ] },
    { label: "Sistema Antipelota",                    values: [false, false, true,  true ] },
    { label: "CRM de leads",                          values: [false, true,  true,  true ] },
    { label: "Rodízio de leads",                      values: [false, true,  true,  true ] },
    { label: "Análise de informações de mercado",     values: [false, false, true,  true ] },
    { label: "Análise de leads",                      values: [false, true,  true,  true ] },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getPlanLimits(entityType: PlanEntityType, plan: OrgPlan): PlanLimits {
  return LIMITS[entityType][plan]
}

export function getPlanName(entityType: PlanEntityType, plan: OrgPlan): string {
  return NAMES[entityType][plan]
}

export function resolveEntityType(role: UserRole | string, orgType?: OrgType | null): PlanEntityType {
  if (role === 'construtora' || orgType === 'construtora') return 'construtora'
  if (role === 'imobiliaria' || orgType === 'imobiliaria') return 'imobiliaria'
  return 'corretor'
}

/** Retorna todos os destaques adicionais ordenados por prioridade crescente */
export function getHighlightUpsellsOrdered(): HighlightUpsell[] {
  return Object.values(HIGHLIGHT_UPSELLS).sort((a, b) => a.prioridade - b.prioridade)
}

/** Retorna todas as opções de boost ordenadas por duração crescente */
export function getBoostOptionsOrdered(): BoostOption[] {
  return Object.values(BOOST_OPTIONS).sort((a, b) => a.duracao_dias - b.duracao_dias)
}
