import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { ImoveisClient } from "@/components/dashboard/ImoveisClient"
import type { Property, UserRole } from "@/types/database"

export default async function ImoveisPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora", "corretor"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  let properties: Property[] = []
  let listedIds: string[] = []
  let minisiteSlug: string | null = null

  if (role === "admin") {
    const { data } = await admin
      .from("properties").select("*").order("updated_at", { ascending: false })
    properties = (data ?? []) as Property[]
  } else if (role === "construtora") {
    const [{ data: props }, { data: org }] = await Promise.all([
      admin.from("properties").select("*").eq("org_id", orgId!).order("updated_at", { ascending: false }),
      orgId ? admin.from("organizations").select("slug").eq("id", orgId).single() : { data: null },
    ])
    properties = (props ?? []) as Property[]
    minisiteSlug = org?.slug ?? null
  } else {
    const ownFilter = role === "imobiliaria"
      ? admin.from("properties").select("*").eq("org_id", orgId ?? "").order("updated_at", { ascending: false })
      : admin.from("properties").select("*").eq("created_by", user.id).order("updated_at", { ascending: false })

    const listingFilter = role === "imobiliaria"
      ? admin.from("property_listings").select("property_id, property:properties(*)").eq("org_id", orgId ?? "")
      : admin.from("property_listings").select("property_id, property:properties(*)").eq("user_id", user.id)

    const [{ data: own }, { data: listings }] = await Promise.all([ownFilter, listingFilter])

    const ownProps = (own ?? []) as Property[]
    const rawListings = (listings ?? []) as unknown as { property_id: string; property: Property | null }[]
    const listedProps = rawListings.filter((l) => l.property !== null).map((l) => l.property as Property)
    listedIds = rawListings.map((l) => l.property_id)

    const seen = new Set<string>()
    for (const p of [...ownProps, ...listedProps]) {
      if (!seen.has(p.id)) { seen.add(p.id); properties.push(p) }
    }
  }

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Portfólio</p>
          <h1 className="font-serif text-4xl font-bold text-white">
            <AnimatedGradientText className="font-serif text-4xl font-bold">Imóveis</AnimatedGradientText>
          </h1>
          <div className="divider-gold mt-4 w-20" />
        </div>
      </div>

      <ImoveisClient
        properties={properties}
        role={role}
        orgId={orgId}
        userId={user.id}
        listedIds={listedIds}
        minisiteSlug={minisiteSlug}
      />
    </div>
  )
}
