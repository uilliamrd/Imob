// Fonte única de verdade para categorias de imóvel.
// Todos os formulários, filtros e portais devem importar daqui.
// Nunca defina listas de categoria localmente nos componentes.

import { Building2, Home, MapPin, Briefcase } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ─── Lista plana usada em selects e filtros ────────────────────────────────

export const PROPERTY_CATEGORIES = [
  "Apartamento",
  "Duplex",
  "Loft",
  "Flat / Apart-hotel",
  "Casa Bairro",
  "Casa em Condomínio",
  "Terreno",
  "Lote em Condomínio Fechado",
  "Lote em Rua",
  "Sítio / Fazenda",
  "Sala Comercial",
  "Loja",
  "Galpão / Depósito",
  "Outro",
] as const

export type PropertyCategory = typeof PROPERTY_CATEGORIES[number]

// ─── Categorias agrupadas — usadas no wizard de criação ───────────────────

export interface CategoryGroup {
  label: string
  icon: LucideIcon
  values: string[]
}

export const CATEGORIA_GROUPS: CategoryGroup[] = [
  { label: "Apartamento", icon: Building2, values: ["Apartamento", "Duplex", "Loft", "Flat / Apart-hotel"] },
  { label: "Casa",        icon: Home,      values: ["Casa Bairro", "Casa em Condomínio"] },
  { label: "Terreno",     icon: MapPin,    values: ["Terreno", "Lote em Condomínio Fechado", "Lote em Rua", "Sítio / Fazenda"] },
  { label: "Comercial",   icon: Briefcase, values: ["Sala Comercial", "Loja", "Galpão / Depósito"] },
  { label: "Outro",       icon: Home,      values: ["Outro"] },
]

// ─── Grupos que representam "Casa" para fins de filtro ────────────────────
// Usado em filtros que mostram uma aba/opção "Casa" — deve abranger todas
// as subcategorias do grupo Casa.

export const CASA_CATEGORIAS = CATEGORIA_GROUPS.find((g) => g.label === "Casa")?.values ?? []

// ─── Tipos de negócio ─────────────────────────────────────────────────────

export const TIPOS_NEGOCIO = [
  { value: "venda",     label: "Venda" },
  { value: "aluguel",   label: "Aluguel" },
  { value: "temporada", label: "Temporada" },
  { value: "permuta",   label: "Permuta" },
] as const

export type TipoNegocio = typeof TIPOS_NEGOCIO[number]["value"]

// ─── Opções de mobília ────────────────────────────────────────────────────

export const MOBILIA_OPTIONS = [
  { value: "mobiliado",     label: "Mobiliado" },
  { value: "semimobiliado", label: "Semimobiliado" },
  { value: "decorado",      label: "Decorado" },
  { value: "sem_mobilia",   label: "Sem mobília" },
] as const

export type MobiliaOption = typeof MOBILIA_OPTIONS[number]["value"]
