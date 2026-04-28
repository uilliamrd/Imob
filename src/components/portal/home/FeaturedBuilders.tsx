"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, ChevronRight, ArrowRight } from "lucide-react"
import type { PortalOrg } from "@/app/(portal)/page"

interface Props {
  construtoras: PortalOrg[]
}

function HeroBuilderCard({ org, index }: { org: PortalOrg; index: number }) {
  const accent = org.brand_colors?.primary ?? "#C9A96E"
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href={`/construtora/${org.slug}`}
        className="group relative block aspect-[5/3] rounded-2xl overflow-hidden border border-border hover:border-gold/40 transition-all duration-400 hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: accent + "22" }}
        />
        {org.logo ? (
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <Image
              src={org.logo}
              alt={org.name}
              fill
              className="object-contain p-12 group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 size={52} style={{ color: accent + "60" }} />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-serif text-white font-bold text-lg leading-tight mb-1">{org.name}</p>
          {org.hero_tagline && (
            <p className="text-white/60 text-xs font-sans mb-3 line-clamp-1">{org.hero_tagline}</p>
          )}
          <div className="flex items-center justify-between">
            {org.availableCount > 0 && (
              <span className="text-[10px] font-sans px-2.5 py-1 rounded-full border border-white/20 text-white/70">
                {org.availableCount} imóvel{org.availableCount !== 1 ? "is" : ""}
              </span>
            )}
            <span className="flex items-center gap-1 text-gold text-[11px] font-sans group-hover:gap-2 transition-all">
              Ver catálogo <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SmallBuilderCard({ org, index }: { org: PortalOrg; index: number }) {
  const accent = org.brand_colors?.primary ?? "#C9A96E"
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
    >
      <Link
        href={`/construtora/${org.slug}`}
        className="group flex flex-col items-center gap-3 p-5 bg-card border border-border hover:border-gold/40 hover:shadow-[0_4px_20px_rgba(201,169,110,0.10)] rounded-2xl transition-all duration-300 text-center"
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: accent + "18" }}
        >
          {org.logo ? (
            <Image src={org.logo} alt={org.name} width={40} height={40} className="object-contain" unoptimized />
          ) : (
            <Building2 size={20} style={{ color: accent }} />
          )}
        </div>
        <div>
          <p className="font-serif text-sm font-semibold text-foreground leading-snug line-clamp-2">{org.name}</p>
          {org.availableCount > 0 && (
            <p className="text-[10px] font-sans mt-1" style={{ color: accent }}>
              {org.availableCount} disponíve{org.availableCount !== 1 ? "is" : "l"}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export function FeaturedBuilders({ construtoras }: Props) {
  if (construtoras.length === 0) return null

  const heroes = construtoras.slice(0, 2)
  const smalls = construtoras.slice(2, 6)

  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans mb-2">Construtoras</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            Grandes projetos<br />
            <em className="not-italic italic" style={{ color: "#C9A96E" }}>começam aqui</em>
          </h2>
          <p className="text-muted-foreground font-sans text-sm mt-2 max-w-md">
            Conheça as incorporadoras e construtoras que moldam o mercado.
          </p>
        </div>
        <Link
          href="/construtoras"
          className="hidden sm:flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-gold transition-colors flex-shrink-0 ml-4"
        >
          Ver todas <ChevronRight size={13} />
        </Link>
      </motion.div>

      {/* Desktop: 2 hero + up to 4 small */}
      <div className="hidden md:block space-y-4">
        {heroes.length > 0 && (
          <div className={`grid gap-4 ${heroes.length === 2 ? "grid-cols-2" : "grid-cols-1 max-w-lg"}`}>
            {heroes.map((org, i) => <HeroBuilderCard key={org.id} org={org} index={i} />)}
          </div>
        )}
        {smalls.length > 0 && (
          <div className={`grid gap-4 grid-cols-2 sm:grid-cols-${Math.min(smalls.length, 4)}`}
            style={{ gridTemplateColumns: `repeat(${Math.min(smalls.length, 4)}, minmax(0, 1fr))` }}>
            {smalls.map((org, i) => <SmallBuilderCard key={org.id} org={org} index={i} />)}
          </div>
        )}
      </div>

      {/* Mobile: horizontal carousel */}
      <div className="md:hidden flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
        {construtoras.slice(0, 6).map((org, i) => (
          <div key={org.id} className="flex-shrink-0 w-60">
            <SmallBuilderCard org={org} index={i} />
          </div>
        ))}
      </div>

      <div className="flex sm:hidden justify-center mt-4">
        <Link href="/construtoras" className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-gold transition-colors">
          Ver todas as construtoras <ChevronRight size={12} />
        </Link>
      </div>
    </section>
  )
}
