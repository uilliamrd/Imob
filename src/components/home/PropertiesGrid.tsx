"use client"

import { useState } from "react"
import Link from "next/link"
import { PropertyCard } from "@/components/ui/premium/PropertyCard"
import { EmptyState } from "@/components/ui/premium/EmptyState"
import { SkeletonCard } from "@/components/ui/premium/SkeletonCard"
import { IntentChip } from "@/components/ui/premium/IntentChip"
import { Search } from "lucide-react"
import type { PortalProperty } from "@/types/portal"

const PAGE_SIZE = 9

const CATEGORY_TABS: { value: string; label: string }[] = [
  { value: "todos",        label: "Todos" },
  { value: "Apartamento",  label: "Apartamentos" },
  { value: "Casa",         label: "Casas" },
  { value: "Cobertura",    label: "Coberturas" },
  { value: "Comercial",    label: "Comerciais" },
]

interface Props {
  properties: PortalProperty[]
  superDestaques: PortalProperty[]
  destaqueIds: Set<string>
}

function getFeature(p: PortalProperty, key: string): number | undefined {
  return (p.features as Record<string, unknown> | null)?.[key] as number | undefined
}

export function PropertiesGrid({ properties, superDestaques, destaqueIds }: Props) {
  const [activeCategory, setActiveCategory] = useState("todos")
  const [page, setPage] = useState(1)

  const filtered = activeCategory === "todos"
    ? properties
    : properties.filter((p) => p.categoria === activeCategory)

  const shown = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = shown.length < filtered.length

  const topItems = activeCategory === "todos"
    ? [...superDestaques, ...shown.filter((p) => !superDestaques.some((s) => s.id === p.id))]
    : shown

  return (
    <section id="grid-imoveis" className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Imóveis disponíveis</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} imóvel{filtered.length !== 1 ? "is" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/imoveis" className="text-sm font-medium text-muted-foreground hover:text-[var(--gold)] transition-colors shrink-0">
          Ver todos →
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 sm:flex-wrap">
        {CATEGORY_TABS.map((tab) => (
          <div key={tab.value} className="shrink-0 sm:shrink">
            <IntentChip
              label={tab.label}
              active={activeCategory === tab.value}
              onClick={() => { setActiveCategory(tab.value); setPage(1) }}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum imóvel encontrado"
          description="Tente ajustar os filtros de busca para ver mais resultados."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {topItems.slice(0, page * PAGE_SIZE).map((p) => (
              <PropertyCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                title={p.title}
                price={p.price}
                neighborhood={p.neighborhood}
                city={p.city}
                images={p.images ?? []}
                quartos={getFeature(p, "quartos")}
                vagas={getFeature(p, "vagas")}
                area_m2={getFeature(p, "area_m2")}
                categoria={p.categoria}
                tipo_negocio={p.tipo_negocio ?? undefined}
                badge={
                  superDestaques.some((s) => s.id === p.id)
                    ? { label: "Destaque", variant: "gold" }
                    : destaqueIds.has(p.id)
                    ? { label: "Em destaque", variant: "forest" }
                    : undefined
                }
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-8 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-colors"
              >
                Carregar mais
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
