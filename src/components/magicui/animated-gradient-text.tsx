"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface AnimatedGradientTextProps {
  children: ReactNode
  className?: string
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-[#E0C896] via-[#C9A96E] to-[#A8834A] bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]",
        className
      )}
      style={{
        backgroundSize: "200% auto",
        animation: "gradient-x 4s linear infinite",
      }}
    >
      {children}
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </span>
  )
}
