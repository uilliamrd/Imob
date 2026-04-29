"use client"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
  bgColor?: string
}

export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  colorFrom = "#C9A96E",
  colorTo = "#E0C896",
  delay = 0,
  bgColor = "#1a1a1a",
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
          "--bg-color": bgColor,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--size)*0.01px)_solid_transparent]",
        "[background:var(--bg-color)_padding-box,linear-gradient(calc(var(--angle)*1deg),var(--color-from),var(--color-to),transparent)_border-box]",
        "[animation:border-beam_calc(var(--duration)*1s)_infinite_linear]",
        "[animation-delay:var(--delay)]",
        className
      )}
    >
      <style>{`
        @keyframes border-beam {
          to { --angle: 360; }
        }
        @property --angle {
          syntax: "<number>";
          initial-value: 0;
          inherits: false;
        }
      `}</style>
    </div>
  )
}
