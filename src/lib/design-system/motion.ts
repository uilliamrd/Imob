import type { Transition, Variants } from "framer-motion"

// ─── Transitions ─────────────────────────────────────────────────────────────

export const transitions = {
  /** Snappy UI response (buttons, badges, icon states) */
  snappy: { type: "spring", stiffness: 400, damping: 30 } satisfies Transition,

  /** Smooth page-level or panel entrance */
  smooth: { type: "spring", stiffness: 260, damping: 24 } satisfies Transition,

  /** Slow editorial reveal (hero sections, modals) */
  editorial: { type: "spring", stiffness: 180, damping: 20 } satisfies Transition,

  /** Pure CSS-style tween for opacity/color */
  fade: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } satisfies Transition,

  /** Staggered list children */
  list: { staggerChildren: 0.06, delayChildren: 0.05 } satisfies Transition,
} as const

// ─── Reusable Variants ────────────────────────────────────────────────────────

/** Simple fade in/out */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.fade },
  exit: { opacity: 0, transition: transitions.fade },
}

/** Fade + rise from below (cards, list items) */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: 8, transition: transitions.fade },
}

/** Fade + drop from above (dropdowns, tooltips) */
export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: -6, transition: transitions.fade },
}

/** Scale in from center (modals, popovers) */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: transitions.smooth },
  exit: { opacity: 0, scale: 0.96, transition: transitions.fade },
}

/** Stagger container — applies staggerChildren to immediate children */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: transitions.list },
}

/** List item (pair with staggerContainerVariants on parent) */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
}

// ─── Hover Effects (pass directly to motion.* props) ─────────────────────────

export const hoverEffects = {
  /** Cards: subtle lift + shadow upgrade */
  lift: {
    whileHover: { y: -2, boxShadow: "var(--shadow-premium)" },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },

  /** Buttons/chips: scale pop */
  scale: {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: transitions.snappy,
  },

  /** Icon buttons: glow ring */
  glow: {
    whileHover: { scale: 1.08, filter: "brightness(1.15)" },
    whileTap: { scale: 0.95 },
    transition: transitions.snappy,
  },
} as const
