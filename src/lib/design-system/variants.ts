import { cva } from "class-variance-authority"

// ─── Button Variants ──────────────────────────────────────────────────────────

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-sans font-medium leading-none",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-default)]/40 focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Primary action — navy blue */
        primary:
          "bg-[var(--primary-default)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]",

        /** Action CTA — sober green (save, confirm, submit, contact) */
        action:
          "bg-[var(--action-default)] text-[var(--action-foreground)] hover:bg-[var(--action-hover)] active:bg-[var(--action-active)]",

        /** Secondary — surface with border */
        secondary:
          "bg-[var(--surface-base)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-sunken)]",

        /** Ghost — no background, no border */
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]",

        /** Outline — uses primary color for border and text */
        outline:
          "border border-[var(--primary-default)] text-[var(--primary-default)] bg-transparent hover:bg-[var(--primary-subtle)]",

        /** Destructive */
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",

        /** Gold — restricted to premium/paid highlights only */
        gold:
          "bg-gradient-to-r from-[var(--gold-light)] via-[var(--gold)] to-[var(--gold-dark)] text-[#1C1C1C] font-semibold hover:brightness-105",
      },
      size: {
        xs:   "h-7  px-3   text-xs  rounded-md gap-1.5",
        sm:   "h-8  px-4   text-xs  rounded-md gap-1.5",
        md:   "h-10 px-5   text-sm  rounded-md gap-2",
        lg:   "h-12 px-6   text-sm  rounded-md gap-2",
        icon: "h-9  w-9    rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

// ─── Badge Variants ───────────────────────────────────────────────────────────

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded font-medium",
  {
    variants: {
      variant: {
        /** Neutral — default, no semantic color */
        neutral:
          "bg-[var(--surface-sunken)] text-[var(--text-tertiary)]",

        /** Success — disponível, confirmado */
        success:
          "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400",

        /** Warning — reservado, atenção */
        warning:
          "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400",

        /** Danger — vendido, expirado, erro */
        danger:
          "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400",

        /** Info — informativo */
        info:
          "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400",

        /** Premium — ÚNICO uso do ouro; plano pago, destaque comercial */
        premium:
          "badge-premium",

        /* ── Legacy aliases (keep to avoid breaking existing JSX) ── */
        /** @deprecated use "neutral" */
        muted:
          "bg-[var(--surface-sunken)] text-[var(--text-tertiary)]",

        /** @deprecated use "success" or "action" button instead */
        forest:
          "bg-[var(--action-subtle)] text-[var(--action-default)] dark:bg-[var(--action-subtle)] dark:text-[var(--action-default)]",

        /** @deprecated use "premium" */
        gold:
          "badge-premium",

        /** @deprecated use "danger" */
        destructive:
          "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400",
      },
      size: {
        xs: "text-xs px-2   py-0.5",
        sm: "text-xs px-2.5 py-1",
        md: "text-xs px-3   py-1",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  }
)

// ─── Icon Sizes ───────────────────────────────────────────────────────────────

export const iconSizes = {
  xs:    { size: 12, strokeWidth: 1.75 },
  sm:    { size: 14, strokeWidth: 1.75 },
  md:    { size: 16, strokeWidth: 1.75 },
  lg:    { size: 18, strokeWidth: 1.75 },
  xl:    { size: 20, strokeWidth: 1.5  },
  "2xl": { size: 24, strokeWidth: 1.5  },
} as const

// ─── Section Spacing ──────────────────────────────────────────────────────────

export const sectionSpacing = {
  tight:  "space-y-4",
  normal: "space-y-6",
  loose:  "space-y-8",
  wide:   "space-y-12",
} as const

// ─── Container Widths ─────────────────────────────────────────────────────────

export const container = {
  sm:    "max-w-2xl",
  md:    "max-w-3xl",
  lg:    "max-w-4xl",
  xl:    "max-w-5xl",
  "2xl": "max-w-6xl",
  portal: "max-w-[1200px]",
  full:  "max-w-full",
} as const
