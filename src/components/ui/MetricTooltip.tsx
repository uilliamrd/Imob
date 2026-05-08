"use client"

import { Info } from "lucide-react"

interface MetricTooltipProps {
  label: string
  tooltip: string
}

export function MetricTooltip({ label, tooltip }: MetricTooltipProps) {
  return (
    <span className="inline-flex items-center gap-1 group/tip">
      <span>{label}</span>
      <span className="relative flex-shrink-0">
        <Info
          size={12}
          className="text-muted-foreground/40 cursor-help transition-colors group-hover/tip:text-muted-foreground/70"
        />
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-popover border border-border shadow-xl px-3 py-2.5 text-popover-foreground text-xs font-sans font-normal normal-case tracking-normal leading-relaxed opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity duration-150 whitespace-normal">
          {tooltip}
        </span>
      </span>
    </span>
  )
}
