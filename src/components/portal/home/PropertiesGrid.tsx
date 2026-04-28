"use client"

import { motion } from "framer-motion"
import { Home } from "lucide-react"
import { PremiumPropertyCard } from "./PremiumPropertyCard"
import type { PortalProperty } from "@/app/(portal)/page"

interface Props {
  properties: PortalProperty[]
  destaqueIds: Set<string>
  title?: string
  subtitle?: string
  id?: string
  featuredFirst?: boolean
  onClearFilters?: () => void
}

export function PropertiesGrid({
  properties,
  destaqueIds,
  title = "Imóveis Disponíveis",
  subtitle,
  id,
  onClearFilters,
}: Props) {
  return (
    <section id={id} className="px-4 py-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans mb-2">Portfólio</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground font-sans text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <p className="text-sm font-sans text-muted-foreground flex-shrink-0 ml-4">
          <span className="text-foreground font-semibold">{properties.length}</span>{" "}
          imóvel{properties.length !== 1 ? "is" : ""}
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Home size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-sans text-sm mb-3">Nenhum imóvel encontrado.</p>
          {onClearFilters && (
            <button onClick={onClearFilters} className="text-gold text-sm font-sans hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {properties.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
            >
              <PremiumPropertyCard
                property={p}
                isDestaque={destaqueIds.has(p.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
