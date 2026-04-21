import type { OrgPlan, OrgType, UserRole } from "@/types/database"

export interface PlanLimits {
  max_properties: number | null     // null = ilimitado
  max_developments: number | null
  max_corretores: number | null
  max_highlights: number            // destaques de imóveis
  max_super_highlights: number      // super destaques
  max_section_highlights: number | null // destaque da org na seção portal (0, 1, ou null=ilimitado)
  max_users: number | null          // usuários por org
  can_view_leads: boolean
  can_view_market_data: boolean
}

export type PlanEntityType = OrgType | 'corretor'

const LIMITS: Record<PlanEntityType, Record<OrgPlan, PlanLimits>> = {
  construtora: {
    free:       { max_properties: 20,   max_developments: 1,    max_corretores: null, max_highlights: 0,  max_super_highlights: 0, max_section_highlights: 0,    max_users: 2, can_view_leads: true, can_view_market_data: true },
    starter:    { max_properties: 60,   max_developments: 2,    max_corretores: null, max_highlights: 2,  max_super_highlights: 1, max_section_highlights: 0,    max_users: 2, can_view_leads: true, can_view_market_data: true },
    pro:        { max_properties: 150,  max_developments: 2,    max_corretores: null, max_highlights: 5,  max_super_highlights: 3, max_section_highlights: 1,    max_users: 2, can_view_leads: true, can_view_market_data: true },
    enterprise: { max_properties: null, max_developments: 5,    max_corretores: null, max_highlights: 10, max_super_highlights: 5, max_section_highlights: null, max_users: 2, can_view_leads: true, can_view_market_data: true },
  },
  imobiliaria: {
    // max_properties e max_highlights são POR CORRETOR
    free:       { max_properties: 15,   max_developments: 0,    max_corretores: 5,    max_highlights: 1,  max_super_highlights: 0, max_section_highlights: 0, max_users: null, can_view_leads: true, can_view_market_data: true },
    starter:    { max_properties: 50,   max_developments: 0,    max_corretores: 15,   max_highlights: 3,  max_super_highlights: 1, max_section_highlights: 0, max_users: null, can_view_leads: true, can_view_market_data: true },
    pro:        { max_properties: 150,  max_developments: 0,    max_corretores: 25,   max_highlights: 5,  max_super_highlights: 3, max_section_highlights: 1, max_users: null, can_view_leads: true, can_view_market_data: true },
    enterprise: { max_properties: null, max_developments: null, max_corretores: null, max_highlights: 10, max_super_highlights: 5, max_section_highlights: 1, max_users: null, can_view_leads: true, can_view_market_data: true },
  },
  corretor: {
    free:       { max_properties: 5,   max_developments: 0, max_corretores: null, max_highlights: 0, max_super_highlights: 0, max_section_highlights: 0, max_users: null, can_view_leads: false, can_view_market_data: false },
    starter:    { max_properties: 15,  max_developments: 1, max_corretores: null, max_highlights: 0, max_super_highlights: 1, max_section_highlights: 0, max_users: null, can_view_leads: true,  can_view_market_data: false },
    pro:        { max_properties: 50,  max_developments: 1, max_corretores: null, max_highlights: 3, max_super_highlights: 1, max_section_highlights: 0, max_users: null, can_view_leads: true,  can_view_market_data: true },
    enterprise: { max_properties: 150, max_developments: 10,max_corretores: null, max_highlights: 5, max_super_highlights: 3, max_section_highlights: 0, max_users: null, can_view_leads: true,  can_view_market_data: true },
  },
}

const NAMES: Record<PlanEntityType, Record<OrgPlan, string>> = {
  construtora: { free: 'Start-Up',  starter: 'Builder Pro', pro: 'Expansion',        enterprise: 'Corporativo'   },
  imobiliaria: { free: 'Boutique',  starter: 'Business',    pro: 'High Performance', enterprise: 'Elite Network' },
  corretor:    { free: 'Free',      starter: 'Essencial',   pro: 'Pro Autônomo',     enterprise: 'Premium'       },
}

// Preços por plano (valores mensais e implantação)
export const PLAN_PRICES: Record<PlanEntityType, Record<OrgPlan, { implantacao: number; mensal: number; landing_page_adicional?: number }>> = {
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
