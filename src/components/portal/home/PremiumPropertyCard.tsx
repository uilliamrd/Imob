import Image from "next/image"
import Link from "next/link"
import { MapPin, Maximize2, BedDouble, Car, Sparkles, Star } from "lucide-react"
import type { PortalProperty } from "@/app/(portal)/page"

function formatPrice(p: number) {
  if (p >= 1_000_000)
    return "R$ " + (p / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + p.toLocaleString("pt-BR")
}

interface Props {
  property: PortalProperty
  isDestaque?: boolean
  isFeatured?: boolean
  large?: boolean
}

export function PremiumPropertyCard({ property: p, isDestaque, isFeatured, large }: Props) {
  return (
    <Link
      href={`/imovel/${p.slug}`}
      className={`group bg-card rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 hover:-translate-y-0.5 ${
        isFeatured
          ? "border-gold/30 shadow-[0_4px_24px_rgba(201,169,110,0.12)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.22)] hover:border-gold/50"
          : isDestaque
          ? "border-gold/20 hover:border-gold/40 hover:shadow-[0_4px_20px_rgba(201,169,110,0.10)]"
          : "border-border hover:border-gold/25 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-muted ${large ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
        {p.images?.[0] ? (
          <Image
            src={p.images[0]}
            alt={p.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-600"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <span className="font-serif text-3xl text-muted-foreground/20">R·I</span>
          </div>
        )}

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Badges top */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-gold text-[#0a0a0a] rounded-full text-[9px] font-sans uppercase tracking-wider font-bold shadow-lg">
              <Sparkles size={8} /> Super Destaque
            </span>
          )}
          {isDestaque && !isFeatured && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-gold/90 text-[#0a0a0a] rounded-full text-[9px] font-sans uppercase tracking-wider font-semibold">
              <Star size={7} /> Destaque
            </span>
          )}
        </div>

        {/* Price over image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <p className="font-serif text-white font-bold text-lg drop-shadow-md">
            {formatPrice(p.price)}
          </p>
          {p.organization && (
            <span className="text-[9px] px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full font-sans text-white/80 max-w-[120px] truncate">
              {p.organization.name}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-foreground text-sm font-semibold leading-snug line-clamp-2 mb-1.5 group-hover:text-gold transition-colors">
          {p.title}
        </h3>

        {(p.neighborhood || p.city) && (
          <p className="text-muted-foreground text-xs font-sans flex items-center gap-1 mb-3">
            <MapPin size={9} className="text-gold/60 flex-shrink-0" />
            {[p.neighborhood, p.city].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-sans mt-auto pt-3 border-t border-border/60">
          {p.features.area_m2 && (
            <span className="flex items-center gap-1">
              <Maximize2 size={9} className="text-gold/50" />
              {p.features.area_m2}m²
            </span>
          )}
          {(p.features.suites || p.features.dormitorios || p.features.quartos) && (
            <span className="flex items-center gap-1">
              <BedDouble size={9} className="text-gold/50" />
              {p.features.suites ?? p.features.dormitorios ?? p.features.quartos}
            </span>
          )}
          {p.features.vagas && (
            <span className="flex items-center gap-1">
              <Car size={9} className="text-gold/50" />
              {p.features.vagas}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
