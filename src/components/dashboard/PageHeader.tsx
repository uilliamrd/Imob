import { type LucideIcon, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  divider?: boolean
  // Legacy props (mantidos para compatibilidade)
  icon?: LucideIcon
  category?: string
  description?: string
  cta?: { label: string; href: string; icon?: LucideIcon }
  badge?: string
  extra?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  actions,
  divider = false,
  // Legacy
  icon: Icon,
  category,
  description,
  cta,
  badge,
  extra,
}: PageHeaderProps) {
  const CtaIcon = cta?.icon ?? Plus

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {/* Category row (legacy + new) */}
          {(Icon || category || badge) && (
            <div className="flex items-center gap-2 mb-2">
              {Icon && (
                <div className="p-1.5 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/15">
                  <Icon size={13} className="text-[var(--gold)]" />
                </div>
              )}
              {category && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]/60 font-sans">{category}</p>
              )}
              {badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)]/70 uppercase tracking-wider font-sans">
                  {badge}
                </span>
              )}
            </div>
          )}

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {title}
          </h1>

          {(subtitle || description) && (
            <p className="text-sm text-muted-foreground font-sans mt-1.5 max-w-xl leading-relaxed">
              {subtitle ?? description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {extra}
          {actions}
          {cta && (
            <Link
              href={cta.href}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--gold)] text-[#0F0F0F] hover:bg-[var(--gold-light)] text-[11px] uppercase tracking-[0.15em] font-sans rounded-xl transition-all duration-200 shadow-sm shadow-[var(--gold)]/20 font-medium"
            >
              <CtaIcon size={12} />
              {cta.label}
            </Link>
          )}
        </div>
      </div>

      {divider && <div className={cn("divider-gold mt-4")} />}
      {!divider && !Icon && <div className="divider-gold mt-4 w-16" />}
    </div>
  )
}
