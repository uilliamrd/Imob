import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { SelecoesClient } from "@/components/dashboard/SelecoesClient"
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
    admin.from("properties").select("*").eq("visibility", "publico").order("updated_at", { ascending: false }),
    admin.from("developments").select("id, name").order("name"),
  ])

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Corretor</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Seleções</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Crie seleções personalizadas de imóveis por perfil de cliente e compartilhe uma página exclusiva.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

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
