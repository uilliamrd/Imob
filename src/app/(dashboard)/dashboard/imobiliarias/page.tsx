import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { OrgDetailList } from "@/components/dashboard/OrgDetailList"
import type { OrgWithStats } from "@/components/dashboard/OrgDetailList"
import type { Organization } from "@/types/database"

export const dynamic = "force-dynamic"

export default async function ImobiliariasPage() {
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
    .eq("type", "imobiliaria")
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
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-foreground">Imobiliárias</h1>
        <p className="text-muted-foreground font-sans text-sm mt-1">
          Gerencie imobiliárias, planos e corretores vinculados.
        </p>
      </div>

      <OrgDetailList initialOrgs={orgsWithStats} orgType="imobiliaria" />
    </div>
  )
}
