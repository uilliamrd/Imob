"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/design-system/variants"
import { transitions } from "@/lib/design-system/motion"
import type { VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: LucideIcon
  iconRight?: LucideIcon
  loading?: boolean
  children: React.ReactNode
}

export function PremiumButton({
  variant,
  size,
  icon: IconLeft,
  iconRight: IconRight,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: PremiumButtonProps) {
  const iconSize = size === "xs" || size === "sm" ? 14 : size === "lg" || size === "xl" ? 18 : 16

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={transitions.snappy}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        IconLeft && <IconLeft size={iconSize} strokeWidth={1.75} />
      )}
      {children}
      {IconRight && !loading && <IconRight size={iconSize} strokeWidth={1.75} />}
    </motion.button>
  )
}
