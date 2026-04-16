import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { PropertyForm } from "@/components/dashboard/PropertyForm"
import type { Property, Development } from "@/types/database"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarImovelPage({ params }: PageProps) {
  const user = await requireAuth(["admin", "imobiliaria", "construtora", "corretor"])
  const { id } = await params
  const admin = createAdminClient()

  const [
    { data },
    { data: profile },
    { data: developments },
    { data: bairros },
    { data: logradouros },
    { data: allOrgs },
  ] = await Promise.all([
    admin.from("properties").select("*").eq("id", id).single(),
    admin.from("profiles").select("organization_id, role").eq("id", user.id).single(),
    admin.from("developments").select("*").order("name"),
    admin.from("bairros").select("*").order("name"),
    admin.from("logradouros").select("*").order("name"),
    admin.from("organizations").select("id, name, type").order("name"),
  ])

  if (!data) notFound()

  const property = data as Property
  const isAdmin = profile?.role === "admin"

  // Ownership check: non-admins can only edit their own org's properties
  if (!isAdmin && property.org_id !== profile?.organization_id) {
    redirect("/dashboard/imoveis")
  }

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Portfólio</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Editar Imóvel</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2">{property.title}</p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <PropertyForm
        propertyId={id}
        orgId={profile?.organization_id}
        isAdmin={isAdmin}
        construtoras={isAdmin ? ((allOrgs ?? []) as { id: string; name: string; type: string }[]) : []}
        developments={(developments ?? []) as Development[]}
        bairros={(bairros ?? []) as { id: string; name: string; city: string; state: string }[]}
        logradouros={(logradouros ?? []) as { id: string; type: string; name: string; bairro_id: string | null; city: string; cep: string | null }[]}
        initialData={{
          title:          property.title,
          slug:           property.slug,
          description:    property.description ?? undefined,
          price:          property.price,
          status:         property.status,
          visibility:     property.visibility,
          tags:           property.tags,
          images:         property.images,
          video_url:      property.video_url,
          development_id: property.development_id,
          neighborhood:   property.neighborhood,
          city:           property.city,
          address:        property.address,
          cep:            property.cep,
          categoria:      property.categoria,
          tipo_negocio:   property.tipo_negocio,
          bairro_id:      property.bairro_id,
          logradouro_id:  property.logradouro_id,
          code:           property.code,
          features:       property.features,
          org_id:         property.org_id,
        }}
      />
    </div>
  )
}
