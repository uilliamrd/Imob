"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AgencyCard } from "./AgencyCard"
import type { PortalOrg } from "@/types/portal"

interface Props {
  agencies: PortalOrg[]
}

export function FeaturedAgencies({ agencies }: Props) {
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

  useEffect(() => {
    const el = scrollRef.current
    if (!el || agencies.length <= 4) return
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 240, behavior: "smooth" })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [agencies.length])

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" })
  }

  if (!agencies.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-sans mb-1">Rede de parceiros</p>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Imobiliárias verificadas</h2>
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
            href="/imobiliarias"
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
        {agencies.map((org) => (
          <div key={org.id} className="snap-start shrink-0">
            <AgencyCard org={org} />
          </div>
        ))}
      </div>
    </section>
  )
}
