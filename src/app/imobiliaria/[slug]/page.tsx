import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/landing/Footer"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { ImobiliariaLanding } from "@/components/imobiliaria/ImobiliariaLanding"
import type { Organization, Property } from "@/types/database"

async function getData(slug: string): Promise<{ org: Organization; properties: Property[] } | null> {
  try {
    const supabase = await createClient()

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (!org || org.type !== "imobiliaria") return null

    const { data: properties } = await supabase
      .from("properties")
      .select("*")
      .eq("org_id", org.id)
      .eq("visibility", "publico")
      .order("status")

    return {
      org: org as Organization,
      properties: (properties ?? []) as Property[],
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

  const { org, properties } = data
  const whatsapp = org.whatsapp ?? "5521999999999"

  return (
    <main>
      <ImobiliariaLanding org={org} properties={properties} refId={ref} whatsapp={whatsapp} />
      <Footer orgName={org.name} website={org.website} whatsapp={whatsapp} />
      <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org.name} defaultPhoto={org.logo ?? undefined} />
    </main>
  )
}
