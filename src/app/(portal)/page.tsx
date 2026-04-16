import { createAdminClient } from "@/lib/supabase/admin"
import { PortalSearch } from "@/components/portal/PortalSearch"
import type { Property, Organization, Development } from "@/types/database"

export interface PortalProperty extends Omit<Property, "organization" | "development"> {
  organization: Pick<Organization, "id" | "name" | "slug" | "type" | "logo" | "brand_colors"> | null
  development: Pick<Development, "id" | "name"> | null
}

export interface PortalConstrutora {
  id: string
  name: string
  slug: string
  logo: string | null
  brand_colors: { primary?: string } | null
  availableCount: number
}

export default async function PortalPage() {
  const admin = createAdminClient()

  const [{ data: rawProperties }, { data: orgs }] = await Promise.all([
    admin
      .from("properties")
      .select("id, title, slug, price, features, tags, status, visibility, org_id, development_id, images, neighborhood, city, categoria, tipo_negocio, created_at, organization:organizations(id, name, slug, type, logo, brand_colors), development:developments(id, name)")
      .eq("visibility", "publico")
      .eq("status", "disponivel")
      .order("created_at", { ascending: false }),
    admin
      .from("organizations")
      .select("id, name, slug, logo, brand_colors, hero_tagline, portfolio_desc")
      .eq("type", "construtora")
      .not("slug", "is", null),
  ])

  const properties = (rawProperties ?? []) as unknown as PortalProperty[]

  const construtoras: PortalConstrutora[] = await Promise.all(
    (orgs ?? []).map(async (org) => {
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
        availableCount: count ?? 0,
      }
    })
  )

  return (
    <div>
      {/* Hero */}
      <section className="py-16 px-6 border-b border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(201,169,110,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,169,110,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-sans mb-4">Portal de Imóveis</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Encontre o imóvel
            <span className="block italic text-gradient-gold">dos seus sonhos</span>
          </h1>
          <p className="text-muted-foreground font-sans text-base max-w-xl mx-auto">
            {properties.length > 0
              ? `${properties.length} imóvel${properties.length !== 1 ? "is" : ""} disponível${properties.length !== 1 ? "is" : ""} para você encontrar.`
              : "Imóveis selecionados por construtoras e corretores especializados."}
          </p>
          <div className="divider-gold mt-6 mx-auto w-16" />
        </div>
      </section>

      {/* Search */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <PortalSearch properties={properties} construtoras={construtoras} />
        </div>
      </section>
    </div>
  )
}
