"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { staggerContainerVariants, listItemVariants } from "@/lib/design-system/motion"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface StatItem {
  label: ReactNode
  value: string | number
  icon?: LucideIcon
  /** Optional trend indicator */
  trend?: { value: number; label?: string }
  /** Override individual item accent color */
  accent?: "gold" | "forest" | "default"
}

interface StatsBarProps {
  stats: StatItem[]
  className?: string
  /** Render as a horizontal row (default) or vertical stack */
  layout?: "row" | "grid"
  cols?: 2 | 3 | 4 | 5
}

const accentColors = {
  gold:    "text-[var(--gold-dark)]",
  forest:  "text-[var(--forest)]",
  default: "text-foreground",
}

export function StatsBar({ stats, className, layout = "row", cols = 4 }: StatsBarProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-5",
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn(
        layout === "grid"
          ? `grid gap-3 ${gridCols[cols]}`
          : "flex flex-wrap gap-3",
        className
      )}
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const isPositive = (stat.trend?.value ?? 0) >= 0
        const accent = accentColors[stat.accent ?? "default"]

        return (
          <motion.div
            key={i}
            variants={listItemVariants}
            className="flex flex-1 min-w-[120px] flex-col gap-1.5 rounded-xl bg-card border border-border p-4 elevation-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </span>
              {Icon && (
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-muted-foreground">
                  <Icon size={14} strokeWidth={1.75} />
                </span>
              )}
            </div>

            <span className={cn("font-serif text-2xl font-bold leading-none", accent)}>
              {stat.value}
            </span>

            {stat.trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-600" : "text-red-500"
                )}
              >
                {isPositive ? "▲" : "▼"}{" "}
                {Math.abs(stat.trend.value)}%
                {stat.trend.label && (
                  <span className="text-muted-foreground font-normal"> {stat.trend.label}</span>
                )}
              </span>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
