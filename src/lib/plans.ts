import type { OrgPlan, OrgType, UserRole } from "@/types/database"

export interface PlanLimits {
  max_properties: number | null   // null = ilimitado
  max_developments: number | null
  max_corretores: number | null
  max_highlights: number | null
  can_view_leads: boolean
}

export type PlanEntityType = OrgType | 'corretor'

const LIMITS: Record<PlanEntityType, Record<OrgPlan, PlanLimits>> = {
  construtora: {
    free:       { max_properties: 10,   max_developments: 1,    max_corretores: null, max_highlights: 2,    can_view_leads: true },
    starter:    { max_properties: 40,   max_developments: 3,    max_corretores: null, max_highlights: 10,   can_view_leads: true },
    pro:        { max_properties: 100,  max_developments: 6,    max_corretores: null, max_highlights: 25,   can_view_leads: true },
    enterprise: { max_properties: null, max_developments: null, max_corretores: null, max_highlights: null, can_view_leads: true },
  },
  imobiliaria: {
    free:       { max_properties: 15,  max_developments: 2,    max_corretores: 5,    max_highlights: null, can_view_leads: true },
    starter:    { max_properties: 50,  max_developments: 5,    max_corretores: 15,   max_highlights: null, can_view_leads: true },
    pro:        { max_properties: 150, max_developments: 15,   max_corretores: 40,   max_highlights: null, can_view_leads: true },
    enterprise: { max_properties: 500, max_developments: null, max_corretores: null, max_highlights: null, can_view_leads: true },
  },
  corretor: {
    free:       { max_properties: 1,  max_developments: 0,    max_corretores: null, max_highlights: 0, can_view_leads: false },
    starter:    { max_properties: 10, max_developments: 1,    max_corretores: null, max_highlights: 0, can_view_leads: true },
    pro:        { max_properties: 25, max_developments: 1,    max_corretores: null, max_highlights: 0, can_view_leads: true },
    enterprise: { max_properties: 50, max_developments: 10,   max_corretores: null, max_highlights: 0, can_view_leads: true },
  },
}

const NAMES: Record<PlanEntityType, Record<OrgPlan, string>> = {
  construtora: { free: 'Start-Up',  starter: 'Builder Pro', pro: 'Expansion',        enterprise: 'Corporativo'   },
  imobiliaria: { free: 'Boutique',  starter: 'Business',    pro: 'High Performance', enterprise: 'Elite Network' },
  corretor:    { free: 'Free',      starter: 'Essencial',   pro: 'Pro Autônomo',     enterprise: 'Premium'       },
}

export function getPlanLimits(entityType: PlanEntityType, plan: OrgPlan): PlanLimits {
  return LIMITS[entityType][plan]
}

export function getPlanName(entityType: PlanEntityType, plan: OrgPlan): string {
  return NAMES[entityType][plan]
}

export function resolveEntityType(role: UserRole, orgType?: OrgType | null): PlanEntityType {
  if (role === 'construtora' || orgType === 'construtora') return 'construtora'
  if (role === 'imobiliaria' || orgType === 'imobiliaria') return 'imobiliaria'
  return 'corretor'
}
