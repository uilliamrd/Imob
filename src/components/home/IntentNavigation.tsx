"use client"

import { motion } from "framer-motion"
import { staggerContainerVariants, listItemVariants } from "@/lib/design-system/motion"
import { IntentChip } from "@/components/ui/premium/IntentChip"
import type { HomeFilters } from "./HomeClient"

const INTENTS: { label: string; emoji: string; filter: Partial<HomeFilters> }[] = [
  { label: "Comprar",      emoji: "🏠", filter: { tab: "comprar" } },
  { label: "Alugar",       emoji: "🔑", filter: { tab: "alugar" } },
  { label: "Lançamentos",  emoji: "🏗️", filter: { tab: "lancamentos" } },
  { label: "Apartamento",  emoji: "🏢", filter: { tipo: "Apartamento" } },
  { label: "Casa",         emoji: "🌳", filter: { tipo: "Casa" } },
  { label: "Cobertura",    emoji: "⭐", filter: { tipo: "Cobertura" } },
  { label: "Comercial",    emoji: "💼", filter: { tipo: "Comercial" } },
  { label: "2 quartos",    emoji: "🛏️", filter: { dorms: "2" } },
  { label: "Até 500 mil",  emoji: "💰", filter: { priceMax: "500000" } },
]

interface Props {
  filters: HomeFilters
  onFilterChange: (patch: Partial<HomeFilters>) => void
}

function isActive(filters: HomeFilters, intent: Partial<HomeFilters>) {
  return Object.entries(intent).every(([k, v]) => filters[k as keyof HomeFilters] === v)
}

export function IntentNavigation({ filters, onFilterChange }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Desktop: wrap */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="hidden sm:flex flex-wrap gap-2 justify-center"
      >
        {INTENTS.map((intent) => (
          <motion.div key={intent.label} variants={listItemVariants}>
            <IntentChip
              label={`${intent.emoji} ${intent.label}`}
              active={isActive(filters, intent.filter)}
              onClick={() => onFilterChange(intent.filter)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile: horizontal scroll */}
      <div className="flex sm:hidden gap-2 overflow-x-auto scrollbar-none px-0 pb-1">
        {INTENTS.map((intent) => (
          <div key={intent.label} className="shrink-0">
            <IntentChip
              label={`${intent.emoji} ${intent.label}`}
              active={isActive(filters, intent.filter)}
              onClick={() => onFilterChange(intent.filter)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
