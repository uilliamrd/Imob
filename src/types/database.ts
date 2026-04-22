export type UserRole = 'admin' | 'imobiliaria' | 'corretor' | 'construtora' | 'secretaria'
export type OrgType = 'imobiliaria' | 'construtora'
export type PropertyStatus = 'disponivel' | 'vendido' | 'reserva'
export type PropertyVisibility = 'publico' | 'corretores' | 'equipe' | 'privado'
export type LeadStatus = 'novo' | 'em_contato' | 'convertido' | 'perdido'
export type LeadSource = 'imovel' | 'minisite' | 'selecao' | 'manual'

export type OrgPlan = 'free' | 'starter' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'expired'

export interface Organization {
  id: string
  name: string
  slug: string | null
  type: OrgType
  plan: OrgPlan
  logo: string | null
  brand_colors: { primary?: string; secondary?: string; accent?: string } | null
  portfolio_desc: string | null
  about_text: string | null
  about_image: string | null
  hero_tagline: string | null
  hero_image: string | null
  has_lancamentos: boolean
  website: string | null
  whatsapp: string | null
  created_at: string
  subscription_status: SubscriptionStatus
  subscription_expires_at: string | null
  payment_due_date: string | null
  highlight_quota: number | null
  super_highlight_quota: number | null
  is_section_highlighted: boolean
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  plan: OrgPlan
  bio: string | null
  whatsapp: string | null
  creci: string | null
  organization_id: string | null
  is_active: boolean
  slug: string | null
  last_lead_at: string | null
  subscription_status: SubscriptionStatus
  subscription_expires_at: string | null
  payment_due_date: string | null
  organization?: Organization
}

export interface Development {
  id: string
  name: string
  address: string | null
  neighborhood: string | null
  city: string | null
  org_id: string | null
  is_lancamento: boolean
  is_delivered: boolean
  description: string | null
  cover_image: string | null
  images: string[]
  custom_page_html: string | null
  custom_page_type: 'html' | 'json' | null
  documents: { name: string; url: string; type: string }[]
  created_at: string
}

export interface PropertyFeatures {
  suites?: number
  quartos?: number
  dormitorios?: number
  dependencias?: number
  livings?: number
  vagas?: number
  numero_vaga?: string
  tipo_vaga?: string
  situacao_vaga?: string
  area_m2?: number
  area_total?: number
  area_terreno?: number
  banheiros?: number
  andar?: number
  numero_apto?: string
  torre?: string
  quadra?: string
  lote?: string
  numero?: string
  referencia?: string
  depositos?: number
  numero_depositos?: string
  agenciador?: string
  chaves?: string
  mobiliado?: string
  nome_proprietario?: string
  contato_proprietario?: string
  [key: string]: number | string | undefined
}

export interface Property {
  id: string
  code?: number
  title: string
  description: string | null
  price: number
  features: PropertyFeatures
  tags: string[]
  status: PropertyStatus
  visibility: PropertyVisibility
  created_by: string
  org_id: string | null
  development_id: string | null
  images: string[]
  video_url: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  cep: string | null
  categoria: string | null
  tipo_negocio: string
  bairro_id: string | null
  logradouro_id: string | null
  slug: string
  created_at: string
  updated_at: string
  organization?: Organization
  creator?: Profile
  development?: Development
}

export interface PropertyListing {
  id: string
  property_id: string
  org_id: string | null
  user_id: string | null
  created_at: string
  property?: Property
}

export interface Lead {
  id: string
  name: string
  phone: string
  property_id: string | null
  property_slug: string | null
  ref_id: string | null
  org_id: string | null
  source: LeadSource
  status: LeadStatus
  notes: string | null
  created_at: string
  cidade_cliente: string | null
  perfil_imovel: string | null
  preco_min: number | null
  preco_max: number | null
  tipo_negociacao: string | null
  property?: Pick<Property, 'id' | 'title' | 'slug'>
  corretor?: Pick<Profile, 'id' | 'full_name'>
}

export interface Selection {
  id: string
  title: string
  corretor_id: string
  org_id: string | null
  is_public: boolean
  views: number
  created_at: string
  corretor?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'whatsapp' | 'creci'>
  items?: SelectionItem[]
}

export interface SelectionItem {
  id: string
  selection_id: string
  property_id: string
  sort_order: number
  created_at: string
  property?: Property
}

export interface LeadConflict {
  id: string
  phone: string
  original_lead_id: string
  original_corretor_id: string
  conflict_lead_id: string
  acknowledged: boolean
  created_at: string
}

export interface IngestLog {
  id: string
  status: 'success' | 'error'
  message: string
  payload_summary: string | null
  rows_processed: number
  rows_created: number
  rows_updated: number
  rows_errored: number
  created_at: string
}

export type AdTier = 'destaque' | 'super_destaque'
export type AdStatus = 'pending' | 'active' | 'paused' | 'expired'

export interface PropertyAd {
  id: string
  property_id: string
  org_id: string | null
  tier: AdTier
  status: AdStatus
  starts_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
  notes: string | null
  property?: Property & { organization?: Pick<Organization, 'id' | 'name' | 'slug' | 'type' | 'logo' | 'brand_colors'> }
}

export interface IngestPropertyPayload {
  slug: string
  title: string
  description?: string
  price: number
  features: PropertyFeatures
  tags?: string[]
  status?: PropertyStatus
  visibility?: PropertyVisibility
  org_id?: string
  development_id?: string
  images?: string[]
  video_url?: string
  address?: string
  neighborhood?: string
  city?: string
}

// ── Destaques avulsos (upsell) ────────────────────────────────────────────────

export type HighlightUpsellId =
  | 'destaque_simples'
  | 'destaque_regional'
  | 'destaque_topo'
  | 'super_destaque'

export type HighlightStatus = 'ativo' | 'expirado' | 'cancelado'

export interface PropertyHighlight {
  id: string
  property_id: string
  user_id: string | null
  org_id: string | null
  highlight: HighlightUpsellId
  prioridade: number
  status: HighlightStatus
  expires_at: string | null
  paid_amount: number | null
  created_at: string
  property?: Pick<Property, 'id' | 'title' | 'slug'>
}

// ── Boosts de anúncio ─────────────────────────────────────────────────────────

export type BoostId =
  | 'boost_3_dias'
  | 'boost_7_dias'
  | 'boost_15_dias'
  | 'boost_30_dias'

export type BoostStatus = 'ativo' | 'expirado' | 'cancelado'

export interface PropertyBoost {
  id: string
  property_id: string
  user_id: string | null
  org_id: string | null
  boost: BoostId
  duracao_dias: number
  status: BoostStatus
  starts_at: string
  expires_at: string
  paid_amount: number | null
  created_at: string
  property?: Pick<Property, 'id' | 'title' | 'slug'>
}

// ── Pagamentos ────────────────────────────────────────────────────────────────

export type PaymentRecordType = 'implantacao' | 'mensal' | 'landing_page' | 'outro'
export type PaymentRecordStatus = 'pendente' | 'pago' | 'cancelado'

export interface PaymentRecord {
  id: string
  org_id: string | null
  profile_id: string | null
  amount: number
  type: PaymentRecordType
  status: PaymentRecordStatus
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  organization?: Pick<Organization, 'id' | 'name' | 'type' | 'plan'>
  profile?: Pick<Profile, 'id' | 'full_name' | 'role'>
}
