import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { DevelopmentsManager } from "@/components/dashboard/DevelopmentsManager"
import { Flame, ExternalLink } from "lucide-react"
import Link from "next/link"
import { CopyLinkButton } from "@/components/ui/CopyLinkButton"
import type { Development } from "@/types/database"

export default async function LancamentosPage() {
  const user = await requireAuth(["construtora"])
  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id, organization:organizations(slug, has_lancamentos)")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null
  const org = profile?.organization as { slug?: string; has_lancamentos?: boolean } | null

  const { data: developments } = await adminClient
    .from("developments")
    .select("*")
    .eq("org_id", orgId ?? "")
    .eq("is_lancamento", true)
    .order("name")

  const lancamentos = (developments ?? []) as Development[]

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Flame size={18} className="text-orange-400" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Construtora</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Lançamentos</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Gerencie as landing pages cinematográficas de cada empreendimento em lançamento.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Active launches overview */}
      {lancamentos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {lancamentos.map((dev) => (
            <div key={dev.id} className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-colors group">
              <div className="aspect-video bg-[#111] relative">
                {dev.cover_image
                  ? <Image src={dev.cover_image} alt={dev.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Flame size={32} className="text-white/10" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-serif text-white font-semibold text-sm leading-tight">{dev.name}</p>
                  {(dev.neighborhood || dev.city) && (
                    <p className="text-white/40 text-xs font-sans">{dev.neighborhood}{dev.city ? `, ${dev.city}` : ""}</p>
                  )}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={12} className="text-orange-400" />
                  <span className="text-orange-400 text-[10px] uppercase tracking-wider font-sans">Landing Page ativa</span>
                </div>
                <div className="flex items-center gap-3">
                  <CopyLinkButton path={`/lancamento/${dev.id}`} />
                  <Link href={`/lancamento/${dev.id}`} target="_blank"
                    className="flex items-center gap-1.5 text-white/30 hover:text-gold transition-colors text-xs font-sans">
                    <ExternalLink size={12} /> Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!org?.has_lancamentos && (
        <div className="bg-amber-900/10 border border-amber-700/20 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <Flame size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-sans font-medium">Lançamentos não habilitados</p>
            <p className="text-amber-400/60 text-xs font-sans mt-0.5">
              O módulo de lançamentos precisa ser ativado pelo administrador do sistema para a sua organização.
            </p>
          </div>
        </div>
      )}

      {/* Manager */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          <h2 className="font-serif text-xl font-semibold text-white">Gerenciar Lançamentos</h2>
        </div>
        <div className="p-6">
          <DevelopmentsManager
            developments={lancamentos}
            orgId={orgId}
          />
        </div>
      </div>
    </div>
  )
}
