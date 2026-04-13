import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/landing/Footer"
import { CorretorMinisite } from "@/components/corretor/CorretorMinisite"
import { ConstrutoraLanding } from "@/components/construtora/ConstrutoraLanding"
import type { Organization, Property, Development } from "@/types/database"

async function getData(slug: string): Promise<{ org: Organization; properties: Property[]; developments: Development[] } | null> {
  try {
    const supabase = await createClient()

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (!org || org.type !== "construtora") return null

    const [{ data: properties }, { data: developments }] = await Promise.all([
      supabase.from("properties").select("*").eq("org_id", org.id).eq("visibility", "publico").order("status"),
      supabase.from("developments").select("*").eq("org_id", org.id).order("name"),
    ])

    return {
      org: org as Organization,
      properties: (properties ?? []) as Property[],
      developments: (developments ?? []) as Development[],
    }
  } catch {
    return null
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string; section?: string }>
}

export default async function ConstrutoraPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { ref, section } = await searchParams

  const raw = await getData(slug)

  // Fallback demo page for "meridian"
  const data = raw ?? (slug === "meridian" || slug === "construtora-meridian" ? {
    org: {
      id: "demo", name: "Construtora Meridian", slug: "meridian", type: "construtora" as const,
      logo: null, brand_colors: null,
      portfolio_desc: "Há mais de 20 anos transformamos o conceito de moradia de alto padrão no Brasil.",
      about_text: "Construímos sonhos com a precisão de quem entende que um lar vai além de quatro paredes. Cada projeto é concebido para elevar o padrão de vida dos nossos moradores.",
      about_image: null, hero_tagline: "Onde a Excelência se Encontra com o Lar",
      hero_image: null, has_lancamentos: false, website: "https://meridian.com.br", whatsapp: null,
      created_at: "",
    },
    properties: [
      { id: "1", code: 1001, title: "Torre A — Apt 1201", description: null, price: 2850000, features: { suites: 4, vagas: 3, area_m2: 198, andar: 12 }, tags: ["VM", "MD", "AL"], status: "disponivel" as const, visibility: "publico" as const, created_by: "1", org_id: "demo", development_id: null, images: [], video_url: null, address: null, neighborhood: "Leblon", city: "Rio de Janeiro", slug: "torre-a-apt-1201", created_at: "", updated_at: "", cep: null, categoria: null, tipo_negocio: "venda", bairro_id: null, logradouro_id: null },
      { id: "2", code: 1002, title: "Torre A — Apt 1101", description: null, price: 2650000, features: { suites: 3, vagas: 2, area_m2: 165, andar: 11 }, tags: ["VM", "VV"], status: "reserva" as const, visibility: "publico" as const, created_by: "1", org_id: "demo", development_id: null, images: [], video_url: null, address: null, neighborhood: "Leblon", city: "Rio de Janeiro", slug: "torre-a-apt-1101", created_at: "", updated_at: "", cep: null, categoria: null, tipo_negocio: "venda", bairro_id: null, logradouro_id: null },
      { id: "3", code: 1003, title: "Torre B — Cobertura", description: null, price: 6200000, features: { suites: 5, vagas: 4, area_m2: 420 }, tags: ["CB", "VM", "MD", "AL"], status: "disponivel" as const, visibility: "publico" as const, created_by: "1", org_id: "demo", development_id: null, images: [], video_url: null, address: null, neighborhood: "Leblon", city: "Rio de Janeiro", slug: "torre-b-cobertura", created_at: "", updated_at: "", cep: null, categoria: null, tipo_negocio: "venda", bairro_id: null, logradouro_id: null },
      { id: "4", code: 1004, title: "Torre B — Apt 901", description: null, price: 1980000, features: { suites: 3, vagas: 2, area_m2: 142, andar: 9 }, tags: ["VG", "SC"], status: "vendido" as const, visibility: "publico" as const, created_by: "1", org_id: "demo", development_id: null, images: [], video_url: null, address: null, neighborhood: "Leblon", city: "Rio de Janeiro", slug: "torre-b-apt-901", created_at: "", updated_at: "", cep: null, categoria: null, tipo_negocio: "venda", bairro_id: null, logradouro_id: null },
      { id: "5", code: 1005, title: "Torre C — Apt 1502", description: null, price: 3100000, features: { suites: 4, vagas: 3, area_m2: 210, andar: 15 }, tags: ["VM", "PT"], status: "disponivel" as const, visibility: "publico" as const, created_by: "1", org_id: "demo", development_id: null, images: [], video_url: null, address: null, neighborhood: "Leblon", city: "Rio de Janeiro", slug: "torre-c-apt-1502", created_at: "", updated_at: "", cep: null, categoria: null, tipo_negocio: "venda", bairro_id: null, logradouro_id: null },
    ],
    developments: [],
  } : null)

  if (!data) notFound()

  const { org, properties, developments } = data
  const whatsapp = org.whatsapp ?? "5521999999999"

  return (
    <main>
      <ConstrutoraLanding
        org={org}
        properties={properties}
        developments={developments}
        refId={ref}
        initialSection={section}
        whatsapp={whatsapp}
      />
      <Footer orgName={org.name} website={org.website} whatsapp={whatsapp} />
      <CorretorMinisite defaultWhatsapp={whatsapp} defaultName={org.name} defaultPhoto={org.logo ?? undefined} />
    </main>
  )
}
