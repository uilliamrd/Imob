import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { DevelopmentsManager } from "@/components/dashboard/DevelopmentsManager"
import { MapPin, Layers, Building, Navigation } from "lucide-react"
import type { Development } from "@/types/database"

export default async function LocaisPage() {
  await requireAuth(["admin"])
  const supabase = await createClient()

  const [{ data: developments }, { data: orgs }] = await Promise.all([
    supabase.from("developments").select("*").order("name"),
    supabase.from("organizations").select("id, name").order("name"),
  ])

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MapPin size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Locais</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Cadastre empreendimentos, bairros e logradouros que serão vinculados pelos usuários ao criar imóveis.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Tabs visual */}
      <div className="flex gap-1 mb-8 border-b border-white/5 pb-0">
        {[
          { label: "Empreendimentos", icon: Layers, active: true },
          { label: "Bairros", icon: Navigation, active: false },
          { label: "Logradouros", icon: Building, active: false },
        ].map((tab) => (
          <div key={tab.label}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.15em] font-sans border-b-2 transition-colors ${
              tab.active
                ? "border-gold text-gold"
                : "border-transparent text-white/20 cursor-not-allowed"
            }`}>
            <tab.icon size={13} />
            {tab.label}
            {!tab.active && (
              <span className="ml-1 text-[9px] bg-white/5 text-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wide">em breve</span>
            )}
          </div>
        ))}
      </div>

      {/* Empreendimentos */}
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
