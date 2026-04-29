"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { transitions } from "@/lib/design-system/motion"
import type { LucideIcon } from "lucide-react"

interface IntentChipProps {
  label: string
  /** Whether this chip is the currently active selection */
  active?: boolean
  icon?: LucideIcon
  onClick?: () => void
  /** Render as a link */
  href?: string
  disabled?: boolean
  className?: string
}

export function IntentChip({
  label,
  active = false,
  icon: Icon,
  onClick,
  disabled = false,
  className,
}: IntentChipProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={transitions.snappy}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
        "text-sm font-medium leading-none",
        "border transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-[var(--forest)] border-[var(--forest)] text-[var(--forest-foreground)] elevation-soft"
          : "bg-card border-border text-foreground hover:border-[var(--forest)] hover:text-[var(--forest)]",
        className
      )}
    >
      {Icon && <Icon size={13} strokeWidth={1.75} />}
      {label}
    </motion.button>
  )
}

/** Renders a group of IntentChips as a single-select filter bar */
interface IntentChipGroupProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function IntentChipGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: IntentChipGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => (
        <IntentChip
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          active={value === opt.value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  )
}
