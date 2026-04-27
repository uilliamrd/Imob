export const revalidate = 300

import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import Link from "next/link"
import { Building2, Home, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Construtoras",
  description: "Conheça as principais construtoras e seus empreendimentos disponíveis.",
}

export default async function ConstrutoresPage() {
  const admin = createAdminClient()

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, logo, brand_colors, hero_tagline, portfolio_desc")
    .eq("type", "construtora")
    .not("slug", "is", null)
    .order("name")

  const orgIds = (orgs ?? []).map((o) => o.id)
  const { data: propRows } = orgIds.length
    ? await admin
        .from("properties")
        .select("org_id")
        .in("org_id", orgIds)
        .eq("visibility", "publico")
        .eq("status", "disponivel")
        .limit(5000)
    : { data: [] }
  const countMap = new Map<string, number>()
  for (const row of propRows ?? []) {
    countMap.set(row.org_id, (countMap.get(row.org_id) ?? 0) + 1)
  }
  const construtoras = (orgs ?? []).map((org) => ({ ...org, availableCount: countMap.get(org.id) ?? 0 }))

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans mb-2">Portal</p>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Construtoras</h1>
          <p className="text-muted-foreground font-sans text-sm max-w-md">
            Conheça as construtoras parceiras e explore seus portfólios de imóveis.
          </p>
          <div className="mt-4 w-14 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9A96E, transparent)" }} />
        </div>

        {construtoras.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 size={28} className="mx-auto mb-3" style={{ color: "#C9A96E", opacity: 0.3 }} />
            <p className="text-muted-foreground font-sans text-sm">Nenhuma construtora cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {construtoras.map((org) => {
              const accent = org.brand_colors?.primary ?? "#C9A96E"
              return (
                <Link
                  key={org.id}
                  href={`/construtora/${org.slug}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-[#C9A96E]/40 hover:shadow-[0_4px_24px_rgba(201,169,110,0.10)] transition-all duration-300 flex flex-col"
                >
                  {/* Brand accent bar */}
                  <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Logo / Icon */}
                    <div className="mb-5">
                      {org.logo ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: accent + "15" }}>
                            <Image src={org.logo} alt={org.name} width={36} height={36} className="object-contain" />
                          </div>
                          <p className="font-serif text-base font-bold text-foreground leading-tight">{org.name}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: accent + "15" }}>
                            <Building2 size={20} style={{ color: accent }} />
                          </div>
                          <p className="font-serif text-base font-bold text-foreground leading-tight">{org.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {(org.hero_tagline || org.portfolio_desc) && (
                      <p className="text-muted-foreground font-sans text-sm leading-relaxed flex-1 line-clamp-2 mb-4">
                        {org.hero_tagline ?? org.portfolio_desc}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      {org.availableCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Home size={11} style={{ color: accent }} />
                          <span className="text-xs font-sans" style={{ color: accent }}>
                            {org.availableCount} disponível{org.availableCount !== 1 ? "is" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-sans text-muted-foreground/50">Ver portfólio</span>
                      )}
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                        style={{ color: accent + "70" }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
