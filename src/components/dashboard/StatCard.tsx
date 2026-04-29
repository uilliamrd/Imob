import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { NumberTicker } from "@/components/magicui/number-ticker"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  animate?: boolean
  trend?: { pct: number; label: string }
  href?: string
  variant?: "default" | "gold" | "success" | "ghost"
  description?: string
  size?: "sm" | "md" | "lg"
}

export function StatCard({
  icon: Icon,
  label,
  value,
  animate = false,
  trend,
  href,
  variant = "default",
  description,
  size = "md",
}: StatCardProps) {
  const iconSize = size === "sm" ? 13 : size === "lg" ? 20 : 16
  const valueClass = size === "sm" ? "text-2xl" : size === "lg" ? "text-[40px]" : "text-[32px]"

  const card = (
    <div className={`
      relative overflow-hidden rounded-2xl border transition-all duration-300 group cursor-default
      ${size === "sm" ? "p-4" : size === "lg" ? "p-6" : "p-5"}
      ${variant === "gold"
        ? "bg-gradient-to-br from-gold/10 via-gold/4 to-transparent border-gold/20 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/8"
        : variant === "success"
        ? "bg-gradient-to-br from-emerald-500/7 via-transparent to-transparent border-emerald-500/15 hover:border-emerald-500/30 hover:shadow-sm"
        : variant === "ghost"
        ? "bg-transparent border-border/40 hover:border-border hover:bg-card/50"
        : "bg-card border-border hover:border-gold/20 hover:shadow-md dark:hover:shadow-none"}
    `}>
      {/* Ambient glow */}
      {variant !== "default" && variant !== "ghost" && (
        <div className={`
          absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-60
          ${variant === "gold" ? "bg-gold/30" : "bg-emerald-400/25"}
        `} />
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl border ${
            variant === "gold"
              ? "bg-gold/15 border-gold/25"
              : variant === "success"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-muted/60 border-border/50"
          }`}>
            <Icon size={iconSize} className={
              variant === "gold" ? "text-gold" :
              variant === "success" ? "text-emerald-500 dark:text-emerald-400" :
              "text-muted-foreground"
            } />
          </div>

          {trend !== undefined && (
            <span className={`flex items-center gap-1 text-[10px] font-sans px-2 py-1 rounded-lg leading-none font-medium ${
              trend.pct > 0
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : trend.pct < 0
                ? "text-amber-500 bg-amber-500/10"
                : "text-muted-foreground bg-muted/60"
            }`}>
              {trend.pct > 0 ? <TrendingUp size={9} /> : trend.pct < 0 ? <TrendingDown size={9} /> : <Minus size={9} />}
              {Math.abs(trend.pct)}%
            </span>
          )}
        </div>

        <div className={`font-serif font-bold text-foreground leading-none mb-1.5 ${valueClass}`}>
          {animate && typeof value === "number" ? (
            <NumberTicker value={value} duration={1400} />
          ) : (
            value
          )}
        </div>

        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-sans">{label}</p>

        {(trend || description) && (
          <p className="text-muted-foreground/50 text-[10px] font-sans mt-1.5 leading-relaxed">
            {trend?.label ?? description}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block group">
        {card}
      </Link>
    )
  }
  return card
}
