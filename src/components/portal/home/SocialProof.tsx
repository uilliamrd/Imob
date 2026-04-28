"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Building2, Star } from "lucide-react"
import type { PortalOrg } from "@/app/(portal)/page"

interface Props {
  construtoras: PortalOrg[]
  imobiliarias: PortalOrg[]
  totalProperties: number
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1200
          const steps = 40
          const increment = end / steps
          let current = 0
          const timer = setInterval(() => {
            current = Math.min(current + increment, end)
            setCount(Math.round(current))
            if (current >= end) clearInterval(timer)
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [end])

  return <span ref={ref}>{count}{suffix}</span>
}

export function SocialProof({ construtoras, imobiliarias, totalProperties }: Props) {
  const allOrgs = [...construtoras, ...imobiliarias]
  const orgsWithLogos = allOrgs.filter((o) => o.logo)
  const logosRow = orgsWithLogos.length > 0 ? [...orgsWithLogos, ...orgsWithLogos] : []

  const stats = [
    { label: "Imóveis",    value: totalProperties,                      suffix: "+" },
    { label: "Parceiros",  value: allOrgs.length,                       suffix: "+" },
    { label: "Cidades",    value: 5,                                    suffix: "+" },
    { label: "Avaliação",  value: 5,                                    suffix: "★" },
  ]

  return (
    <section className="py-16 border-t border-border overflow-hidden">
      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-1">
                {s.suffix === "★"
                  ? <span className="flex items-center justify-center gap-1 text-gold"><Star size={28} className="fill-gold" /> {s.value}{s.suffix}</span>
                  : <CountUp end={s.value} suffix={s.suffix} />
                }
              </p>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-sans">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logo marquee */}
      {logosRow.length > 0 && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-8 items-center"
            style={{
              animation: "marquee 28s linear infinite",
              width: "max-content",
            }}
          >
            {logosRow.map((org, i) => (
              <div
                key={`${org.id}-${i}`}
                className="flex-shrink-0 h-10 w-24 flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity"
              >
                {org.logo ? (
                  <Image
                    src={org.logo}
                    alt={org.name}
                    width={80}
                    height={32}
                    className="object-contain max-h-8 w-auto"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-sans text-muted-foreground truncate">{org.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
