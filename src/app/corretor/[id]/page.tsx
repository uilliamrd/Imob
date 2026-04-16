import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { Footer } from "@/components/landing/Footer"
import { CorretorLanding } from "@/components/corretor/CorretorLanding"
import type { Profile, Property } from "@/types/database"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}

interface ListingRow {
  is_featured: boolean
  property: Property | null
}

export default async function CorretorPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { ref } = await searchParams
  const admin = createAdminClient()

  const [{ data: profile }, { data: listings }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, avatar_url, whatsapp, creci, bio, role, organization_id")
      .eq("id", id)
      .eq("role", "corretor")
      .eq("is_active", true)
      .maybeSingle(),
    admin
      .from("property_listings")
      .select("is_featured, property:properties(*)")
      .eq("user_id", id)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
  ])

  if (!profile) notFound()

  // Filter to public properties only
  const publicListings = ((listings ?? []) as unknown as ListingRow[]).filter(
    (l): l is ListingRow & { property: Property } =>
      l.property !== null && l.property.visibility === "publico"
  )

  const properties = publicListings.map((l) => l.property)
  const featuredIds = new Set(
    publicListings.filter((l) => l.is_featured).map((l) => l.property.id)
  )

  // Fetch org name if the corretor belongs to one
  let orgName: string | null = null
  if (profile.organization_id) {
    const { data: org } = await admin
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .single()
    orgName = org?.name ?? null
  }

  return (
    <main>
      <CorretorLanding
        profile={profile as Profile}
        orgName={orgName}
        properties={properties}
        featuredIds={featuredIds}
        refId={ref}
      />
      <Footer
        orgName={profile.full_name ?? "Corretor"}
        whatsapp={profile.whatsapp ?? ""}
      />
    </main>
  )
}
