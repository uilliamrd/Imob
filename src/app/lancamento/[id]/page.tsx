import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LancamentoLanding } from "@/components/construtora/LancamentoLanding"
import { Footer } from "@/components/landing/Footer"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import type { Development, Organization, Property } from "@/types/database"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}

export default async function LancamentoPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { ref } = await searchParams

  try {
    const supabase = await createClient()

    const [{ data: dev }, { data: properties }] = await Promise.all([
      supabase.from("developments").select("*, organization:organizations(*)").eq("id", id).single(),
      supabase.from("properties").select("*").eq("development_id", id).order("status").order("price"),
    ])

    if (!dev) notFound()

    const development = dev as Development & { organization: Organization | null }
    const org = development.organization

    const whatsapp = "5521999999999"

    return (
      <main>
        <LancamentoLanding
          development={development}
          org={org}
          properties={(properties ?? []) as Property[]}
          refId={ref}
          whatsapp={whatsapp}
        />
        <Footer orgName={org?.name ?? development.name} whatsapp={whatsapp} website={org?.website} />
        <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org?.name ?? development.name} defaultPhoto={org?.logo ?? undefined} />
      </main>
    )
  } catch {
    notFound()
  }
}
