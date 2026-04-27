import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { BentoGallery } from "@/components/property/BentoGallery"
import { PropertyActions } from "@/components/property/PropertyActions"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { LeadCaptureForm } from "@/components/property/LeadCaptureForm"
import { PropertyMobileCTA } from "@/components/property/PropertyMobileCTA"
import { PropertyShare } from "@/components/property/PropertyShare"
import { Footer } from "@/components/landing/Footer"
import { JsonLd } from "@/components/seo/JsonLd"
import { getTagInfo } from "@/lib/tag-icons"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import { BedDouble, Car, Maximize2, MapPin, Building2, ArrowLeft, ExternalLink } from "lucide-react"
import type { Property, Organization, Development } from "@/types/database"
import Link from "next/link"

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { property, org } = await getProperty(slug)
  const image = property.images?.[0] ?? null
  const title = `${property.title} — ${org?.name ?? "RealState Intelligence"}`
  const description = property.description
    ?? `${formatPrice(property.price)} · ${[property.neighborhood, property.city].filter(Boolean).join(", ")}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: property.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: { canonical: `/imovel/${slug}` },
  }
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
// For dark backgrounds (main page area, mobile chips)
const STATUS_COLOR: Record<string, string> = {
  disponivel: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  reserva:    "text-amber-400 bg-amber-900/20 border-amber-700/40",
  vendido:    "text-zinc-500 bg-zinc-800 border-zinc-700/40",
}
// For cream/light backgrounds (sticky nav, right contact card)
const STATUS_COLOR_LIGHT: Record<string, string> = {
  disponivel: "text-emerald-700 bg-emerald-50 border-emerald-300",
  reserva:    "text-amber-700 bg-amber-50 border-amber-300",
  vendido:    "text-zinc-500 bg-zinc-100 border-zinc-300",
}

export default async function ImovelPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { ref } = await searchParams
  const { property, org, development, adminWhatsapp } = await getProperty(slug)

  if (!property) notFound()

  // Check if current user has a professional role (can download photos / copy description)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let canDownload = false
  if (user) {
    const admin = createAdminClient()
    const { data: prof } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    canDownload = ["admin", "imobiliaria", "corretor", "construtora"].includes(prof?.role ?? "")
  }

  const isConstrutora = org?.type === "construtora"
  const accentColor = isConstrutora ? (org?.brand_colors?.primary ?? "#C4A052") : "#C4A052"

  // WhatsApp priority: corretor (via ref/cookie, resolved client-side) > org > admin > fallback
  const fallbackWhatsapp = org?.whatsapp ?? adminWhatsapp ?? "5521999999999"
  const orgName = org?.name ?? "Consultor Especialista"

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        description: property.description ?? undefined,
        url: `${SITE_URL}/imovel/${property.slug}`,
        image: property.images.length > 0 ? property.images : undefined,
        offers: {
          "@type": "Offer",
          price: property.price,
          priceCurrency: "BRL",
          availability: property.status === "disponivel" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        },
        address: (property.neighborhood || property.city) ? {
          "@type": "PostalAddress",
          addressLocality: property.city ?? undefined,
          addressRegion: property.neighborhood ?? undefined,
          addressCountry: "BR",
        } : undefined,
      }} />

      {/* ── Sticky top nav ─────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between h-14">
        <Link
          href={isConstrutora && org?.slug ? `/construtora/${org.slug}` : "/"}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{org?.name ?? "Início"}</span>
        </Link>
        {/* Price + status — desktop only in nav */}
        <div className="hidden lg:flex items-center gap-4">
          <span className={`text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider font-sans ${STATUS_COLOR_LIGHT[property.status] ?? ""}`}>
            {STATUS_LABEL[property.status] ?? property.status}
          </span>
          <span className="font-serif text-xl font-bold text-foreground">
            {formatPrice(property.price)}
          </span>
        </div>
        {/* Mobile: just the org name centered */}
        <span className="lg:hidden font-sans text-sm text-foreground/70 truncate max-w-[160px]">{org?.name ?? ""}</span>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
        </div>
      </nav>

      {/* ── Construtora brand bar — desktop only ──────────── */}
      {isConstrutora && (
        <div
          className="hidden lg:flex px-6 py-3 items-center justify-between"
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

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-12">

        {/* ── Bento Gallery ──────────────────────────────────── */}
        <BentoGallery images={property.images} title={property.title} />

        {/* ── Action bar: download photos + copy description ── */}
        <PropertyActions
          images={property.images ?? []}
          description={property.description}
          title={property.title}
          canDownload={canDownload}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-4 lg:mt-16">

          {/* ── Left: Details ──────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* Location pill */}
            {(property.neighborhood || property.city) && (
              <div className="flex items-center gap-1.5 mb-3">
                <MapPin size={13} className="text-gold flex-shrink-0" />
                <span className="text-sm font-sans text-muted-foreground">
                  {[property.neighborhood, property.city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            <h1 className="font-serif text-3xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
              {property.title}
            </h1>

            {/* Mobile: construtora info inline below title */}
            {isConstrutora && org && (
              <div className="lg:hidden flex items-center gap-2 mb-4">
                {org.logo
                  ? <Image src={org.logo} alt={org.name} width={60} height={16} className="h-4 w-auto object-contain opacity-60" />
                  : <span className="text-xs font-sans text-muted-foreground">{org.name}</span>
                }
                {development && (
                  <span className="text-xs font-sans text-muted-foreground/60">· {development.name}</span>
                )}
              </div>
            )}

            {/* Mobile: price block */}
            <div className="lg:hidden bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between mb-5">
              <div>
                <p className="font-serif text-2xl font-bold text-foreground leading-none">{formatPrice(property.price)}</p>
                <span className={`text-xs mt-1 font-sans ${STATUS_COLOR[property.status] ?? ""} inline-flex px-2 py-0.5 rounded-full border`}>
                  {STATUS_LABEL[property.status]}
                </span>
              </div>
              {property.address && (
                <p className="text-muted-foreground font-sans text-xs text-right max-w-[140px] leading-relaxed">
                  {property.address}
                </p>
              )}
            </div>

            {/* Desktop: address + divider */}
            {property.address && (
              <div className="hidden lg:flex items-center gap-2 text-muted-foreground mb-8">
                <MapPin size={13} className="text-gold flex-shrink-0" />
                <span className="font-sans text-sm">{property.address}</span>
              </div>
            )}

            <div className="hidden lg:block divider-gold mb-8 w-20" />

            {/* Stats — horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none mb-6 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0 lg:mb-10">
              {property.features.area_m2 && (
                <>
                  {/* Mobile chip */}
                  <div className="lg:hidden flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                    <Maximize2 size={14} className="text-gold" />
                    <span className="font-serif text-lg font-bold text-foreground">{property.features.area_m2}</span>
                    <span className="text-xs text-muted-foreground">m²</span>
                  </div>
                  {/* Desktop card */}
                  <div className="hidden lg:flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                    <Maximize2 size={18} className="text-gold" />
                    <span className="font-serif text-2xl font-bold text-foreground">{property.features.area_m2}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">m² privativo</span>
                  </div>
                </>
              )}
              {(property.features.suites || property.features.quartos) && (
                <>
                  <div className="lg:hidden flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                    <BedDouble size={14} className="text-gold" />
                    <span className="font-serif text-lg font-bold text-foreground">{property.features.suites ?? property.features.quartos}</span>
                    <span className="text-xs text-muted-foreground">{property.features.suites ? "suítes" : "dorms"}</span>
                  </div>
                  <div className="hidden lg:flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                    <BedDouble size={18} className="text-gold" />
                    <span className="font-serif text-2xl font-bold text-foreground">{property.features.suites ?? property.features.quartos}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{property.features.suites ? "suítes" : "quartos"}</span>
                  </div>
                </>
              )}
              {property.features.vagas && (
                <>
                  <div className="lg:hidden flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                    <Car size={14} className="text-gold" />
                    <span className="font-serif text-lg font-bold text-foreground">{property.features.vagas}</span>
                    <span className="text-xs text-muted-foreground">vagas</span>
                  </div>
                  <div className="hidden lg:flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                    <Car size={18} className="text-gold" />
                    <span className="font-serif text-2xl font-bold text-foreground">{property.features.vagas}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">vagas</span>
                  </div>
                </>
              )}
              {property.features.andar && (
                <>
                  <div className="lg:hidden flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                    <Building2 size={14} className="text-gold" />
                    <span className="font-serif text-lg font-bold text-foreground">{property.features.andar}º</span>
                    <span className="text-xs text-muted-foreground">andar</span>
                  </div>
                  <div className="hidden lg:flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors">
                    <Building2 size={18} className="text-gold" />
                    <span className="font-serif text-2xl font-bold text-foreground">{property.features.andar}º</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">andar</span>
                  </div>
                </>
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
              <div className="bg-card lg:bg-transparent rounded-2xl lg:rounded-none p-5 lg:p-0 mb-3 lg:mb-10 border border-border lg:border-0">
                <h2 className="font-serif text-xl lg:text-2xl font-semibold text-foreground mb-3">
                  Sobre o Imóvel
                </h2>
                <p className="text-muted-foreground font-sans leading-relaxed text-sm lg:text-base">
                  {property.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {property.tags.length > 0 && (
              <div className="bg-card lg:bg-transparent rounded-2xl lg:rounded-none p-5 lg:p-0 mb-3 lg:mb-0 border border-border lg:border-0">
                <h2 className="font-serif text-xl lg:text-2xl font-semibold text-foreground mb-4 lg:mb-6">
                  Diferenciais
                </h2>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {property.tags.map((tag) => {
                    const info = getTagInfo(tag)
                    const Icon = info.icon
                    return (
                      <div key={tag} className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full border border-gold/20 bg-background lg:bg-card hover:border-gold/50 transition-colors">
                        <Icon size={13} className="text-gold" />
                        <span className="text-xs lg:text-sm font-sans text-foreground">{info.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Sticky contact card — desktop only ──── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-card border border-[rgba(201,169,110,0.25)] rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">
                Valor
              </p>
              <p className="font-serif text-3xl font-bold text-foreground">
                {formatPrice(property.price)}
              </p>
              <p className={`text-xs mt-1 mb-6 font-sans ${STATUS_COLOR_LIGHT[property.status] ?? ""} inline-flex px-2 py-0.5 rounded-full border`}>
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

              {canDownload && user && (
                <div className="mb-3">
                  <PropertyShare
                    userId={user.id}
                    propertySlug={property.slug}
                    propertyTitle={property.title}
                  />
                </div>
              )}

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

      {/* ── Mobile CTA bar ───────────────────────────── */}
      <PropertyMobileCTA
        price={property.price}
        status={property.status}
        propertyId={property.id}
        propertySlug={property.slug}
        propertyTitle={property.title}
        orgId={property.org_id}
        orgWhatsapp={fallbackWhatsapp}
        refId={ref}
        userId={canDownload && user ? user.id : null}
      />
      {/* spacer so footer doesn't hide behind CTA bar on mobile */}
      <div className="lg:hidden h-28" />

      <Footer orgName={orgName} website={org?.website} />

      {/* Floating corretor minisite — resolves corretor from ref/cookie, falls back to org/admin WA */}
      <CorretorMinisite
        defaultWhatsapp={fallbackWhatsapp}
        defaultName={orgName}
        defaultPhoto={org?.logo ?? undefined}
      />
    </main>
  )
}
