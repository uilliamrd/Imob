import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AdminOrgsClient } from "@/components/dashboard/AdminOrgsClient"
import { OrgForm } from "@/components/dashboard/OrgForm"
import { Building2, MapPin, PlusCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  await requireAuth(["admin"])
  const adminClient = createAdminClient()

  const { data: orgs } = await adminClient
    .from("organizations")
    .select("*")
    .order("name")

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Building2 size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Organizações</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Organizations list */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl mb-8">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Organizações Cadastradas</h2>
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
