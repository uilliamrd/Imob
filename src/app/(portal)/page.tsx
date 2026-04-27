export const revalidate = 300

import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { PortalHome } from "@/components/portal/PortalHome"
import type { Property, Organization, Development, PropertyAd } from "@/types/database"

export const metadata: Metadata = {
  title: "Portal de Imóveis de Alto Padrão",
  description: "Encontre apartamentos, casas, lançamentos e terrenos selecionados com curadoria especializada.",
  openGraph: { type: "website" },
}

export interface PortalProperty extends Omit<Property, "organization" | "development"> {
  organization: Pick<Organization, "id" | "name" | "slug" | "type" | "logo" | "brand_colors"> | null
  development: Pick<Development, "id" | "name"> | null
}

export interface PortalOrg {
  id: string
  name: string
  slug: string
  logo: string | null
  brand_colors: { primary?: string } | null
  hero_tagline: string | null
  availableCount: number
}

const PROPERTY_SELECT = "id, title, slug, price, features, tags, status, visibility, org_id, development_id, images, neighborhood, city, categoria, tipo_negocio, created_at, organization:organizations(id, name, slug, type, logo, brand_colors), development:developments(id, name)"

export default async function PortalPage() {
  const admin = createAdminClient()
  const now = new Date().toISOString()

  const [{ data: rawProperties }, { data: construtorасData }, { data: imobiliariasData }, { data: rawAds }] = await Promise.all([
    admin
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("visibility", "publico")
      .eq("status", "disponivel")
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("organizations")
      .select("id, name, slug, logo, brand_colors, hero_tagline, is_section_highlighted")
      .eq("type", "construtora")
      .not("slug", "is", null)
      .order("is_section_highlighted", { ascending: false })
      .order("name"),
    admin
      .from("organizations")
      .select("id, name, slug, logo, brand_colors, hero_tagline, is_section_highlighted")
      .eq("type", "imobiliaria")
      .not("slug", "is", null)
      .order("is_section_highlighted", { ascending: false })
      .order("name"),
    admin
      .from("property_ads")
      .select(`*, property:properties(${PROPERTY_SELECT})`)
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false }),
  ])

  const properties = (rawProperties ?? []) as unknown as PortalProperty[]
  const ads = (rawAds ?? []) as unknown as PropertyAd[]

  // Rodízio: agrupar ads por property_id e selecionar um por hora
  const hourSlot = Math.floor(Date.now() / 3_600_000)
  function pickAdForProperty(adsForProp: PropertyAd[]): PropertyAd {
    return adsForProp[hourSlot % adsForProp.length]
  }

  // Agrupar super_destaque por property_id
  const superAdsMap = new Map<string, PropertyAd[]>()
  ads.filter((a) => a.tier === "super_destaque" && a.property).forEach((a) => {
    const list = superAdsMap.get(a.property_id) ?? []
    list.push(a)
    superAdsMap.set(a.property_id, list)
  })
  const superDestaques = Array.from(superAdsMap.values())
    .map((list) => pickAdForProperty(list).property as unknown as PortalProperty)

  // Agrupar destaque por property_id (deduplicado)
  const destaqueAdsMap = new Map<string, PropertyAd[]>()
  ads.filter((a) => a.tier === "destaque").forEach((a) => {
    const list = destaqueAdsMap.get(a.property_id) ?? []
    list.push(a)
    destaqueAdsMap.set(a.property_id, list)
  })
  const destaqueIds = new Set(
    Array.from(destaqueAdsMap.entries()).map(([propId, list]) => {
      pickAdForProperty(list) // consume slot for rotation tracking
      return propId
    })
  )

  async function buildOrgList(orgs: typeof construtorасData): Promise<PortalOrg[]> {
    if (!orgs?.length) return []
    const ids = orgs.map((o) => o.id)
    const { data: propRows } = await admin
      .from("properties")
      .select("org_id")
      .in("org_id", ids)
      .eq("visibility", "publico")
      .eq("status", "disponivel")
      .limit(5000)
    const countMap = new Map<string, number>()
    for (const row of propRows ?? []) {
      countMap.set(row.org_id, (countMap.get(row.org_id) ?? 0) + 1)
    }
    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug!,
      logo: org.logo,
      brand_colors: org.brand_colors,
      hero_tagline: (org as { hero_tagline?: string | null }).hero_tagline ?? null,
      availableCount: countMap.get(org.id) ?? 0,
    }))
  }

  const [construtoras, imobiliarias] = await Promise.all([
    buildOrgList(construtorасData),
    buildOrgList(imobiliariasData),
  ])

  const heroImage =
    superDestaques[0]?.images?.[0] ??
    properties.find((p) => p.images?.[0])?.images?.[0] ??
    null

  return (
    <PortalHome
      properties={properties}
      construtoras={construtoras}
      imobiliarias={imobiliarias}
      superDestaques={superDestaques}
      destaqueIds={destaqueIds}
      heroImage={heroImage}
    />
  )
}
