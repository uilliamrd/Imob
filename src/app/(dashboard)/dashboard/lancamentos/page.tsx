import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { requireAuth } from "@/lib/auth"
import { DevelopmentsManager } from "@/components/dashboard/DevelopmentsManager"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Flame, ExternalLink } from "lucide-react"
import Link from "next/link"
import { CopyLinkButton } from "@/components/ui/CopyLinkButton"
import type { Development } from "@/types/database"

export default async function LancamentosPage() {
  const user = await requireAuth(["construtora"])
  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null

  let org: { slug?: string; has_lancamentos?: boolean } | null = null
  if (orgId) {
    const { data: orgData } = await adminClient
      .from("organizations")
      .select("slug, has_lancamentos")
      .eq("id", orgId)
      .single()
    org = orgData
  }

  const { data: developments } = await adminClient
    .from("developments")
    .select("*")
    .eq("org_id", orgId ?? "")
    .order("name")

  const allDevelopments = (developments ?? []) as Development[]
  const lancamentos = allDevelopments.filter((d) => d.is_lancamento)

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <PageHeader
        icon={Flame}
        category="Construtora"
        title="Lançamentos"
        description="Gerencie as landing pages cinematográficas de cada empreendimento em lançamento."
      />

      {/* Active launches overview */}
      {lancamentos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {lancamentos.map((dev) => (
            <div key={dev.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-orange-500/20 transition-colors group">
              <div className="aspect-video bg-muted/50 relative">
                {dev.cover_image
                  ? <Image src={dev.cover_image} alt={dev.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Flame size={32} className="text-white/10" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-serif text-foreground font-semibold text-sm leading-tight">{dev.name}</p>
                  {(dev.neighborhood || dev.city) && (
                    <p className="text-muted-foreground text-xs font-sans">{dev.neighborhood}{dev.city ? `, ${dev.city}` : ""}</p>
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
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors text-xs font-sans">
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
      <div className="bg-card border border-border rounded-2xl">
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          <h2 className="font-serif text-xl font-semibold text-white">Gerenciar Empreendimentos</h2>
          <span className="ml-auto text-muted-foreground/50 text-xs font-sans">{allDevelopments.length} cadastrados</span>
        </div>
        <div className="p-6">
          <DevelopmentsManager
            developments={allDevelopments}
            orgId={orgId}
          />
        </div>
      </div>
    </div>
  )
}
