import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, Home } from "lucide-react"

export default async function HomePage() {
  const admin = createAdminClient()

  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name, slug, logo, brand_colors, hero_tagline, portfolio_desc")
    .eq("type", "construtora")
    .not("slug", "is", null)

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

  // Show demo construtora if no real ones yet
  const showDemo = construtoras.length === 0

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(201,169,110,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="relative text-center max-w-3xl mx-auto">
          <div className="divider-gold mb-12 mx-auto w-20" />

          <p className="text-xs uppercase tracking-[0.4em] text-gold font-sans mb-6">
            RealState Intelligence
          </p>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.05]">
            Plataforma Imobiliária
            <span className="block italic text-gradient-gold mt-1">de Alto Padrão</span>
          </h1>

          <div className="divider-gold my-10 mx-auto w-16" />

          <p className="text-muted-foreground font-sans text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            Conectamos construtoras e corretores para apresentar imóveis de forma ágil, sofisticada e rastreável.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-graphite text-offwhite hover:bg-gold hover:text-graphite transition-all duration-500 text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
            >
              Acessar o Sistema <ArrowRight size={14} />
            </Link>
            <Link
              href="/construtora/meridian"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground hover:border-gold hover:text-gold transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
            >
              Ver Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Construtoras Parceiras ───────────────────────────── */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">Portfólio</p>
            <h2 className="font-serif text-4xl font-bold text-white">Construtoras Parceiras</h2>
            <div className="divider-gold mt-6 mx-auto w-16" />
          </div>

          {(construtoras.length > 0 || showDemo) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {construtoras.map((org) => {
                const accentColor = org.brand_colors?.primary ?? "#C4A052"
                return (
                  <Link
                    key={org.id}
                    href={`/construtora/${org.slug}`}
                    className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 flex flex-col"
                  >
                    {/* Color accent bar */}
                    <div className="h-0.5 w-full" style={{ backgroundColor: accentColor }} />

                    <div className="p-8 flex flex-col flex-1">
                      {/* Logo or name */}
                      <div className="mb-6">
                        {org.logo ? (
                          <Image src={org.logo} alt={org.name} width={160} height={40} className="h-10 w-auto object-contain" />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + "20" }}>
                              <Building2 size={18} style={{ color: accentColor }} />
                            </div>
                            <p className="font-serif text-xl font-bold text-white">{org.name}</p>
                          </div>
                        )}
                        {org.logo && (
                          <p className="font-serif text-xl font-bold text-white mt-3">{org.name}</p>
                        )}
                      </div>

                      {/* Tagline */}
                      {(org.hero_tagline || org.portfolio_desc) && (
                        <p className="text-white/40 font-sans text-sm leading-relaxed flex-1 line-clamp-2">
                          {org.hero_tagline ?? org.portfolio_desc}
                        </p>
                      )}

                      {/* Stats + CTA */}
                      <div className="mt-6 flex items-center justify-between">
                        {org.availableCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Home size={12} style={{ color: accentColor }} />
                            <span className="text-xs font-sans" style={{ color: accentColor }}>
                              {org.availableCount} {org.availableCount === 1 ? "unidade disponível" : "unidades disponíveis"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-sans text-white/20">Ver portfólio</span>
                        )}
                        <ArrowRight
                          size={14}
                          className="text-white/20 group-hover:translate-x-1 transition-transform"
                          style={{ color: accentColor + "80" }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Demo placeholder when no real construtoras */}
              {showDemo && (
                <Link
                  href="/construtora/meridian"
                  className="group relative bg-[#111] border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/25 transition-all duration-300 flex flex-col"
                >
                  <div className="h-0.5 w-full bg-gold" />
                  <div className="p-8 flex flex-col flex-1">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/10">
                        <Building2 size={18} className="text-gold" />
                      </div>
                      <p className="font-serif text-xl font-bold text-white">Construtora Meridian</p>
                    </div>
                    <p className="text-white/40 font-sans text-sm leading-relaxed flex-1">
                      Onde a Excelência se Encontra com o Lar — demonstração da plataforma.
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xs font-sans text-gold">5 unidades disponíveis</span>
                      <ArrowRight size={14} className="text-gold/40 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Corretores ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Para Corretores</p>
            <h3 className="font-serif text-3xl font-bold text-foreground">
              Apresente imóveis de forma profissional.
            </h3>
            <p className="text-muted-foreground font-sans text-base mt-3 max-w-md">
              Acesse o portfólio das construtoras, crie seleções personalizadas e compartilhe com seus clientes pelo seu minisite rastreável.
            </p>
          </div>
          <Link
            href="/login"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-graphite text-offwhite hover:bg-gold hover:text-graphite transition-all duration-500 text-xs uppercase tracking-[0.2em] font-sans rounded-sm whitespace-nowrap"
          >
            Quero Acesso <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </main>
  )
}
