import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import Link from "next/link"
import { Building2, Home, ArrowRight } from "lucide-react"

export default async function ConstrutoresPage() {
  const admin = createAdminClient()

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, logo, brand_colors, hero_tagline, portfolio_desc")
    .eq("type", "construtora")
    .not("slug", "is", null)
    .order("name")

  const construtoras = await Promise.all(
    (orgs ?? []).map(async (org) => {
      const { count } = await admin
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("org_id", org.id)
        .eq("visibility", "publico")
        .eq("status", "disponivel")
      return { ...org, availableCount: count ?? 0 }
    })
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">Portal</p>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Construtoras</h1>
        <p className="text-muted-foreground font-sans text-sm max-w-xl">
          Conheça as construtoras parceiras e explore seus portfólios de imóveis.
        </p>
        <div className="divider-gold mt-5 w-16" />
      </div>

      {construtoras.length === 0 ? (
        <div className="py-24 text-center">
          <Building2 size={32} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-sans text-sm">Nenhuma construtora cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {construtoras.map((org) => {
            const accent = org.brand_colors?.primary ?? "#C9A96E"
            return (
              <Link
                key={org.id}
                href={`/construtora/${org.slug}`}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300 flex flex-col"
              >
                <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-5">
                    {org.logo ? (
                      <Image src={org.logo} alt={org.name} width={140} height={36} className="h-9 w-auto object-contain" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "20" }}>
                          <Building2 size={18} style={{ color: accent }} />
                        </div>
                        <p className="font-serif text-lg font-bold text-foreground">{org.name}</p>
                      </div>
                    )}
                    {org.logo && (
                      <p className="font-serif text-lg font-bold text-foreground mt-3">{org.name}</p>
                    )}
                  </div>

                  {(org.hero_tagline || org.portfolio_desc) && (
                    <p className="text-muted-foreground font-sans text-sm leading-relaxed flex-1 line-clamp-2">
                      {org.hero_tagline ?? org.portfolio_desc}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    {org.availableCount > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Home size={11} style={{ color: accent }} />
                        <span className="text-xs font-sans" style={{ color: accent }}>
                          {org.availableCount} disponível{org.availableCount !== 1 ? "is" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-sans text-muted-foreground/40">Ver portfólio</span>
                    )}
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground/20 group-hover:translate-x-1 transition-transform"
                      style={{ color: accent + "80" }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
