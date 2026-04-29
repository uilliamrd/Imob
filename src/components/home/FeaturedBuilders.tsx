"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BuilderCard } from "./BuilderCard"
import type { PortalOrg } from "@/app/(portal)/page"

interface Props {
  construtoras: PortalOrg[]
}

export function FeaturedBuilders({ construtoras }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    return () => el.removeEventListener("scroll", checkScroll)
  }, [])

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" })
  }

  if (!construtoras.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-sans mb-1">Parceiros Premium</p>
          <h2 className="font-serif text-xl font-semibold text-foreground">Grandes projetos começam aqui</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-[var(--gold)]/40 hover:text-[var(--gold)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Próximo"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-[var(--gold)]/40 hover:text-[var(--gold)] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <Link
            href="/construtoras"
            className="text-sm font-medium text-muted-foreground hover:text-[var(--gold)] transition-colors"
          >
            Ver todas →
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
      >
        {construtoras.map((org) => (
          <div key={org.id} className="snap-start shrink-0 w-56">
            <BuilderCard org={org} />
          </div>
        ))}
      </div>
    </section>
  )
}
