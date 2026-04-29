import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { OrgForm } from "@/components/dashboard/OrgForm"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Building2 } from "lucide-react"

export default async function OrganizacaoPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora"])
  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: org } = profile?.organization_id
    ? await adminClient.from("organizations").select("*").eq("id", profile.organization_id).single()
    : { data: null }

  return (
    <div className="px-4 py-6 lg:p-8 max-w-2xl">
      <PageHeader icon={Building2} category="Configurações" title="Organização" />

      {!org ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground font-sans text-sm">
            Você ainda não está vinculado a nenhuma organização.
          </p>
          <p className="text-muted-foreground/50 font-sans text-xs mt-2">
            Peça ao administrador para te associar a uma imobiliária ou construtora.
          </p>
        </div>
      ) : (
        <OrgForm
          userId={user.id}
          orgId={org.id}
          initialData={{
            name: org.name ?? "",
            type: org.type ?? "construtora",
            portfolio_desc: org.portfolio_desc ?? "",
            website: org.website ?? "",
            logo: org.logo ?? "",
            brand_color: org.brand_colors?.primary ?? "#C4A052",
          }}
        />
      )}
    </div>
  )
}
