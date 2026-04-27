import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { Footer } from "@/components/landing/Footer"
import { CorretorLanding } from "@/components/corretor/CorretorLanding"
import { JsonLd } from "@/components/seo/JsonLd"
import type { Profile, Property } from "@/types/database"

export const revalidate = 1800

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getProfile(id: string) {
  const admin = createAdminClient()
  const base = admin
    .from("profiles")
    .select("id, full_name, avatar_url, whatsapp, creci, bio, role, organization_id, slug")
    .eq("role", "corretor")
    .eq("is_active", true)
  // Use separate eq filters instead of .or() with user input to prevent PostgREST injection
  const { data } = await (UUID_RE.test(id) ? base.eq("id", id) : base.eq("slug", id)).maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const profile = await getProfile(id)
  if (!profile) return {}
  const title = profile.full_name ? `${profile.full_name} | Corretor de Imóveis` : "Corretor de Imóveis"
  const description = (profile.bio as string | null) ?? `Corretor especializado${profile.creci ? ` — CRECI ${profile.creci}` : ""}.`
  const image = (profile.avatar_url as string | null) ?? null
  const canonical = `/corretor/${(profile.slug as string | null) ?? profile.id}`
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    alternates: { canonical },
  }
}

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

  const [profile, { data: listings }] = await Promise.all([
    getProfile(id),
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
      .eq("id", profile.organization_id as string)
      .single()
    orgName = org?.name ?? null
  }

  const profileSlug = (profile.slug as string | null) ?? profile.id

  return (
    <main>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: profile.full_name,
        description: profile.bio ?? undefined,
        image: profile.avatar_url ?? undefined,
        url: `${SITE_URL}/corretor/${profileSlug}`,
        telephone: profile.whatsapp ?? undefined,
      }} />
      <CorretorLanding
        profile={profile as Profile}
        orgName={orgName}
        properties={properties}
        featuredIds={featuredIds}
        refId={ref}
      />
      <Footer
        orgName={(profile.full_name as string | null) ?? "Corretor"}
        whatsapp={(profile.whatsapp as string | null) ?? ""}
      />
    </main>
  )
}
