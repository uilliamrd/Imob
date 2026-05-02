import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { PropertyWizard } from "@/components/forms/PropertyWizard"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Home } from "lucide-react"
import type { Development } from "@/types/database"

export default async function NovoImovelPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora", "corretor"])
  const admin = createAdminClient()

  const { data: profile } = await admin.from("profiles").select("organization_id, role").eq("id", user.id).single()

  const isAdmin = profile?.role === "admin"
  const orgId   = profile?.organization_id ?? null
  const role    = profile?.role ?? "corretor"

  const [
    { data: developments },
    { data: bairros },
    { data: logradouros },
    { data: allOrgs },
  ] = await Promise.all([
    isAdmin
      ? admin.from("developments").select("*").order("name")
      : admin.from("developments").select("*").eq("org_id", orgId ?? "").order("name"),
    admin.from("bairros").select("*").order("name"),
    admin.from("logradouros").select("*").order("name"),
    isAdmin ? admin.from("organizations").select("id, name, type").order("name") : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="px-4 py-6 lg:p-8">
      <PageHeader icon={Home} category="Portfólio" title="Novo Imóvel" subtitle="Preencha os dados do imóvel passo a passo." />

      <PropertyWizard
        orgId={orgId}
        role={role}
        isAdmin={isAdmin}
        construtoras={isAdmin ? ((allOrgs ?? []) as { id: string; name: string; type: string }[]) : []}
        developments={(developments ?? []) as Development[]}
        bairros={(bairros ?? []) as { id: string; name: string; city: string; state: string }[]}
        logradouros={(logradouros ?? []) as { id: string; type: string; name: string; bairro_id: string | null; city: string; cep: string | null }[]}
      />
    </div>
  )
}
