import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { OrgDetailList } from "@/components/dashboard/OrgDetailList"
import { PageHeader } from "@/components/dashboard/PageHeader"
import type { OrgWithStats } from "@/components/dashboard/OrgDetailList"
import type { Organization } from "@/types/database"
import { Building2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ConstrutorasPage() {
  const user = await requireAuth(["admin"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: orgs } = await admin
    .from("organizations")
    .select("*")
    .eq("type", "construtora")
    .order("name")

  const orgsWithStats: OrgWithStats[] = await Promise.all(
    (orgs ?? []).map(async (org: Organization) => {
      const [{ count: corretores }, { count: imoveis }] = await Promise.all([
        admin
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("role", "corretor"),
        admin
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("org_id", org.id),
      ])
      return { ...org, corretores: corretores ?? 0, imoveis: imoveis ?? 0 }
    })
  )

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <PageHeader
        icon={Building2}
        category="Administração"
        title="Construtoras"
        description="Gerencie construtoras, planos e empreendimentos vinculados."
      />

      <OrgDetailList initialOrgs={orgsWithStats} orgType="construtora" />
    </div>
  )
}
