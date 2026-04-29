"use client"

import { GitCompareArrows } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCompare, type CompareItem } from "./CompareContext"

interface Props {
  item: CompareItem
}

export function CompareToggleButton({ item }: Props) {
  const { toggle, has, canAdd } = useCompare()
  const isCompared = has(item.id)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(item)
      }}
      className={cn(
        "absolute top-3 right-3 w-7 h-7 rounded-lg border flex items-center justify-center transition-all",
        isCompared
          ? "bg-[var(--gold)] border-[var(--gold)] text-background"
          : "bg-card/80 backdrop-blur-sm border-border/60 text-muted-foreground hover:border-[var(--gold)]/60 hover:text-[var(--gold)]",
        !isCompared && !canAdd && "opacity-40 cursor-not-allowed"
      )}
      title={isCompared ? "Remover da comparação" : "Adicionar à comparação"}
    >
      <GitCompareArrows size={13} />
    </button>
  )
}
