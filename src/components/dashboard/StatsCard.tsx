import Link from "next/link"
import { TrendingUp, TrendingDown, Minus, Lock, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  value: string | number
  delta?: { value: number; label: string }
  icon: LucideIcon
  iconColor?: "gold" | "forest" | "muted"
  trend?: "up" | "down" | "neutral"
  loading?: boolean
  locked?: boolean
  href?: string
}

const ICON_COLORS = {
  gold:   { wrapper: "bg-[var(--primary-subtle)] border-[var(--primary-default)]/20", icon: "text-[var(--primary-default)]" },
  forest: { wrapper: "bg-[var(--action-subtle)] border-[var(--action-default)]/20",   icon: "text-[var(--action-default)]" },
  muted:  { wrapper: "bg-muted border-border",                                        icon: "text-muted-foreground" },
}

const TREND_CONFIG = {
  up:      { icon: TrendingUp,   className: "text-emerald-500" },
  down:    { icon: TrendingDown, className: "text-red-400" },
  neutral: { icon: Minus,        className: "text-muted-foreground" },
}

export function StatsCard({ title, value, delta, icon: Icon, iconColor = "muted", trend = "neutral", loading = false, locked = false, href }: Props) {
  const colors = ICON_COLORS[iconColor]
  const trendCfg = TREND_CONFIG[trend]
  const TrendIcon = trendCfg.icon

  const content = (
    <div className={cn(
      "relative bg-card rounded-2xl p-6 border border-border overflow-hidden transition-all duration-200",
      "elevation-soft",
      href && "hover:border-[var(--primary-default)]/30 hover:shadow-md cursor-pointer"
    )}>
      {/* Icon */}
      <div className={cn("absolute top-5 right-5 p-2.5 rounded-xl border", colors.wrapper)}>
        <Icon size={16} strokeWidth={1.75} className={colors.icon} />
      </div>

      {loading ? (
        <div className="space-y-3 pr-12">
          <div className="skeleton-luxury h-8 w-24 rounded" />
          <div className="skeleton-luxury h-3 w-32 rounded" />
          <div className="skeleton-luxury h-2.5 w-20 rounded" />
        </div>
      ) : (
        <div className="pr-12">
          <p className="font-serif text-3xl font-bold text-foreground leading-none">
            {value}
          </p>
          <p className="text-sm text-muted-foreground font-sans mt-2 leading-snug">{title}</p>

          {delta !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-sans", trendCfg.className)}>
              <TrendIcon size={12} strokeWidth={2} />
              <span>{Math.abs(delta.value)}%</span>
              <span className="text-muted-foreground/60">{delta.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 bg-card/90 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-2 px-4 text-center">
          <Lock size={18} className="text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground font-sans">Disponível no plano Gold</p>
          <Link
            href="/dashboard/upgrade"
            className="text-xs px-3 py-1.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary-default)] border border-[var(--primary-default)]/20 hover:bg-[var(--primary-subtle)]/80 transition-colors font-sans"
          >
            Ver planos
          </Link>
        </div>
      )}
    </div>
  )

  if (href && !locked) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}
