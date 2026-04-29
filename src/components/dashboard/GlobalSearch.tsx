"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Home, MessageSquare, Building2, ArrowRight, X, CornerDownLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

interface SearchResult {
  id: string
  type: "property" | "lead" | "org"
  title: string
  subtitle?: string
  href: string
  image?: string | null
}

const QUICK_LINKS = [
  { label: "Novo imóvel",      href: "/dashboard/imoveis/novo",    icon: Home         },
  { label: "Ver leads",        href: "/dashboard/leads",           icon: MessageSquare },
  { label: "Base de imóveis",  href: "/dashboard/vitrine",         icon: Building2    },
]

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery]           = useState("")
  const [results, setResults]       = useState<SearchResult[]>([])
  const [loading, setLoading]       = useState(false)
  const [selected, setSelected]     = useState(0)
  const inputRef                    = useRef<HTMLInputElement>(null)
  const supabase                    = createClient()

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from("properties")
        .select("id, title, slug, neighborhood, city, images, status")
        .ilike("title", `%${q}%`)
        .limit(5)

      const mapped: SearchResult[] = (data ?? []).map((p) => ({
        id:       p.id,
        type:     "property",
        title:    p.title,
        subtitle: [p.neighborhood, p.city].filter(Boolean).join(", ") || undefined,
        href:     `/imovel/${p.slug}`,
        image:    (p.images as string[] | null)?.[0] ?? null,
      }))
      setResults(mapped)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const t = setTimeout(() => search(query), 280)
    return () => clearTimeout(t)
  }, [query, search])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const items = query.length >= 2 ? results : QUICK_LINKS.map((l) => ({ id: l.href, type: "property" as const, title: l.label, href: l.href }))
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown")  { e.preventDefault(); setSelected((s) => Math.min(s + 1, items.length - 1)) }
      if (e.key === "ArrowUp")    { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === "Enter" && items[selected]) {
        window.location.href = items[selected].href
        onClose()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, results, query, selected, onClose])

  const showResults = query.length >= 2

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 z-50"
          >
            <div className="bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
                <Search size={16} className="text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                  placeholder="Buscar imóveis, leads, corretores…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-sans"
                />
                {loading && (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gold/40 border-t-gold animate-spin flex-shrink-0" />
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </div>

              {/* Results or quick links */}
              <div className="max-h-[380px] overflow-y-auto">
                {!showResults && (
                  <>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans">
                      Acesso rápido
                    </p>
                    {QUICK_LINKS.map((l, i) => {
                      const Icon = l.icon
                      return (
                        <Link key={l.href} href={l.href} onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${selected === i ? "bg-muted/70" : "hover:bg-muted/40"}`}
                          onMouseEnter={() => setSelected(i)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                            <Icon size={13} className="text-gold" />
                          </div>
                          <span className="text-sm font-sans text-foreground">{l.label}</span>
                          <ArrowRight size={12} className="ml-auto text-muted-foreground/30" />
                        </Link>
                      )
                    })}
                  </>
                )}

                {showResults && results.length === 0 && !loading && (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground text-sm font-sans">Nenhum resultado para &ldquo;{query}&rdquo;</p>
                  </div>
                )}

                {showResults && results.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans">
                      Imóveis ({results.length})
                    </p>
                    {results.map((r, i) => (
                      <Link key={r.id} href={r.href} onClick={onClose} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${selected === i ? "bg-muted/70" : "hover:bg-muted/40"}`}
                        onMouseEnter={() => setSelected(i)}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {r.image
                            ? <Image src={r.image} alt={r.title} width={36} height={36} className="w-full h-full object-cover" />
                            : <Home size={14} className="m-auto mt-2.5 text-muted-foreground/30" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans text-foreground truncate">{r.title}</p>
                          {r.subtitle && <p className="text-[11px] text-muted-foreground font-sans truncate">{r.subtitle}</p>}
                        </div>
                        <ArrowRight size={12} className="text-muted-foreground/30 flex-shrink-0" />
                      </Link>
                    ))}
                  </>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-border/50 flex items-center gap-4">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 font-sans">
                  <CornerDownLeft size={10} /> selecionar
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-sans">↑↓ navegar</span>
                <span className="text-[10px] text-muted-foreground/40 font-sans">esc fechar</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
