import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
  const supabase = await createClient()

  const [{ data }, { data: profile }, { data: developments }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).single(),
    supabase.from("profiles").select("organization_id").eq("id", user.id).single(),
    supabase.from("developments").select("*").order("name"),
  ])

  if (!data) notFound()

  const property = data as Property

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Portfólio</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">
            Editar Imóvel
          </AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2">{property.title}</p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <PropertyForm
        propertyId={id}
        orgId={profile?.organization_id}
        developments={(developments ?? []) as Development[]}
        initialData={{
          title: property.title,
          slug: property.slug,
          description: property.description ?? undefined,
          price: property.price,
          status: property.status,
          visibility: property.visibility,
          tags: property.tags,
          features: property.features,
          neighborhood: property.neighborhood ?? undefined,
          city: property.city ?? undefined,
          address: property.address ?? undefined,
          images: property.images,
          code: property.code,
          development_id: property.development_id ?? undefined,
        }}
      />
    </div>
  )
}
