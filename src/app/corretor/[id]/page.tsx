import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { Footer } from "@/components/landing/Footer"
import { CorretorLanding } from "@/components/corretor/CorretorLanding"
import type { Profile, Property } from "@/types/database"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}

export default async function CorretorPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { ref } = await searchParams
  const admin = createAdminClient()

  const [{ data: profile }, { data: properties }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, avatar_url, whatsapp, creci, bio, role, organization_id")
      .eq("id", id)
      .eq("role", "corretor")
      .eq("is_active", true)
      .maybeSingle(),
    admin
      .from("properties")
      .select("*")
      .eq("created_by", id)
      .eq("visibility", "publico")
      .order("created_at", { ascending: false }),
  ])

  if (!profile) notFound()

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
        properties={(properties ?? []) as Property[]}
        refId={ref}
      />
      <Footer
        orgName={profile.full_name ?? "Corretor"}
        whatsapp={profile.whatsapp ?? ""}
      />
    </main>
  )
}
