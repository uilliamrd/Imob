import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BairrosManager } from "@/components/dashboard/BairrosManager"
import { LogradourosManager } from "@/components/dashboard/LogradourosManager"
import { MapPin, Navigation, Building } from "lucide-react"
import Link from "next/link"

type Tab = "bairros" | "logradouros"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function LocaisPage({ searchParams }: PageProps) {
  await requireAuth(["admin"])
  const { tab: tabParam } = await searchParams
  const activeTab: Tab = tabParam === "logradouros" ? "logradouros" : "bairros"

  const adminClient = createAdminClient()

  const [{ data: bairros }, { data: logradouros }] = await Promise.all([
    adminClient.from("bairros").select("*").order("name"),
    adminClient.from("logradouros").select("*").order("name"),
  ])

  const tabs = [
    { id: "bairros"     as Tab, label: "Bairros",     icon: Navigation, count: bairros?.length ?? 0 },
    { id: "logradouros" as Tab, label: "Logradouros", icon: Building,   count: logradouros?.length ?? 0 },
  ]

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MapPin size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Locais</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Cadastre bairros e logradouros que serão vinculados aos imóveis.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={`/dashboard/locais?tab=${tab.id}`}
              className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.15em] font-sans border-b-2 transition-colors ${
                isActive
                  ? "border-gold text-gold"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              <Icon size={13} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans ${
                  isActive ? "bg-gold/20 text-gold" : "bg-white/5 text-white/25"
                }`}>
                  {tab.count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl">
        {activeTab === "bairros" && (
          <>
            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
              <Navigation size={16} className="text-gold" />
              <h2 className="font-serif text-xl font-semibold text-white">Bairros</h2>
              <span className="ml-auto text-white/20 text-xs font-sans">{bairros?.length ?? 0} cadastrados</span>
            </div>
            <div className="p-6">
              <BairrosManager bairros={(bairros ?? []) as { id: string; name: string; city: string; state: string; created_at: string }[]} />
            </div>
          </>
        )}

        {activeTab === "logradouros" && (
          <>
            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
              <Building size={16} className="text-gold" />
              <h2 className="font-serif text-xl font-semibold text-white">Logradouros</h2>
              <span className="ml-auto text-white/20 text-xs font-sans">{logradouros?.length ?? 0} cadastrados</span>
            </div>
            <div className="p-6">
              <LogradourosManager
                logradouros={(logradouros ?? []) as { id: string; type: string; name: string; bairro_id: string | null; city: string; cep: string | null; created_at: string }[]}
                bairros={(bairros ?? []).map((b) => ({ id: b.id, name: b.name, city: b.city }))}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
