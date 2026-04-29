"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeUpVariants } from "@/lib/design-system/motion"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  /** Compact inline variant (no extra padding) */
  compact?: boolean
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-4" : "py-20 px-6",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface elevation-soft">
          <Icon size={24} strokeWidth={1.25} className="text-muted-foreground" />
        </div>
      )}

      <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
