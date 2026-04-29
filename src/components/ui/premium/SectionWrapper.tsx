"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeUpVariants } from "@/lib/design-system/motion"

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  /** Animate children on scroll into view */
  animate?: boolean
  /** Additional top/bottom margin preset */
  spacing?: "tight" | "normal" | "loose"
}

const spacingMap = {
  tight:  "mt-6 mb-4",
  normal: "mt-8 mb-6",
  loose:  "mt-12 mb-8",
}

export function SectionWrapper({
  children,
  className,
  animate = true,
  spacing = "normal",
}: SectionWrapperProps) {
  if (!animate) {
    return (
      <section className={cn(spacingMap[spacing], className)}>
        {children}
      </section>
    )
  }

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={cn(spacingMap[spacing], className)}
    >
      {children}
    </motion.section>
  )
}
