import { type LucideIcon } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  cta?: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  ghostCards?: number
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  ctaSecondary,
  ghostCards = 3,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}>
      {/* Icon with glow */}
      <div className="relative mb-7">
        <div className="absolute inset-0 bg-gold/15 rounded-2xl blur-2xl scale-150 pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center shadow-lg shadow-gold/10">
          <Icon size={28} className="text-gold" />
        </div>
      </div>

      {/* Text */}
      <h3 className="font-serif text-2xl font-bold text-foreground mb-3 leading-tight">{title}</h3>
      <p className="text-muted-foreground text-sm font-sans max-w-xs leading-relaxed mb-8">{description}</p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {cta && (
          <Link
            href={cta.href}
            className="px-5 py-2.5 bg-foreground text-background text-xs uppercase tracking-[0.18em] font-sans rounded-xl hover:bg-gold hover:text-[#0F0F0F] transition-all duration-300 shadow-sm"
          >
            {cta.label}
          </Link>
        )}
        {ctaSecondary && (
          <Link
            href={ctaSecondary.href}
            className="px-5 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-[0.18em] font-sans rounded-xl hover:border-gold/40 hover:text-gold transition-all duration-300"
          >
            {ctaSecondary.label}
          </Link>
        )}
      </div>

      {/* Ghost cards preview */}
      {ghostCards > 0 && (
        <div className="mt-10 w-full max-w-sm space-y-2.5 pointer-events-none select-none">
          {Array.from({ length: ghostCards }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-muted/40 border border-border/30"
              style={{ opacity: 0.6 - i * 0.15 }}
            />
          ))}
          <p className="text-[10px] text-muted-foreground/30 font-sans uppercase tracking-widest mt-3">
            Aqui aparecerá seu conteúdo
          </p>
        </div>
      )}
    </div>
  )
}
