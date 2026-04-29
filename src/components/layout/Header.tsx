"use client"

import { useState } from "react"
import Link from "next/link"
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion"
import { Heart, Menu, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/design-system/variants"

const NAV_LINKS = [
  { label: "Comprar",      href: "/?tab=comprar" },
  { label: "Alugar",       href: "/?tab=alugar" },
  { label: "Lançamentos",  href: "/?tab=lancamentos" },
  { label: "Construtoras", href: "/construtoras" },
  { label: "Imobiliárias", href: "/imobiliarias" },
]

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" aria-label="Base Imob — página inicial" className="flex items-baseline gap-0">
      <span className={cn("font-serif text-xl font-bold", inverted ? "text-[var(--forest-foreground)]" : "text-foreground")}>
        Base
      </span>
      <span className="font-serif text-xl font-bold text-[var(--gold)]">Imob</span>
    </Link>
  )
}

export function Header() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 60))

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--forest)] focus:text-[var(--forest-foreground)] focus:rounded-lg focus:text-sm"
      >
        Ir para o conteúdo
      </a>

      <motion.header
        animate={scrolled
          ? { backdropFilter: "blur(12px)" }
          : { backdropFilter: "blur(0px)" }
        }
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          scrolled
            ? "bg-card/95 border-b border-border shadow-sm"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden md:flex items-center gap-0.5" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[var(--gold)] transition-colors duration-150 rounded-lg hover:bg-[var(--gold)]/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/favoritos"
              aria-label="Meus favoritos"
              className="p-2 rounded-lg text-muted-foreground hover:text-[var(--gold)] hover:bg-[var(--gold)]/5 transition-colors"
            >
              <Heart size={18} strokeWidth={1.75} />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Entrar
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "gold", size: "sm" }))}>
              Anunciar
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-72 bg-card border-l border-border flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <Logo />
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fechar menu"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 py-3 overflow-y-auto" aria-label="Menu mobile">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={14} className="text-muted-foreground/40" />
                  </Link>
                ))}
              </nav>

              <div className="p-5 border-t border-border space-y-2">
                <Link href="/login" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>
                  Entrar
                </Link>
                <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants({ variant: "gold", size: "sm" }), "w-full justify-center")}>
                  Anunciar imóvel
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
