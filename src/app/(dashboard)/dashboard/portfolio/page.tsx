import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { PortfolioManager } from "@/components/dashboard/PortfolioManager"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { BookOpen } from "lucide-react"
import { redirect } from "next/navigation"
import type { OrgPortfolio } from "@/types/database"

export default async function PortfolioPage() {
  const user = await requireAuth(["construtora", "admin"])
  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null
  if (!orgId) redirect("/dashboard")

  const { data: items } = await adminClient
    .from("org_portfolio")
    .select("*")
    .eq("org_id", orgId)
    .order("ano_entrega", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <div className="px-4 py-6 lg:p-8 space-y-6 max-w-4xl">
      <PageHeader
        icon={BookOpen}
        category="Construtora"
        title="Portfólio Histórico"
        subtitle="Projetos já entregues que não estão no sistema como empreendimentos ativos."
      />
      <PortfolioManager orgId={orgId} items={(items ?? []) as OrgPortfolio[]} />
    </div>
  )
}
