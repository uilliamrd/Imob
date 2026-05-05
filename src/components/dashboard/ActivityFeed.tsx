"use client"

import { motion } from "framer-motion"
import { listItemVariants, staggerContainerVariants } from "@/lib/design-system/motion"
import type { LucideIcon } from "lucide-react"

export interface ActivityItem {
  id: string
  icon: LucideIcon
  iconColor?: string
  title: string
  description?: string
  time: string
  read?: boolean
}

interface Props {
  items: ActivityItem[]
  loading?: boolean
  maxItems?: number
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 py-3">
      <div className="skeleton-luxury h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5 py-1">
        <div className="skeleton-luxury h-3 w-3/4 rounded" />
        <div className="skeleton-luxury h-2.5 w-1/2 rounded" />
      </div>
    </div>
  )
}

export function ActivityFeed({ items, loading = false, maxItems }: Props) {
  const displayed = maxItems ? items.slice(0, maxItems) : items

  if (loading) {
    return (
      <div className="divide-y divide-border/40">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (!displayed.length) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8 font-sans">
        Nenhuma atividade recente.
      </p>
    )
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="relative pl-5"
    >
      {/* Connector line */}
      <div className="absolute left-[13px] top-4 bottom-4 w-px bg-[var(--border-subtle)] pointer-events-none" />

      {displayed.map((item) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.id}
            variants={listItemVariants}
            className={`relative flex gap-3 py-3 -ml-5 pl-5 pr-0 rounded-xl transition-colors ${
              !item.read ? "bg-muted/30" : ""
            }`}
          >
            {/* Icon dot */}
            <div
              className="relative shrink-0 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center z-10"
              style={item.iconColor ? { borderColor: `${item.iconColor}30`, backgroundColor: `${item.iconColor}10` } : {}}
            >
              <Icon
                size={12}
                strokeWidth={1.75}
                style={item.iconColor ? { color: item.iconColor } : { color: "var(--muted-foreground)" }}
              />
              {!item.read && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-card" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[13px] font-medium text-foreground font-sans leading-snug line-clamp-1">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[11px] text-muted-foreground font-sans mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground/60 font-sans mt-1">{item.time}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
