import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { VitrineClient } from "@/components/dashboard/VitrineClient"
import { Globe } from "lucide-react"
import type { Property, UserRole } from "@/types/database"

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function VitrinePage({ searchParams }: PageProps) {
  const { search } = await searchParams
  const user = await requireAuth(["imobiliaria", "corretor"])
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  // Use admin client so the org join bypasses RLS and construtora badges always load
  const { data: properties } = await admin
    .from("properties")
    .select("*, organization:organizations(id, name, type, logo, slug, brand_colors)")
    .eq("visibility", "publico")
    .order("created_at", { ascending: false })

  // IDs already in user's catalog
  const { data: listed } = await supabase
    .from("property_listings")
    .select("property_id")
    .eq(role === "imobiliaria" ? "org_id" : "user_id", role === "imobiliaria" ? (orgId ?? "") : user.id)

  const listedIds = new Set((listed ?? []).map((l) => l.property_id))

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Curadoria</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Base de Imóveis</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Base completa de imóveis disponíveis no sistema. Adicione ao seu portfólio para exibir no minisite.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <VitrineClient
        properties={(properties ?? []) as Property[]}
        listedIds={listedIds}
        userId={user.id}
        orgId={orgId}
        role={role}
        initialSearch={search ?? ""}
      />
    </div>
  )
}
