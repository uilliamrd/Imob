import Image from "next/image"
import Link from "next/link"
import { MapPin, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type ProjectStatus = "em_obras" | "pronto" | "lancamento"

interface Props {
  name: string
  image?: string | null
  location?: string | null
  percentSold: number
  availableUnits: number
  status: ProjectStatus
  href: string
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  em_obras:   { label: "Em obras",   className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  pronto:     { label: "Pronto",     className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  lancamento: { label: "Lançamento", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" },
}

export function BuilderProjectCard({ name, image, location, percentSold, availableUnits, status, href }: Props) {
  const statusCfg = STATUS_CONFIG[status]

  return (
    <Link
      href={href}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-[var(--gold)]/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--gold)]/5">
            <Home size={32} strokeWidth={1} className="text-[var(--gold)]/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status badge */}
        <span className={cn(
          "absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full border font-sans uppercase tracking-wider",
          statusCfg.className
        )}>
          {statusCfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-serif font-semibold text-foreground leading-snug line-clamp-1">{name}</p>

        {location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
            {location}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-sans mb-1.5">
            <span>{percentSold}% vendido</span>
            <span>{availableUnits} disponíveis</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--gold)] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, percentSold))}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
