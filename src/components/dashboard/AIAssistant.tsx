"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, ArrowRight, FileText, Home, TrendingUp, MessageSquare, Megaphone } from "lucide-react"
import Link from "next/link"

const SUGGESTIONS = [
  { icon: Home,        label: "Cadastrar novo imóvel",       href: "/dashboard/imoveis/novo"    },
  { icon: FileText,    label: "Editar meu minisite",          href: "/dashboard/minisite"        },
  { icon: TrendingUp,  label: "Ver analytics",               href: "/dashboard/analytics"       },
  { icon: MessageSquare, label: "Ver leads recebidos",        href: "/dashboard/leads"           },
  { icon: Megaphone,   label: "Ver anúncios",                href: "/dashboard/anuncios"        },
]

export function AIAssistant() {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState("")
  const panelRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:block" ref={panelRef}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="absolute bottom-14 right-0 w-80 bg-card border border-border/70 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 bg-gradient-to-r from-gold/8 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <Sparkles size={12} className="text-gold" />
                </div>
                <div>
                  <p className="text-[11px] font-sans font-semibold text-foreground">Intelligence</p>
                  <p className="text-[9px] text-muted-foreground/60 font-sans uppercase tracking-wider">Assistente IA</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Prompt */}
            <div className="px-4 py-4">
              <p className="text-xs text-muted-foreground font-sans mb-3">Como posso ajudar hoje?</p>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: crie um anúncio para meu imóvel…"
                  className="flex-1 text-[11px] font-sans bg-muted/50 border border-border/60 rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-gold/40 transition-colors"
                />
                <button className="px-3 py-2.5 bg-gold text-[#0F0F0F] rounded-xl hover:bg-gold-light transition-colors flex-shrink-0">
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-4 space-y-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-sans mb-2">Sugestões</p>
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <Link key={s.href} href={s.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors group"
                  >
                    <Icon size={13} className="text-muted-foreground/50 group-hover:text-gold transition-colors flex-shrink-0" />
                    <span className="text-[11px] font-sans text-foreground/70 group-hover:text-foreground transition-colors">{s.label}</span>
                    <ArrowRight size={10} className="ml-auto text-muted-foreground/20 group-hover:text-gold/50 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
          open
            ? "bg-foreground text-background shadow-black/20"
            : "bg-gradient-to-br from-gold to-gold-dark text-[#0F0F0F] shadow-gold/30 hover:shadow-gold/50"
        }`}
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
      </motion.button>
    </div>
  )
}
