import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import Link from "next/link"
import { Building2, Home, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Imobiliárias",
  description: "Imobiliárias parceiras com portfólio especializado em imóveis de alto padrão.",
}

export default async function ImobiliariasPage() {
  const admin = createAdminClient()

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, logo, brand_colors, portfolio_desc, hero_tagline")
    .eq("type", "imobiliaria")
    .not("slug", "is", null)
    .order("name")

  const imobiliarias = await Promise.all(
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
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A96E] font-sans mb-2">Portal</p>
          <h1 className="font-serif text-3xl font-bold text-[#1C1C1C] mb-2">Imobiliárias</h1>
          <p className="text-[#8B7355] font-sans text-sm max-w-md">
            Imobiliárias parceiras com portfólios curados de imóveis selecionados.
          </p>
          <div className="mt-4 w-14 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9A96E, transparent)" }} />
        </div>

        {imobiliarias.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 size={28} className="mx-auto mb-3" style={{ color: "#C9A96E", opacity: 0.3 }} />
            <p className="text-[#8B7355] font-sans text-sm">Nenhuma imobiliária cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imobiliarias.map((org) => {
              const accent = org.brand_colors?.primary ?? "#C9A96E"
              const href = org.slug ? `/imobiliaria/${org.slug}` : "#"
              return (
                <Link
                  key={org.id}
                  href={href}
                  className="group bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden hover:border-[#C9A96E]/40 hover:shadow-[0_4px_24px_rgba(201,169,110,0.10)] transition-all duration-300 flex flex-col"
                >
                  <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-5">
                      {org.logo ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: accent + "15" }}>
                            <Image src={org.logo} alt={org.name} width={36} height={36} className="object-contain" />
                          </div>
                          <p className="font-serif text-base font-bold text-[#1C1C1C] leading-tight">{org.name}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: accent + "15" }}>
                            <Building2 size={20} style={{ color: accent }} />
                          </div>
                          <p className="font-serif text-base font-bold text-[#1C1C1C] leading-tight">{org.name}</p>
                        </div>
                      )}
                    </div>

                    {(org.hero_tagline || org.portfolio_desc) && (
                      <p className="text-[#8B7355] font-sans text-sm leading-relaxed flex-1 line-clamp-2 mb-4">
                        {org.hero_tagline ?? org.portfolio_desc}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#F0EBE3]">
                      {org.availableCount > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Home size={11} style={{ color: accent }} />
                          <span className="text-xs font-sans" style={{ color: accent }}>
                            {org.availableCount} disponível{org.availableCount !== 1 ? "is" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-sans text-[#8B7355]/50">Parceira do portal</span>
                      )}
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" style={{ color: accent + "70" }} />
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
