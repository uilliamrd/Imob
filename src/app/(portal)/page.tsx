import { createAdminClient } from "@/lib/supabase/admin"
import { PortalHome } from "@/components/portal/PortalHome"
import type { Property, Organization, Development, PropertyAd } from "@/types/database"

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
      .order("created_at", { ascending: false }),
    admin
      .from("organizations")
      .select("id, name, slug, logo, brand_colors, hero_tagline")
      .eq("type", "construtora")
      .not("slug", "is", null),
    admin
      .from("organizations")
      .select("id, name, slug, logo, brand_colors, hero_tagline")
      .eq("type", "imobiliaria")
      .not("slug", "is", null),
    admin
      .from("property_ads")
      .select(`*, property:properties(${PROPERTY_SELECT})`)
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false }),
  ])

  const properties = (rawProperties ?? []) as unknown as PortalProperty[]
  const ads = (rawAds ?? []) as unknown as PropertyAd[]

  const superDestaques = ads
    .filter((a) => a.tier === "super_destaque" && a.property)
    .map((a) => a.property as unknown as PortalProperty)
  const destaqueIds = new Set(
    ads.filter((a) => a.tier === "destaque").map((a) => a.property_id)
  )

  async function buildOrgList(orgs: typeof construtorасData): Promise<PortalOrg[]> {
    if (!orgs?.length) return []
    return Promise.all(
      orgs.map(async (org) => {
        const { count } = await admin
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("org_id", org.id)
          .eq("visibility", "publico")
          .eq("status", "disponivel")
        return {
          id: org.id,
          name: org.name,
          slug: org.slug!,
          logo: org.logo,
          brand_colors: org.brand_colors,
          hero_tagline: (org as { hero_tagline?: string | null }).hero_tagline ?? null,
          availableCount: count ?? 0,
        }
      })
    )
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
