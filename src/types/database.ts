export type UserRole = 'admin' | 'imobiliaria' | 'corretor' | 'construtora'
export type OrgType = 'imobiliaria' | 'construtora'
export type PropertyStatus = 'disponivel' | 'vendido' | 'reserva'
export type PropertyVisibility = 'publico' | 'equipe' | 'privado'
export type LeadStatus = 'novo' | 'em_contato' | 'convertido' | 'perdido'
export type LeadSource = 'imovel' | 'minisite' | 'selecao' | 'manual'

export interface Organization {
  id: string
  name: string
  slug: string | null
  type: OrgType
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
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  whatsapp: string | null
  creci: string | null
  organization_id: string | null
  is_active: boolean
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
  created_at: string
}

export interface PropertyFeatures {
  suites?: number
  quartos?: number
  dormitorios?: number
  dependencias?: number
  vagas?: number
  numero_vaga?: string
  area_m2?: number
  banheiros?: number
  andar?: number
  numero_apto?: string
  torre?: string
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
