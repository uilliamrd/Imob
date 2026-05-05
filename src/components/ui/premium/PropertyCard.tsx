"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MapPin, BedDouble, Car, Maximize2, GitCompareArrows } from "lucide-react"
import { cn } from "@/lib/utils"
import { fadeUpVariants, hoverEffects } from "@/lib/design-system/motion"
import { PremiumBadge } from "./PremiumBadge"
import { useCompare } from "@/components/property/CompareContext"

interface PropertyCardProps {
  id: string
  slug: string
  title: string
  price: number
  neighborhood?: string | null
  city?: string | null
  images?: string[]
  quartos?: number | null
  vagas?: number | null
  area_m2?: number | null
  categoria?: string | null
  tipo_negocio?: string
  /** Custom status badge (overrides tipo_negocio badge) */
  statusBadge?: { label: string; className: string }
  badge?: { label: string; variant?: "gold" | "forest" | "muted" }
  /** Override the link href. Defaults to /imovel/{slug} */
  href?: string
  className?: string
  /** Renders as <article> without Link wrapper */
  static?: boolean
  /** Show compare checkbox (requires CompareProvider in tree) */
  showCompare?: boolean
}

function formatPrice(price: number): string {
  if (price >= 1_000_000)
    return `R$ ${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)} mi`
  if (price >= 1_000)
    return `R$ ${(price / 1_000).toFixed(0)} mil`
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function PropertyCard({
  id,
  slug,
  title,
  price,
  neighborhood,
  city,
  images = [],
  quartos,
  vagas,
  area_m2,
  categoria,
  tipo_negocio,
  statusBadge,
  badge,
  href,
  className,
  static: isStatic = false,
  showCompare = false,
}: PropertyCardProps) {
  const compare = useCompare()
  const isCompared = showCompare ? compare.has(id) : false
  const location = [neighborhood, city].filter(Boolean).join(", ")
  const thumb = images[0] ?? null

  const card = (
    <motion.article
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      {...hoverEffects.lift}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border elevation-card",
        "transition-colors duration-200",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted shrink-0">
        {thumb ? (
          <Image
            src={thumb}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <Maximize2 size={28} strokeWidth={1} className="text-muted-foreground/40" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {statusBadge ? (
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans", statusBadge.className)}>
              {statusBadge.label}
            </span>
          ) : tipo_negocio ? (
            <PremiumBadge variant="forest" size="xs">
              {tipo_negocio === "venda" ? "Venda" : tipo_negocio === "aluguel" ? "Aluguel" : tipo_negocio}
            </PremiumBadge>
          ) : null}
          {badge && (
            <PremiumBadge variant={badge.variant ?? "gold"} size="xs">
              {badge.label}
            </PremiumBadge>
          )}
        </div>

        {/* Compare toggle */}
        {showCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              compare.toggle({ id, slug, title, price, images, neighborhood, city, quartos, vagas, area_m2 })
            }}
            className={cn(
              "absolute top-3 right-3 w-7 h-7 rounded-lg border flex items-center justify-center transition-all",
              isCompared
                ? "bg-[var(--gold)] border-[var(--gold)] text-background"
                : "bg-card/80 backdrop-blur-sm border-border text-muted-foreground hover:border-[var(--gold)]/60 hover:text-[var(--gold)]",
              !isCompared && !compare.canAdd && "opacity-40 cursor-not-allowed"
            )}
            title={isCompared ? "Remover da comparação" : "Adicionar à comparação"}
          >
            <GitCompareArrows size={13} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        {categoria && (
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/60">
            {categoria}
          </span>
        )}

        <p className="font-serif text-base font-semibold text-foreground line-clamp-2 leading-snug">
          {title}
        </p>

        {location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} strokeWidth={1.75} className="shrink-0" />
            {location}
          </p>
        )}

        {/* Stats row */}
        {(quartos != null || vagas != null || area_m2 != null) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2 mt-1">
            {quartos != null && (
              <span className="flex items-center gap-1">
                <BedDouble size={12} strokeWidth={1.75} />
                {quartos} {quartos === 1 ? "quarto" : "quartos"}
              </span>
            )}
            {vagas != null && (
              <span className="flex items-center gap-1">
                <Car size={12} strokeWidth={1.75} />
                {vagas} {vagas === 1 ? "vaga" : "vagas"}
              </span>
            )}
            {area_m2 != null && (
              <span className="flex items-center gap-1">
                <Maximize2 size={12} strokeWidth={1.75} />
                {area_m2} m²
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <p className="mt-1 font-serif text-lg font-bold text-foreground">
          {formatPrice(price)}
        </p>
      </div>
    </motion.article>
  )

  if (isStatic) return card

  return (
    <Link href={href ?? `/imovel/${slug}`} className="block focus:outline-none">
      {card}
    </Link>
  )
}
