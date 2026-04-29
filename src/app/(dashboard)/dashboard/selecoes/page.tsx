import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { SelecoesClient } from "@/components/dashboard/SelecoesClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { BookOpen } from "lucide-react"
import type { Selection, SelectionItem, Property, Development } from "@/types/database"

export default async function SelecoesPage() {
  const user = await requireAuth(["corretor"])
  const admin = createAdminClient()

  const [{ data: profile }, { data: selections }, { data: allProperties }, { data: developments }] = await Promise.all([
    admin.from("profiles").select("organization_id").eq("id", user.id).single(),
    admin.from("selections").select(`
      *,
      items:selection_items(
        *,
        property:properties(id, title, slug, price, neighborhood, city, images, status, development_id)
      )
    `).eq("corretor_id", user.id).order("created_at", { ascending: false }),
    admin.from("properties").select("*, organization:organizations(id, name, type), development:developments(id, name)").eq("visibility", "publico").order("updated_at", { ascending: false }),
    admin.from("developments").select("id, name").order("name"),
  ])

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <PageHeader
        icon={BookOpen}
        category="Corretor"
        title="Seleções"
        description="Crie seleções personalizadas de imóveis por perfil de cliente e compartilhe uma página exclusiva."
      />

      <SelecoesClient
        userId={user.id}
        orgId={profile?.organization_id ?? null}
        initialSelections={(selections ?? []) as Array<Selection & { items: Array<SelectionItem & { property: Property }> }>}
        allProperties={(allProperties ?? []) as Property[]}
        developments={(developments ?? []) as Pick<Development, "id" | "name">[]}
      />
    </div>
  )
}
