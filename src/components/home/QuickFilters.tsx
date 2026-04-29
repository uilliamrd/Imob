"use client"

import { IntentChip } from "@/components/ui/premium/IntentChip"
import type { HomeFilters } from "./HomeClient"

const FILTERS: { label: string; patch: Partial<HomeFilters> }[] = [
  { label: "2 dormitórios",  patch: { dorms: "2" } },
  { label: "3 dormitórios",  patch: { dorms: "3" } },
  { label: "Cobertura",      patch: { tipo: "Cobertura" } },
  { label: "Kitnet / Studio", patch: { tipo: "Kitnet / Studio" } },
  { label: "Terreno",        patch: { tipo: "Terreno" } },
  { label: "Até R$ 300 mil", patch: { priceMax: "300000" } },
  { label: "Até R$ 600 mil", patch: { priceMax: "600000" } },
]

interface Props {
  filters: HomeFilters
  onFilterChange: (patch: Partial<HomeFilters>) => void
}

export function QuickFilters({ filters, onFilterChange }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap">
        {FILTERS.map((f) => {
          const active = Object.entries(f.patch).every(
            ([k, v]) => filters[k as keyof HomeFilters] === v
          )
          return (
            <div key={f.label} className="shrink-0 sm:shrink">
              <IntentChip
                label={f.label}
                active={active}
                onClick={() => onFilterChange(active
                  ? Object.fromEntries(Object.keys(f.patch).map((k) => [k, ""])) as Partial<HomeFilters>
                  : f.patch
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
