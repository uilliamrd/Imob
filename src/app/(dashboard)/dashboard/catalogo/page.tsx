import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { CatalogoClient } from "@/components/dashboard/CatalogoClient"
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
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <ListChecks size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Portfólio</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Meu Catálogo</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Imóveis adicionados ao seu portfólio. Destaque até 6 para exibição prioritária no seu minisite.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <CatalogoClient
        listings={(listings ?? []) as unknown as CatalogListing[]}
        userId={user.id}
        orgId={orgId}
        role={role}
      />
    </div>
  )
}
