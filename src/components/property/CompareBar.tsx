"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { X, ArrowRight, Maximize2 } from "lucide-react"
import { useCompare } from "./CompareContext"
import { PremiumButton } from "@/components/ui/premium/PremiumButton"

export function CompareBar() {
  const { items, remove, clear } = useCompare()

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-[var(--gold)]/30 px-4 py-3 lg:px-8 lg:py-4 shadow-2xl"
        >
          <div className="max-w-6xl mx-auto flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl overflow-hidden border border-[var(--gold)]/30 bg-muted">
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Maximize2 size={14} className="text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center hover:bg-destructive hover:border-destructive hover:text-white transition-colors"
                  >
                    <X size={8} />
                  </button>
                </motion.div>
              ))}

              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl border border-dashed border-border flex-shrink-0 flex items-center justify-center"
                >
                  <span className="text-[10px] text-muted-foreground/40 font-sans hidden lg:block">+</span>
                </div>
              ))}

              <div className="ml-2 hidden lg:block min-w-0">
                <p className="text-xs font-sans text-foreground font-medium">
                  {items.length} de 3 imóveis selecionados
                </p>
                <p className="text-[11px] text-muted-foreground font-sans">
                  {items.length < 2 ? "Selecione ao menos 2 para comparar" : "Pronto para comparar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={clear}
                className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors hidden lg:block"
              >
                Limpar
              </button>
              {items.length >= 2 ? (
                <Link href={`/comparar?ids=${items.map((i) => i.id).join(",")}`}>
                  <PremiumButton variant="gold" size="sm" className="flex items-center gap-1.5">
                    Comparar <ArrowRight size={13} />
                  </PremiumButton>
                </Link>
              ) : (
                <PremiumButton variant="gold" size="sm" disabled className="flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  Comparar <ArrowRight size={13} />
                </PremiumButton>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
