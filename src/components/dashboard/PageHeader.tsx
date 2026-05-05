import { type LucideIcon, Plus } from "lucide-react"
import Link from "next/link"

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
          {(Icon || category || badge) && (
            <div className="flex items-center gap-2 mb-2">
              {Icon && (
                <div className="p-1.5 rounded-md bg-[var(--surface-sunken)] border border-[var(--border-subtle)]">
                  <Icon size={13} className="text-txt-tertiary" />
                </div>
              )}
              {category && (
                <p className="text-xs uppercase tracking-widest text-txt-tertiary font-sans">{category}</p>
              )}
              {badge && (
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-txt-tertiary uppercase tracking-wide font-sans">
                  {badge}
                </span>
              )}
            </div>
          )}

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {title}
          </h1>

          {(subtitle || description) && (
            <p className="text-sm text-txt-secondary font-sans mt-1.5 max-w-xl leading-relaxed">
              {subtitle ?? description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {extra}
          {actions}
          {cta && (
            <Link
              href={cta.href}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-default)] text-white hover:bg-[var(--primary-hover)] text-sm font-sans font-medium rounded-md transition-colors duration-150"
            >
              <CtaIcon size={14} />
              {cta.label}
            </Link>
          )}
        </div>
      </div>

      {divider && <div className="mt-4 border-b border-[var(--border-subtle)]" />}
    </div>
  )
}
