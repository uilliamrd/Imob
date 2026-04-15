import { notFound } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { BentoGallery } from "@/components/property/BentoGallery"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { LeadCaptureForm } from "@/components/property/LeadCaptureForm"
import { Footer } from "@/components/landing/Footer"
import { getTagInfo } from "@/lib/tag-icons"
import { BedDouble, Car, Maximize2, MapPin, Building2, ArrowLeft, ExternalLink } from "lucide-react"
import type { Property, Organization, Development } from "@/types/database"
import Link from "next/link"

// ── Fallback mock (dev only) ─────────────────────────────────────────────────
const MOCK: Property = {
  id: "1", title: "Torre A — Apt 1201",
  description: "Apartamento de alto padrão com vista privilegiada para o mar. Acabamentos importados, automação residencial completa e lazer exclusivo no rooftop.",
  price: 2_850_000,
  features: { suites: 4, vagas: 3, area_m2: 198, andar: 12, banheiros: 5 },
  tags: ["VM", "MD", "AL", "SM"],
  status: "disponivel", visibility: "publico",
  created_by: "1", org_id: "1", development_id: null, images: [],
  video_url: null, address: "Av. Delfim Moreira, 1200",
  neighborhood: "Leblon", city: "Rio de Janeiro",
  slug: "torre-a-apt-1201", created_at: "", updated_at: "",
  cep: null, categoria: null, tipo_negocio: "venda", bairro_id: null, logradouro_id: null,
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string }>
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

async function getProperty(slug: string): Promise<{
  property: Property
  org: Organization | null
  development: Development | null
  adminWhatsapp: string | null
}> {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data } = await supabase
      .from("properties")
      .select("*, organization:organizations(*)")
      .eq("slug", slug)
      .single()

    if (!data) return { property: MOCK, org: null, development: null, adminWhatsapp: null }

    const { organization, ...rest } = data as Property & { organization: Organization }
    const property = rest as Property

    // Fetch development if linked
    let development: Development | null = null
    if (property.development_id) {
      const { data: dev } = await admin
        .from("developments")
        .select("id, name, address, neighborhood, city, cover_image")
        .eq("id", property.development_id)
        .single()
      development = (dev as Development | null) ?? null
    }

    // Admin WhatsApp as last-resort fallback
    const { data: adminProfile } = await admin
      .from("profiles")
      .select("whatsapp")
      .eq("role", "admin")
      .not("whatsapp", "is", null)
      .limit(1)
      .maybeSingle()

    return {
      property,
      org: organization ?? null,
      development,
      adminWhatsapp: adminProfile?.whatsapp ?? null,
    }
  } catch {
    if (slug === MOCK.slug) return { property: MOCK, org: null, development: null, adminWhatsapp: null }
    return { property: MOCK, org: null, development: null, adminWhatsapp: null }
  }
}

const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível", reserva: "Em Negociação", vendido: "Vendido",
}
const STATUS_COLOR: Record<string, string> = {
  disponivel: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  reserva: "text-amber-400 bg-amber-900/20 border-amber-700/40",
  vendido: "text-zinc-500 bg-zinc-800 border-zinc-700/40",
}

