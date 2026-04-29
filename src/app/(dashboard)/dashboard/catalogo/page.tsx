import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { CatalogoClient } from "@/components/dashboard/CatalogoClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { ListChecks } from "lucide-react"
import type { Property, UserRole } from "@/types/database"

export interface CatalogListing {
  id: string
  is_featured: boolean
  property: Property
}

export default async function CatalogoPage() {
  const user = await requireAuth(["imobiliaria", "corretor"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  const { data: listings } = await supabase
    .from("property_listings")
    .select("id, is_featured, property:properties(id, title, slug, price, neighborhood, city, images, status, features, development_id, org_id, organization:organizations(id, name, type), development:developments(id, name))")
    .eq(role === "imobiliaria" ? "org_id" : "user_id", role === "imobiliaria" ? (orgId ?? "") : user.id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <PageHeader
        icon={ListChecks}
        category="Portfólio"
        title="Vitrine"
        description="Imóveis adicionados ao seu portfólio. Destaque até 6 para exibição prioritária no seu site."
      />

      <CatalogoClient
        listings={(listings ?? []) as unknown as CatalogListing[]}
        userId={user.id}
        orgId={orgId}
        role={role}
      />
    </div>
  )
}
