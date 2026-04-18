import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/landing/Footer"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { ImobiliariaLanding, type CorretorPublic } from "@/components/imobiliaria/ImobiliariaLanding"
import { JsonLd } from "@/components/seo/JsonLd"
import type { Organization, Property } from "@/types/database"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"

async function getData(slug: string): Promise<{ org: Organization; properties: Property[]; corretores: CorretorPublic[] } | null> {
  try {
    const supabase = await createClient()

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (!org || org.type !== "imobiliaria") return null

    const [{ data: properties }, { data: corretores }] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("org_id", org.id)
        .eq("visibility", "publico")
        .order("status"),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, creci, whatsapp, slug")
        .eq("organization_id", org.id)
        .eq("role", "corretor")
        .eq("is_active", true)
        .order("full_name"),
    ])

    return {
      org: org as Organization,
      properties: (properties ?? []) as Property[],
      corretores: (corretores ?? []) as CorretorPublic[],
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  const { org } = data
  const orgAny = org as unknown as Record<string, string | null>
  const title = `${org.name} | Imobiliária`
  const description = orgAny.portfolio_desc ?? orgAny.about_text ?? `Conheça o portfólio de imóveis de ${org.name}.`
  const image = orgAny.hero_image ?? org.logo ?? null
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : [], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    alternates: { canonical: `/imobiliaria/${slug}` },
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string }>
}

export default async function ImobiliariaPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { ref } = await searchParams

  const data = await getData(slug)
  if (!data) notFound()

  const { org, properties, corretores } = data
  const whatsapp = org.whatsapp ?? "5521999999999"

  const orgAny = org as unknown as Record<string, unknown>

  return (
    <main>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: org.name,
        url: `${SITE_URL}/imobiliaria/${slug}`,
        logo: org.logo ?? undefined,
        telephone: org.whatsapp ?? undefined,
        description: (orgAny.portfolio_desc ?? orgAny.about_text) as string | undefined,
        contactPoint: org.whatsapp ? { "@type": "ContactPoint", telephone: org.whatsapp, contactType: "sales" } : undefined,
      }} />
      <ImobiliariaLanding org={org} properties={properties} corretores={corretores} refId={ref} whatsapp={whatsapp} />
      <Footer orgName={org.name} website={org.website} whatsapp={whatsapp} />
      <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org.name} defaultPhoto={org.logo ?? undefined} />
    </main>
  )
}
