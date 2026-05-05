"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Building2, MapPin, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Development } from "@/types/database"

interface Props {
  developments: Development[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
}

export function DevelopmentPickerModal({ developments, selectedId, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const filtered = query.trim()
    ? developments.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        (d.neighborhood ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (d.city ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : developments

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-[var(--graphite)] border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[var(--gold)]" />
            <p className="font-sans font-medium text-sm text-foreground">Vincular a empreendimento</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, bairro ou cidade..."
              className="w-full bg-card border border-border text-foreground placeholder-muted-foreground/40 pl-9 pr-4 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-[var(--gold)]/40 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 py-1">
          {/* Clear selection */}
          {selectedId && (
            <button
              onClick={() => { onSelect(""); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-card transition-colors text-muted-foreground text-sm font-sans border-b border-border/50"
            >
              <X size={14} className="shrink-0" />
              Remover vínculo (imóvel avulso)
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground font-sans">
              Nenhum empreendimento encontrado
            </div>
          ) : (
            filtered.map((dev) => {
              const isSelected = dev.id === selectedId
              return (
                <button
                  key={dev.id}
                  onClick={() => { onSelect(dev.id); onClose() }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-card transition-colors",
                    isSelected && "bg-[var(--forest)]/10"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-[var(--forest)]/20" : "bg-card"
                  )}>
                    <Building2 size={14} className={isSelected ? "text-[var(--forest)]" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-sans font-medium leading-tight", isSelected ? "text-[var(--forest)]" : "text-foreground")}>
                      {dev.name}
                    </p>
                    {(dev.neighborhood || dev.city) && (
                      <p className="text-xs font-sans text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin size={10} className="shrink-0" />
                        {[dev.neighborhood, dev.city].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {isSelected && <Check size={15} className="text-[var(--forest)] shrink-0" />}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border shrink-0">
          <p className="text-[10px] font-sans text-muted-foreground text-center">
            Para cadastrar novos empreendimentos, acesse{" "}
            <a href="/dashboard/empreendimentos" target="_blank" className="text-[var(--gold)] hover:underline">
              Empreendimentos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
