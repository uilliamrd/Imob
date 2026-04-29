import { cn } from "@/lib/utils"
import { badgeVariants } from "@/lib/design-system/variants"
import type { VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

interface PremiumBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon
  children: React.ReactNode
}

export function PremiumBadge({
  variant,
  size,
  icon: Icon,
  children,
  className,
  ...props
}: PremiumBadgeProps) {
  const iconSize = size === "xs" ? 10 : size === "md" ? 12 : 11

  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {Icon && <Icon size={iconSize} strokeWidth={2} />}
      {children}
    </span>
  )
}
