import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/landing/Footer"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { ImobiliariaLanding, type CorretorPublic } from "@/components/imobiliaria/ImobiliariaLanding"
import type { Organization, Property } from "@/types/database"

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

  return (
    <main>
      <ImobiliariaLanding org={org} properties={properties} corretores={corretores} refId={ref} whatsapp={whatsapp} />
      <Footer orgName={org.name} website={org.website} whatsapp={whatsapp} />
      <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org.name} defaultPhoto={org.logo ?? undefined} />
    </main>
  )
}
