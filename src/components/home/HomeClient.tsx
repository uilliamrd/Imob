"use client"

import { useMemo, useState } from "react"
import { SearchHero } from "./SearchHero"
import { IntentNavigation } from "./IntentNavigation"
import { FeaturedBuilders } from "./FeaturedBuilders"
import { FeaturedAgencies } from "./FeaturedAgencies"
import { QuickFilters } from "./QuickFilters"
import { LaunchesSection } from "./LaunchesSection"
import { PropertiesGrid } from "./PropertiesGrid"
import { MapSection } from "./MapSection"
import { SeoContent } from "./SeoContent"
import { FinalCTA } from "./FinalCTA"
import type { PortalProperty, PortalOrg } from "@/types/portal"

export interface HomeFilters {
  tab: "comprar" | "alugar" | "lancamentos"
  tipo: string
  cidade: string
  bairro: string
  priceMax: string
  dorms: string
}

const DEFAULT_FILTERS: HomeFilters = {
  tab: "comprar",
  tipo: "",
  cidade: "",
  bairro: "",
  priceMax: "",
  dorms: "",
}

interface Props {
  properties: PortalProperty[]
  construtoras: PortalOrg[]
  agencies: PortalOrg[]
  superDestaques: PortalProperty[]
  destaqueIds: Set<string>
  corretoresCount: number
}

export function HomeClient({
  properties,
  construtoras,
  agencies,
  superDestaques,
  destaqueIds,
  corretoresCount,
}: Props) {
  const [filters, setFilters] = useState<HomeFilters>(DEFAULT_FILTERS)

  function onFilterChange(patch: Partial<HomeFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const cityOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of properties) {
      if (p.city) set.add(p.city)
      if (p.neighborhood) set.add(p.neighborhood)
    }
    return Array.from(set).sort()
  }, [properties])

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const tipoNeg = (p.tipo_negocio ?? "").toLowerCase()
      const tags: string[] = Array.isArray(p.tags) ? (p.tags as string[]) : []

      if (filters.tab === "comprar") {
        if (!tipoNeg.includes("venda") && !tipoNeg.includes("compra")) return false
      } else if (filters.tab === "alugar") {
        if (!tipoNeg.includes("alug") && !tipoNeg.includes("loc")) return false
      } else if (filters.tab === "lancamentos") {
        const isLaunch =
          tags.some((t) => t.toLowerCase().includes("lançamento") || t.toLowerCase().includes("lancamento")) ||
          tipoNeg.includes("lançamento") ||
          tipoNeg.includes("lancamento")
        if (!isLaunch) return false
      }

      if (filters.tipo && p.categoria !== filters.tipo) return false

      if (filters.cidade) {
        const q = filters.cidade.toLowerCase()
        const match =
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.neighborhood ?? "").toLowerCase().includes(q)
        if (!match) return false
      }

      if (filters.bairro) {
        const q = filters.bairro.toLowerCase()
        if (!(p.neighborhood ?? "").toLowerCase().includes(q)) return false
      }

      if (filters.priceMax && filters.priceMax !== "") {
        if (p.price > Number(filters.priceMax)) return false
      }

      if (filters.dorms && filters.dorms !== "") {
        const quartos = (p.features as Record<string, unknown> | null)?.quartos as number | undefined
        if (quartos == null || quartos < Number(filters.dorms)) return false
      }

      return true
    })
  }, [properties, filters])

  const statsCount = properties.length
  const orgCount = construtoras.length + agencies.length

  return (
    <>
      {/* Utility bar */}
      <div className="bg-[var(--forest)] text-[var(--forest-foreground)] py-2 text-center text-xs font-sans">
        <span className="opacity-80">
          {statsCount.toLocaleString("pt-BR")} imóveis
          {" · "}
          {orgCount} parceiros
          {" · "}
          {corretoresCount.toLocaleString("pt-BR")} corretores ativos
        </span>
      </div>

      <SearchHero
        filters={filters}
        onFilterChange={onFilterChange}
        cityOptions={cityOptions}
      />

      <IntentNavigation filters={filters} onFilterChange={onFilterChange} />

      <FeaturedBuilders construtoras={construtoras} />

      <FeaturedAgencies agencies={agencies} />

      <QuickFilters filters={filters} onFilterChange={onFilterChange} />

      <LaunchesSection properties={properties} />

      <PropertiesGrid
        properties={filteredProperties}
        superDestaques={superDestaques}
        destaqueIds={destaqueIds}
      />

      <MapSection />

      <SeoContent />

      <FinalCTA />
    </>
  )
}
