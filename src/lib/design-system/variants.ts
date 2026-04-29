import { cva } from "class-variance-authority"

// ─── Button Variants ──────────────────────────────────────────────────────────

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium leading-none tracking-wide",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-40",
    "cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Primary action — forest green fill */
        primary:
          "bg-[var(--forest)] text-[var(--forest-foreground)] hover:bg-[color-mix(in_srgb,var(--forest)_90%,black)] elevation-soft hover:elevation-card",

        /** Gold accent — use sparingly for premium CTAs */
        gold:
          "bg-gradient-to-r from-[var(--gold-light)] via-[var(--gold)] to-[var(--gold-dark)] text-[#1C1C1C] font-semibold hover:brightness-105 elevation-card",

        /** Outlined with forest border */
        outline:
          "border border-[var(--forest)] text-[var(--forest)] bg-transparent hover:bg-[color-mix(in_srgb,var(--forest)_8%,transparent)]",

        /** Ghost — no border, subtle hover */
        ghost:
          "bg-transparent text-foreground hover:bg-[var(--surface)]",

        /** Destructive */
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 elevation-soft",

        /** Secondary neutral */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        xs:  "h-7  px-3   text-xs  rounded-md  gap-1.5",
        sm:  "h-8  px-3.5 text-sm  rounded-lg  gap-1.5",
        md:  "h-10 px-4   text-sm  rounded-xl  gap-2",
        lg:  "h-11 px-6   text-base rounded-xl gap-2.5",
        xl:  "h-13 px-8   text-lg  rounded-2xl gap-3",
        icon: "h-9 w-9    rounded-xl",
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
  "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        gold:        "badge-premium",
        forest:      "bg-[var(--forest)] text-[var(--forest-foreground)]",
        outline:     "border border-border text-foreground bg-transparent",
        muted:       "bg-muted text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
        success:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning:     "bg-amber-50 text-amber-700 border border-amber-200",
      },
      size: {
        xs: "text-[0.625rem] px-2 py-0.5",
        sm: "text-[0.6875rem] px-2.5 py-0.5",
        md: "text-xs px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "muted",
      size: "sm",
    },
  }
)

// ─── Icon Sizes ───────────────────────────────────────────────────────────────

/** Standard Lucide icon size map */
export const iconSizes = {
  xs:  { size: 12, strokeWidth: 1.75 },
  sm:  { size: 14, strokeWidth: 1.75 },
  md:  { size: 16, strokeWidth: 1.75 },
  lg:  { size: 18, strokeWidth: 1.75 },
  xl:  { size: 20, strokeWidth: 1.5  },
  "2xl": { size: 24, strokeWidth: 1.5  },
} as const

// ─── Section Spacing ──────────────────────────────────────────────────────────

/** Vertical spacing tokens for section stacking */
export const sectionSpacing = {
  tight:  "space-y-4",
  normal: "space-y-6",
  loose:  "space-y-8",
  wide:   "space-y-12",
} as const

// ─── Container Widths ─────────────────────────────────────────────────────────

export const container = {
  sm:   "max-w-2xl",
  md:   "max-w-3xl",
  lg:   "max-w-4xl",
  xl:   "max-w-5xl",
  "2xl": "max-w-6xl",
  full: "max-w-full",
} as const
