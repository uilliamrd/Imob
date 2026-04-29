import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { DisponibilidadeClient } from "@/components/dashboard/DisponibilidadeClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { ClipboardList } from "lucide-react"
import type { Property, Development } from "@/types/database"

export default async function DisponibilidadePage() {
  const user = await requireAuth(["construtora"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.org_id ?? null

  const [{ data: developments }, { data: properties }] = await Promise.all([
    supabase.from("developments").select("*").eq("org_id", orgId ?? "").order("name"),
    supabase.from("properties").select("*").eq("org_id", orgId ?? "").order("development_id").order("price"),
  ])

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <PageHeader
        icon={ClipboardList}
        category="Construtora"
        title="Disponibilidade"
        description="Marque unidades como Disponível, Reservada ou Vendida por empreendimento."
      />

      <DisponibilidadeClient
        developments={(developments ?? []) as Development[]}
        properties={(properties ?? []) as Property[]}
      />
    </div>
  )
}
