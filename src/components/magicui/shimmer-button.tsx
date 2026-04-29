"use client"

import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  shimmerColor?: string
  background?: string
  borderRadius?: string
  className?: string
}

export function ShimmerButton({
  children,
  shimmerColor = "#C9A96E",
  background = "#1C1C1C",
  borderRadius = "0px",
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-8 py-3 text-white",
        "transition-all duration-300",
        className
      )}
      style={{ background, borderRadius }}
      {...props}
    >
      {/* Shimmer layer */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${shimmerColor}40 10%, transparent 20%)`,
          }}
        />
      </div>
      {/* Border shimmer */}
      <div
        className="absolute inset-[1px] z-10 transition-colors duration-300"
        style={{ background, borderRadius }}
      />
      {/* Content */}
      <span className="relative z-20 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-sans">
        {children}
      </span>
    </button>
  )
}
