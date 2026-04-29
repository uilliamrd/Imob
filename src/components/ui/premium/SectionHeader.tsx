import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Renders a gold divider below the header */
  divider?: boolean
  className?: string
  action?: React.ReactNode
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  divider = false,
  className,
  action,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_15%,var(--surface))] text-[var(--gold-dark)]">
              <Icon size={16} strokeWidth={1.75} />
            </span>
          )}
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground leading-tight">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {divider && <div className="mt-4 divider-gold" />}
    </div>
  )
}
