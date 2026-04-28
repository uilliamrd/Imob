"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import type { PortalProperty } from "@/app/(portal)/page"

interface Props {
  properties: PortalProperty[]
  onCitySelect: (city: string) => void
}

export function ExploreByCity({ properties, onCitySelect }: Props) {
  // Build city data from properties
  const cityMap = new Map<string, { count: number; image: string | null }>()
  for (const p of properties) {
    if (!p.city) continue
    const existing = cityMap.get(p.city)
    if (existing) {
      existing.count++
      if (!existing.image && p.images?.[0]) existing.image = p.images[0]
    } else {
      cityMap.set(p.city, { count: 1, image: p.images?.[0] ?? null })
    }
  }

  const cities = Array.from(cityMap.entries())
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  if (cities.length === 0) return null

  function handleClick(city: string) {
    onCitySelect(city)
    setTimeout(() => {
      document.getElementById("grid-imoveis")?.scrollIntoView({ behavior: "smooth" })
    }, 50)
  }

  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans mb-2">Localização</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Explore por localização
        </h2>
        <p className="text-muted-foreground font-sans text-sm mt-2">
          Clique em uma cidade para filtrar os imóveis disponíveis.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cities.map((c, i) => (
          <motion.button
            key={c.city}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            onClick={() => handleClick(c.city)}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-border hover:border-gold/40 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(201,169,110,0.15)] hover:-translate-y-1 text-left"
          >
            {/* Background */}
            {c.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.image}
                alt={c.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/70" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-1 mb-1">
                <MapPin size={10} className="text-gold flex-shrink-0" />
                <p className="font-serif text-white font-semibold text-sm leading-tight">{c.city}</p>
              </div>
              <p className="text-white/60 text-[10px] font-sans">
                {c.count} imóvel{c.count !== 1 ? "is" : ""}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
