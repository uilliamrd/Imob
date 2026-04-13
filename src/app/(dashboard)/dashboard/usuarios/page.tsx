import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AdminUsersClient } from "@/components/dashboard/AdminUsersClient"
import { InviteUserForm } from "@/components/dashboard/InviteUserForm"
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
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Users size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Usuários</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Invite new user */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl mb-8">
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
          <UserPlus size={16} className="text-gold" />
          <h2 className="font-serif text-xl font-semibold text-white">Cadastrar Usuário</h2>
        </div>
        <InviteUserForm orgs={orgOptions} />
      </div>

      {/* Users list */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Todos os Usuários</h2>
          <span className="text-white/30 text-xs font-sans">{enrichedProfiles.length} registros</span>
        </div>
        <AdminUsersClient
          users={enrichedProfiles as Parameters<typeof AdminUsersClient>[0]["users"]}
          orgs={orgOptions}
        />
      </div>
    </div>
  )
}