export default async function ImovelPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { ref } = await searchParams
  const { property, org, development, adminWhatsapp } = await getProperty(slug)

  if (!property) notFound()

  const isConstrutora = org?.type === "construtora"
  const accentColor = isConstrutora ? (org?.brand_colors?.primary ?? "#C4A052") : "#C4A052"

  // WhatsApp priority: corretor (via ref/cookie, resolved client-side) > org > admin > fallback
  const fallbackWhatsapp = org?.whatsapp ?? adminWhatsapp ?? "5521999999999"
  const orgName = org?.name ?? "Consultor Especialista"

  return (
    <main className="min-h-screen bg-background">

      {/* ── Sticky top nav ─────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[rgba(253,250,244,0.85)] backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <Link
          href={isConstrutora && org?.slug ? `/construtora/${org.slug}` : "/"}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans"
        >
          <ArrowLeft size={14} />
          {org?.name ?? "Início"}
        </Link>
        <div className="flex items-center gap-4">
          <span className={`text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider font-sans ${STATUS_COLOR[property.status] ?? ""}`}>
            {STATUS_LABEL[property.status] ?? property.status}
          </span>
          <span className="font-serif text-xl font-bold text-foreground">
            {formatPrice(property.price)}
          </span>
        </div>
      </nav>

      {/* ── Construtora brand bar ──────────────────────────── */}
      {isConstrutora && (
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${accentColor}20`, backgroundColor: accentColor + "08" }}
        >
          <div className="flex items-center gap-3">
            {org?.logo ? (
              <Image src={org.logo} alt={org.name} width={120} height={28} className="h-7 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 size={14} style={{ color: accentColor }} />
                <span className="font-serif text-sm font-semibold text-foreground">{org?.name}</span>
              </div>
            )}
            {development && (
              <>
                <span className="text-foreground/20 text-sm">·</span>
                <span className="text-sm font-sans text-foreground/60">{development.name}</span>
              </>
            )}
          </div>
          {isConstrutora && org?.slug && (
            <a
              href={`/construtora/${org.slug}`}
              className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-[0.15em] transition-colors"
              style={{ color: accentColor + "99" }}
            >
              Ver todos os imóveis <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ── Bento Gallery ──────────────────────────────────── */}
        <BentoGallery images={property.images} title={property.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16">

          {/* ── Left: Details ──────────────────────────────── */}
          <div className="lg:col-span-2">
            <p className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-3">
              {property.neighborhood && `${property.neighborhood} · `}{property.city}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {property.title}
            </h1>

            {property.address && (
              <div className="flex items-center gap-2 text-muted-foreground mb-8">
                <MapPin size={13} className="text-gold flex-shrink-0" />
                <span className="font-sans text-sm">{property.address}</span>
              </div>
            )}

            <div className="divider-gold mb-8 w-20" />

            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {property.features.area_m2 && (
                <div className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                  <Maximize2 size={18} className="text-gold" />
                  <span className="font-serif text-2xl font-bold text-foreground">{property.features.area_m2}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">m² privativo</span>
                </div>
              )}
              {(property.features.suites || property.features.quartos) && (
                <div className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                  <BedDouble size={18} className="text-gold" />
                  <span className="font-serif text-2xl font-bold text-foreground">
                    {property.features.suites ?? property.features.quartos}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {property.features.suites ? "suítes" : "quartos"}
                  </span>
                </div>
              )}
              {property.features.vagas && (
                <div className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                  <Car size={18} className="text-gold" />
                  <span className="font-serif text-2xl font-bold text-foreground">{property.features.vagas}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">vagas</span>
                </div>
              )}
              {property.features.andar && (
                <div className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                  <Building2 size={18} className="text-gold" />
                  <span className="font-serif text-2xl font-bold text-foreground">{property.features.andar}º</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">andar</span>
                </div>
              )}
            </div>

            {/* Empreendimento block — construtora properties */}
            {isConstrutora && development && (
              <div className="mb-10 rounded-2xl border overflow-hidden" style={{ borderColor: accentColor + "25" }}>
                {development.cover_image && (
                  <div className="h-40 overflow-hidden relative">
                    <Image src={development.cover_image} alt={development.name} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5" style={{ backgroundColor: accentColor + "06" }}>
                  <p className="text-xs uppercase tracking-[0.2em] font-sans mb-1" style={{ color: accentColor }}>
                    Empreendimento
                  </p>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-1">{development.name}</h3>
                  {(development.neighborhood || development.city) && (
                    <p className="text-muted-foreground text-sm font-sans flex items-center gap-1">
                      <MapPin size={12} style={{ color: accentColor }} />
                      {[development.neighborhood, development.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {org?.slug && (
                    <a
                      href={`/construtora/${org.slug}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-sans uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                      style={{ color: accentColor }}
                    >
                      Ver todos os imóveis do empreendimento <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="mb-10">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                  Sobre o Imóvel
                </h2>
                <p className="text-muted-foreground font-sans leading-relaxed text-base">
                  {property.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {property.tags.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                  Diferenciais
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.tags.map((tag) => {
                    const info = getTagInfo(tag)
                    const Icon = info.icon
                    return (
                      <div key={tag} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gold/20 bg-card hover:border-gold/50 transition-colors">
                        <Icon size={14} className="text-gold" />
                        <span className="text-sm font-sans text-foreground">{info.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Sticky contact card ─────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#fdf8f2] border border-[rgba(201,169,110,0.25)] rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">
                Valor
              </p>
              <p className="font-serif text-3xl font-bold text-foreground">
                {formatPrice(property.price)}
              </p>
              <p className={`text-xs mt-1 mb-6 font-sans ${STATUS_COLOR[property.status] ?? ""} inline-flex px-2 py-0.5 rounded-full border`}>
                {STATUS_LABEL[property.status]}
              </p>

              <div className="divider-gold mb-6" />

              <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-6">
                Fale com nosso consultor especialista para informações e agendamento de visita.
              </p>

              <LeadCaptureForm
                propertyId={property.id}
                propertySlug={property.slug}
                propertyTitle={property.title}
                orgId={property.org_id}
                orgWhatsapp={fallbackWhatsapp}
                refId={ref}
              />

              {property.video_url && (
                <a
                  href={property.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 border border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-all duration-300 text-xs uppercase tracking-[0.15em] font-sans rounded-xl"
                >
                  Ver Vídeo do Imóvel
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer orgName={orgName} whatsapp={fallbackWhatsapp} website={org?.website} />

      {/* Floating corretor minisite — resolves corretor from ref/cookie, falls back to org/admin WA */}
      <CorretorMinisite
        defaultWhatsapp={fallbackWhatsapp}
        defaultName={orgName}
        defaultPhoto={org?.logo ?? undefined}
      />
    </main>
  )
}
