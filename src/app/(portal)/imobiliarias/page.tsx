import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Building, ArrowRight } from "lucide-react"

export default async function ImobiliariasPage() {
  const admin = createAdminClient()

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, logo, brand_colors, portfolio_desc, hero_tagline")
    .eq("type", "imobiliaria")
    .order("name")

  const imobiliarias = await Promise.all(
    (orgs ?? []).map(async (org) => {
      const { count } = await admin
        .from("property_listings")
        .select("*", { count: "exact", head: true })
        .eq("org_id", org.id)
      return { ...org, listingCount: count ?? 0 }
    })
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">Portal</p>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Imobiliárias</h1>
        <p className="text-muted-foreground font-sans text-sm max-w-xl">
          Imobiliárias parceiras com portfólios curados de imóveis.
        </p>
        <div className="divider-gold mt-5 w-16" />
      </div>

      {imobiliarias.length === 0 ? (
        <div className="py-24 text-center">
          <Building size={32} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-sans text-sm">Nenhuma imobiliária cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {imobiliarias.map((org) => {
            const accent = org.brand_colors?.primary ?? "#C9A96E"
            const href = org.slug ? `/imobiliaria/${org.slug}` : "#"
            return (
              <div
                key={org.id}
                className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-gold/30 flex flex-col"
              >
                <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent + "20" }}>
                      <Building size={16} style={{ color: accent }} />
                    </div>
                    <p className="font-serif text-lg font-bold text-foreground leading-tight">{org.name}</p>
                  </div>

                  {(org.hero_tagline || org.portfolio_desc) && (
                    <p className="text-muted-foreground font-sans text-sm leading-relaxed flex-1 line-clamp-2">
                      {org.hero_tagline ?? org.portfolio_desc}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    {org.listingCount > 0 ? (
                      <span className="text-xs font-sans text-muted-foreground">
                        {org.listingCount} imóvel{org.listingCount !== 1 ? "is" : ""} no catálogo
                      </span>
                    ) : (
                      <span className="text-xs font-sans text-muted-foreground/40">Parceira do portal</span>
                    )}
                    {org.slug && (
                      <Link href={href} className="flex items-center gap-1 text-xs font-sans text-gold/60 hover:text-gold transition-colors">
                        Ver <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
