import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { RotateCcw, User, CheckCircle, XCircle, Star, BookOpen, Eye, Home } from "lucide-react"
import Image from "next/image"

interface CorretorScore {
  id: string
  full_name: string | null
  organization_id: string | null
  last_lead_at: string | null
  score: number
}

interface CorretorDetail {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  whatsapp: string | null
  creci: string | null
  last_lead_at: string | null
  score: number
  minisite_ok: boolean
  selections_count: number
  selections_views: number
  properties_count: number
}

function formatRelative(ts: string | null): string {
  if (!ts) return "Nunca"
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return "Agora há pouco"
  if (diffH < 24) return `Há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "Ontem"
  if (diffD < 7) return `Há ${diffD} dias`
  return d.toLocaleDateString("pt-BR")
}

export default async function RodizioPage() {
  const user = await requireAuth(["imobiliaria", "admin"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null

  // Fetch scores from the view
  let scoresQuery = admin
    .from("corretor_scores")
    .select("id, full_name, organization_id, last_lead_at, score")
    .order("score", { ascending: false })
    .order("last_lead_at", { ascending: true, nullsFirst: true })

  if (orgId && profile?.role !== "admin") {
    scoresQuery = scoresQuery.eq("organization_id", orgId)
  }

  const { data: scores } = await scoresQuery

  const corretorIds = (scores ?? []).map((s: CorretorScore) => s.id)

  // Fetch extra details for each corretor
  const { data: profiles } = corretorIds.length > 0
    ? await admin
        .from("profiles")
        .select("id, avatar_url, bio, whatsapp, creci")
        .in("id", corretorIds)
    : { data: [] }

  const { data: selectionCounts } = corretorIds.length > 0
    ? await admin
        .from("selections")
        .select("corretor_id, views")
        .in("corretor_id", corretorIds)
    : { data: [] }

  const { data: propertyCounts } = corretorIds.length > 0
    ? await admin
        .from("properties")
        .select("created_by")
        .in("created_by", corretorIds)
    : { data: [] }

  // Build detail map
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const selByCorretor = new Map<string, { count: number; views: number }>()
  for (const s of (selectionCounts ?? [])) {
    const prev = selByCorretor.get(s.corretor_id) ?? { count: 0, views: 0 }
    selByCorretor.set(s.corretor_id, { count: prev.count + 1, views: prev.views + (s.views ?? 0) })
  }

  const propByCorretor = new Map<string, number>()
  for (const p of (propertyCounts ?? [])) {
    propByCorretor.set(p.created_by, (propByCorretor.get(p.created_by) ?? 0) + 1)
  }

  const corretores: CorretorDetail[] = (scores ?? []).map((s: CorretorScore) => {
    const p = profileMap.get(s.id)
    const sel = selByCorretor.get(s.id) ?? { count: 0, views: 0 }
    const propCount = propByCorretor.get(s.id) ?? 0
    const minisite_ok = !!(p?.bio && p?.avatar_url && p?.whatsapp && p?.creci)
    return {
      id: s.id,
      full_name: s.full_name,
      avatar_url: p?.avatar_url ?? null,
      bio: p?.bio ?? null,
      whatsapp: p?.whatsapp ?? null,
      creci: p?.creci ?? null,
      last_lead_at: s.last_lead_at,
      score: s.score,
      minisite_ok,
      selections_count: sel.count,
      selections_views: sel.views,
      properties_count: propCount,
    }
  })

  const nextUp = corretores[0] ?? null

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <RotateCcw size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Distribuição</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Rodízio de Leads</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
        <p className="text-muted-foreground font-sans text-sm mt-4 max-w-xl">
          Leads recebidos sem referência de corretor são distribuídos automaticamente por ordem de pontuação.
          Corretores com mais pontos têm prioridade, mas dentro do mesmo score o que há mais tempo sem receber leads é o próximo.
        </p>
      </div>

      {/* Próximo na fila */}
      {nextUp && (
        <div className="bg-card border border-gold/20 rounded-2xl p-6 mb-8 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {nextUp.avatar_url ? (
              <Image src={nextUp.avatar_url} alt={nextUp.full_name ?? "Corretor"} width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-gold/40" />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center">
                <User size={22} className="text-gold/60" />
              </div>
            )}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center text-graphite text-[9px] font-bold">1</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-sans mb-0.5">Próximo na fila</p>
            <p className="font-serif text-lg font-semibold text-white truncate">{nextUp.full_name ?? "Corretor"}</p>
            <p className="text-muted-foreground text-xs font-sans">
              {nextUp.score} pontos · Último lead: {formatRelative(nextUp.last_lead_at)}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="font-serif text-3xl font-bold text-gold">{nextUp.score}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-sans">pts</p>
          </div>
        </div>
      )}

      {/* Critérios de pontuação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Minisite completo",    pts: "+50 pts", icon: Star,     desc: "Bio, foto, WhatsApp e CRECI preenchidos" },
          { label: "Por seleção criada",   pts: "+5 pts",  icon: BookOpen, desc: "Cada seleção de imóveis compartilhada" },
          { label: "Por view em seleção",  pts: "+1 pt",   icon: Eye,      desc: "Max. 100 pts nesta categoria" },
          { label: "Por imóvel cadastrado",pts: "+3 pts",  icon: Home,     desc: "Imóveis ativos cadastrados" },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4">
              <Icon size={14} className="text-gold mb-2" />
              <p className="text-gold font-serif text-lg font-bold">{c.pts}</p>
              <p className="text-foreground/80 text-xs font-sans font-medium mt-1">{c.label}</p>
              <p className="text-muted-foreground/50 text-[10px] font-sans mt-0.5 leading-snug">{c.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Ranking */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-serif text-xl font-semibold text-white">Ranking de Corretores</h2>
        </div>

        <div className="grid grid-cols-12 gap-3 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans border-b border-border">
          <span className="col-span-1">#</span>
          <span className="col-span-4">Corretor</span>
          <span className="col-span-1 text-center" title="Minisite completo">Site</span>
          <span className="col-span-1 text-center" title="Seleções">Sel</span>
          <span className="col-span-1 text-center" title="Views">Views</span>
          <span className="col-span-1 text-center" title="Imóveis">Im</span>
          <span className="col-span-2">Último lead</span>
          <span className="col-span-1 text-right">Score</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {corretores.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground/50 font-sans text-sm">
              Nenhum corretor ativo encontrado.
            </div>
          ) : (
            corretores.map((c, i) => (
              <div key={c.id} className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                <span className="col-span-1 text-muted-foreground/40 font-sans text-sm font-medium">{i + 1}</span>

                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {c.avatar_url ? (
                      <Image src={c.avatar_url} alt={c.full_name ?? "C"} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gold/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <User size={14} className="text-gold/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground/80 text-sm font-sans font-medium truncate">{c.full_name ?? "—"}</p>
                    {c.creci && <p className="text-muted-foreground/50 text-[10px] font-sans">CRECI {c.creci}</p>}
                  </div>
                </div>

                <div className="col-span-1 flex justify-center">
                  {c.minisite_ok
                    ? <CheckCircle size={13} className="text-emerald-400" />
                    : <XCircle size={13} className="text-zinc-600" />
                  }
                </div>

                <div className="col-span-1 text-center">
                  <span className="text-muted-foreground text-xs font-sans">{c.selections_count}</span>
                </div>

                <div className="col-span-1 text-center">
                  <span className="text-muted-foreground text-xs font-sans">{c.selections_views}</span>
                </div>

                <div className="col-span-1 text-center">
                  <span className="text-muted-foreground text-xs font-sans">{c.properties_count}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-muted-foreground/60 text-xs font-sans">{formatRelative(c.last_lead_at)}</span>
                </div>

                <div className="col-span-1 text-right">
                  <span className={`font-serif text-lg font-bold ${i === 0 ? "text-gold" : "text-foreground/60"}`}>{c.score}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
