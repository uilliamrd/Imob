import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { LancamentoLanding } from "@/components/construtora/LancamentoLanding"
import { Footer } from "@/components/landing/Footer"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { PrintButton } from "@/components/property/PrintButton"
import type { Development, Organization, Property } from "@/types/database"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const admin = createAdminClient()
    const { data: dev } = await admin
      .from("developments")
      .select("name, neighborhood, city, cover_image, organization:organizations(logo, hero_image)")
      .eq("id", id)
      .single()
    if (!dev) return {}
    const devAny = dev as unknown as Record<string, unknown>
    const org = devAny.organization as Record<string, unknown> | null
    const title = `${dev.name} | Lançamento`
    const parts = [dev.name as string]
    if (devAny.neighborhood) parts.push(`em ${devAny.neighborhood}`)
    if (devAny.city) parts.push(devAny.city as string)
    const description = `Conheça ${parts.join(", ")}.`
    const image = (devAny.cover_image ?? org?.hero_image ?? org?.logo ?? null) as string | null
    return {
      title,
      description,
      openGraph: { title, description, images: image ? [image] : [] },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
      alternates: { canonical: `/lancamento/${id}` },
    }
  } catch {
    return {}
  }
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}

export default async function LancamentoPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { ref } = await searchParams

  try {
    const supabase = await createClient()

    // Check professional role — PDF download for admin, corretor e construtora apenas
    const { data: { user } } = await supabase.auth.getUser()
    let canDownload = false
    if (user) {
      const adminClient = createAdminClient()
      const { data: prof } = await adminClient.from("profiles").select("role").eq("id", user.id).single()
      canDownload = ["admin", "corretor", "construtora"].includes(prof?.role ?? "")
    }

    const [{ data: dev }, { data: properties }] = await Promise.all([
      supabase.from("developments").select("*, organization:organizations(*)").eq("id", id).single(),
      supabase.from("properties").select("*").eq("development_id", id).order("status").order("price"),
    ])

    if (!dev) notFound()

    const development = dev as Development & { organization: Organization | null }
    const org = development.organization

    const whatsapp = org?.whatsapp ?? "5521999999999"

    // Custom page takes over the landing — units still use the standard system pages
    if (development.custom_page_html) {
      return (
        <>
          <iframe
            srcDoc={development.custom_page_html}
            sandbox="allow-scripts allow-forms allow-popups"
            style={{ width: "100%", border: "none", minHeight: "100vh" }}
            title={development.name}
          />
          <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org?.name ?? development.name} defaultPhoto={org?.logo ?? undefined} />
        </>
      )
    }

    return (
      <main>
        {canDownload && <PrintButton />}
        <LancamentoLanding
          development={development}
          org={org}
          properties={(properties ?? []) as Property[]}
          refId={ref}
          whatsapp={whatsapp}
          canDownload={canDownload}
        />
        <Footer orgName={org?.name ?? development.name} whatsapp={whatsapp} website={org?.website} />
        <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org?.name ?? development.name} defaultPhoto={org?.logo ?? undefined} />
      </main>
    )
  } catch {
    notFound()
  }
}
