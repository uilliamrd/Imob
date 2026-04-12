import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AdminUsersClient } from "@/components/dashboard/AdminUsersClient"
import { AdminOrgsClient } from "@/components/dashboard/AdminOrgsClient"
import { OrgForm } from "@/components/dashboard/OrgForm"
import { Shield, Users, Building2, Key, PlusCircle, Layers, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  await requireAuth(["admin"])
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

  const [{ data: profiles }, { data: orgs }, { data: properties }, { data: developments }] = await Promise.all([
    supabase.from("profiles").select("*, organization:organizations(name)").order("created_at", { ascending: false }),
    supabase.from("organizations").select("*").order("name"),
    supabase.from("properties").select("id").limit(1000),
    supabase.from("developments").select("id").limit(1000),
  ])

  const emailMap = Object.fromEntries((authUsers ?? []).map((u) => [u.id, u.email]))
  const enrichedProfiles = (profiles ?? []).map((p) => ({ ...p, email: emailMap[p.id] ?? undefined }))

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Super Admin</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Administração</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: "Usuários",         value: profiles?.length ?? 0,    icon: Users },
          { label: "Organizações",     value: orgs?.length ?? 0,        icon: Building2 },
          { label: "Imóveis",          value: properties?.length ?? 0,  icon: Key },
          { label: "Empreendimentos",  value: developments?.length ?? 0, icon: Layers },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-[#161616] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon size={16} className="text-gold" />
                <p className="text-white/30 text-xs uppercase tracking-wider font-sans">{s.label}</p>
              </div>
              <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Users */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl mb-8">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Usuários</h2>
          <span className="text-white/30 text-xs font-sans">{profiles?.length ?? 0} registros</span>
        </div>
        <AdminUsersClient
          users={enrichedProfiles as Parameters<typeof AdminUsersClient>[0]["users"]}
          orgs={(orgs ?? []).map((o) => ({ id: o.id, name: o.name, type: o.type }))}
        />
      </div>

      {/* Organizations */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl mb-8">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Organizações</h2>
          <span className="text-white/30 text-xs font-sans">{orgs?.length ?? 0} registros</span>
        </div>
        <AdminOrgsClient orgs={(orgs ?? []) as Parameters<typeof AdminOrgsClient>[0]["orgs"]} />
      </div>

      {/* Locais shortcut */}
      <Link href="/dashboard/locais"
        className="group flex items-center justify-between bg-[#161616] border border-white/5 hover:border-gold/20 rounded-2xl px-6 py-5 mb-8 transition-colors">
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-gold" />
          <div>
            <p className="font-serif text-lg font-semibold text-white">Locais</p>
            <p className="text-white/30 text-xs font-sans mt-0.5">Empreendimentos, bairros e logradouros cadastrados no sistema</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-white/20 group-hover:text-gold transition-colors" />
      </Link>

      {/* New org */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
          <PlusCircle size={16} className="text-gold" />
          <h2 className="font-serif text-xl font-semibold text-white">Nova Organização</h2>
        </div>
        <div className="p-6">
          <OrgForm userId="" orgId={undefined} isAdmin={true}
            initialData={{ name: "", type: "imobiliaria", portfolio_desc: "", website: "", logo: "" }} />
        </div>
      </div>
    </div>
  )
}
