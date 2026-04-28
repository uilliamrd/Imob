"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, ChevronRight, CheckCircle2 } from "lucide-react"
import type { PortalOrg } from "@/app/(portal)/page"

interface Props {
  imobiliarias: PortalOrg[]
}

export function FeaturedAgencies({ imobiliarias }: Props) {
  if (imobiliarias.length === 0) return null

  return (
    <section className="py-16 bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans mb-2">Parceiros</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              As imobiliárias mais<br />
              <em className="not-italic italic" style={{ color: "#C9A96E" }}>conectadas do mercado</em>
            </h2>
          </div>
          <Link
            href="/imobiliarias"
            className="hidden sm:flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-gold transition-colors flex-shrink-0 ml-4"
          >
            Ver todas <ChevronRight size={13} />
          </Link>
        </motion.div>

        {/* Carousel */}
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-3 -mx-4 px-4">
          {imobiliarias.slice(0, 8).map((org, i) => {
            const accent = org.brand_colors?.primary ?? "#C9A96E"
            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex-shrink-0 w-64"
              >
                <Link
                  href={`/imobiliaria/${org.slug}`}
                  className="group flex flex-col p-5 bg-card border border-border hover:border-gold/40 hover:shadow-[0_4px_24px_rgba(201,169,110,0.10)] rounded-2xl transition-all duration-300 h-full"
                >
                  {/* Logo */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mb-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: accent + "18" }}
                  >
                    {org.logo ? (
                      <Image src={org.logo} alt={org.name} width={48} height={48} className="object-contain" unoptimized />
                    ) : (
                      <Building2 size={24} style={{ color: accent }} />
                    )}
                  </div>

                  <p className="font-serif text-foreground font-semibold text-sm leading-snug mb-1.5">{org.name}</p>

                  {/* Verified badge */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <CheckCircle2 size={11} className="text-gold flex-shrink-0" />
                    <span className="text-[10px] font-sans text-gold uppercase tracking-wider">Parceira verificada</span>
                  </div>

                  {org.hero_tagline && (
                    <p className="text-muted-foreground text-xs font-sans mb-3 line-clamp-2 flex-1">{org.hero_tagline}</p>
                  )}

                  {org.availableCount > 0 && (
                    <p className="text-xs font-sans text-muted-foreground mt-auto">
                      <span className="font-semibold text-foreground/80">{org.availableCount}</span>{" "}
                      imóvel{org.availableCount !== 1 ? "is" : ""} disponíve{org.availableCount !== 1 ? "is" : "l"}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/60">
                    <span className="flex items-center gap-1 text-[11px] font-sans text-muted-foreground group-hover:text-gold transition-colors">
                      Conhecer <ChevronRight size={11} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="flex sm:hidden justify-center mt-4">
          <Link href="/imobiliarias" className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-gold transition-colors">
            Ver todas as imobiliárias <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  )
}
