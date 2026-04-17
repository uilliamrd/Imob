import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnunciosClient } from "@/components/dashboard/AnunciosClient"
import type { PropertyAd } from "@/types/database"

export const dynamic = "force-dynamic"

const PROPERTY_SELECT =
  "id, title, slug, price, images, neighborhood, city, org_id, organization:organizations(id, name)"

export default async function AnunciosPage() {
  await requireAuth(["admin"])

  const admin = createAdminClient()

  const [{ data: rawAds }, { data: rawProperties }] = await Promise.all([
    admin
      .from("property_ads")
      .select(`*, property:properties(${PROPERTY_SELECT})`)
      .order("created_at", { ascending: false }),
    admin
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("visibility", "publico")
      .eq("status", "disponivel")
      .order("title"),
  ])

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-1">Dashboard</p>
        <h1 className="font-serif text-3xl font-bold text-foreground">Anúncios</h1>
        <p className="text-muted-foreground text-sm font-sans mt-1">
          Gerencie destaques e super destaques exibidos no portal de imóveis.
        </p>
      </div>

      <AnunciosClient
        initialAds={(rawAds ?? []) as unknown as PropertyAd[]}
        allProperties={(rawProperties ?? []) as unknown as Array<{
          id: string; title: string; slug: string; price: number
          images: string[]; neighborhood: string | null; city: string | null
          org_id: string | null
          organization: { id: string; name: string } | null
        }>}
      />
    </div>
  )
}
