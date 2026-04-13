import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { DevelopmentsManager } from "@/components/dashboard/DevelopmentsManager"
import { Layers } from "lucide-react"
import type { Development } from "@/types/database"

export default async function EmpreendimentosPage() {
  await requireAuth(["admin"])
  const adminClient = createAdminClient()

  const [{ data: developments }, { data: orgs }] = await Promise.all([
    adminClient.from("developments").select("*").order("name"),
    adminClient.from("organizations").select("id, name").order("name"),
  ])

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Layers size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Empreendimentos</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Cadastre empreendimentos com galeria de fotos e página de vendas customizada.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
          <Layers size={16} className="text-gold" />
          <h2 className="font-serif text-xl font-semibold text-white">Empreendimentos</h2>
          <span className="ml-auto text-white/20 text-xs font-sans">{developments?.length ?? 0} cadastrados</span>
        </div>
        <div className="p-6">
          <DevelopmentsManager
            developments={(developments ?? []) as Development[]}
            orgId={null}
            orgs={(orgs ?? []).map((o) => ({ id: o.id, name: o.name }))}
          />
        </div>
      </div>
    </div>
  )
}
