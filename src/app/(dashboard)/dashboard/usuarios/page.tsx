import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AdminUsersClient } from "@/components/dashboard/AdminUsersClient"
import { InviteUserForm } from "@/components/dashboard/InviteUserForm"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Users, UserPlus } from "lucide-react"

export default async function UsuariosPage() {
  await requireAuth(["admin"])
  const adminClient = createAdminClient()

  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

  const [{ data: profiles }, { data: orgs }] = await Promise.all([
    adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
    adminClient.from("organizations").select("id, name, type").order("name"),
  ])

  const emailMap = Object.fromEntries((authUsers ?? []).map((u) => [u.id, u.email]))
  const orgMap = Object.fromEntries((orgs ?? []).map((o) => [o.id, o]))
  const enrichedProfiles = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id] ?? undefined,
    organization: p.organization_id ? { name: orgMap[p.organization_id]?.name ?? "—" } : null,
  }))
  const orgOptions = (orgs ?? []).map((o) => ({ id: o.id, name: o.name, type: o.type }))

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <PageHeader icon={Users} category="Administração" title="Usuários" />

      {/* Invite new user */}
      <div className="bg-card border border-border rounded-2xl mb-8">
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <UserPlus size={16} className="text-gold" />
          <h2 className="font-serif text-xl font-semibold text-white">Cadastrar Usuário</h2>
        </div>
        <InviteUserForm orgs={orgOptions} />
      </div>

      {/* Users list */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Todos os Usuários</h2>
          <span className="text-muted-foreground text-xs font-sans">{enrichedProfiles.length} registros</span>
        </div>
        <AdminUsersClient
          users={enrichedProfiles as Parameters<typeof AdminUsersClient>[0]["users"]}
          orgs={orgOptions}
        />
      </div>
    </div>
  )
}
