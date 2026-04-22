import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { OrgForm } from "@/components/dashboard/OrgForm"
import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { ExternalLink, Monitor, Edit3, Lock } from "lucide-react"
import type { UserRole, OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"
import Link from "next/link"

export default async function MinisitePage() {
  const user = await requireAuth(["imobiliaria", "corretor", "construtora", "secretaria"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, organization_id, full_name, whatsapp, creci, bio, avatar_url, slug")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  // Plan gate
  let entityType = resolveEntityType(role, null)
  let plan: OrgPlan = "free"
  if (orgId) {
    const { data: org } = await admin.from("organizations").select("type, plan").eq("id", orgId).single()
    if (org) { entityType = resolveEntityType(role, (org.type ?? null) as OrgType | null); plan = (org.plan ?? "free") as OrgPlan }
  } else {
    const { data: pr } = await admin.from("profiles").select("plan").eq("id", user.id).single()
    plan = (((pr as unknown as { plan?: string } | null)?.plan) ?? "free") as OrgPlan
  }
  const limits = getPlanLimits(entityType, plan)
  if (!limits.has_minisite) {
    return (
      <div className="px-4 py-6 lg:p-8 max-w-2xl">
        <div className="flex flex-col items-center text-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
            <Lock size={24} className="text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Minisite não disponível</h2>
          <p className="text-muted-foreground font-sans text-sm max-w-sm">
            Seu plano <strong>{getPlanName(entityType, plan)}</strong> não inclui minisite próprio. Faça upgrade para ter sua página personalizada.
          </p>
          <a href="/dashboard/upgrade"
            className="mt-2 px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg">
            Ver planos
          </a>
        </div>
      </div>
    )
  }

  // For imobiliaria: fetch org data
  const { data: org } = orgId
    ? await admin.from("organizations").select("*").eq("id", orgId).single()
    : { data: null }

  const corretorSlugOrId = profile?.slug ?? user.id
  const minisiteUrl =
    role === "construtora" && org?.slug ? `/construtora/${org.slug}` :
    role === "imobiliaria" && org?.slug ? `/imobiliaria/${org.slug}` :
    role === "corretor" ? `/corretor/${corretorSlugOrId}` :
    null

  return (
    <div className="px-4 py-6 lg:p-8 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Monitor size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">
            {role === "corretor" ? "Corretor" : role === "construtora" ? "Construtora" : "Imobiliária"}
          </p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Meu Site</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* URL card */}
      {minisiteUrl && (
        <div className="bg-card border border-gold/20 rounded-2xl p-6 mb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/60 font-sans mb-1">Endereço do seu site</p>
            <p className="text-foreground/70 font-mono text-sm">{minisiteUrl}</p>
          </div>
          <a href={minisiteUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <ExternalLink size={13} /> Abrir Site
          </a>
        </div>
      )}

      {/* Warning: slug not set for corretor */}
      {role === "corretor" && !profile?.slug && (
        <div className="mb-8 px-4 py-3 bg-amber-900/10 border border-amber-700/30 rounded-xl text-amber-300/80 text-xs font-sans flex items-center gap-2">
          <span className="text-amber-400">⚠</span>
          Seu link ainda usa um ID interno. Defina um URL personalizado (ex: <span className="font-mono">joao-silva</span>) no formulário abaixo para ter um link com seu nome.
        </div>
      )}

      {/* Iframe preview */}
      {minisiteUrl && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Monitor size={14} className="text-gold" />
            <p className="text-foreground/60 text-sm font-sans">Pré-visualização</p>
            <span className="text-muted-foreground/50 text-xs font-sans ml-auto">
              Pode demorar alguns segundos para carregar
            </span>
          </div>
          <div className="relative" style={{ height: "600px" }}>
            <iframe
              src={minisiteUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="Pré-visualização do minisite"
            />
          </div>
        </div>
      )}

      {/* For imobiliaria/construtora: org edit form */}
      {(role === "imobiliaria" || role === "construtora") && (
        <div className="bg-card border border-border rounded-2xl">
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Edit3 size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Personalizar</h2>
          </div>
          <div className="p-6">
            {org ? (
              <OrgForm
                userId={user.id}
                orgId={org.id}
                initialData={{
                  name: org.name ?? "",
                  type: org.type ?? "imobiliaria",
                  portfolio_desc: org.portfolio_desc ?? "",
                  about_text: org.about_text ?? "",
                  about_image: org.about_image ?? "",
                  hero_tagline: org.hero_tagline ?? "",
                  hero_image: org.hero_image ?? "",
                  website: org.website ?? "",
                  logo: org.logo ?? "",
                  brand_color: org.brand_colors?.primary ?? "#C4A052",
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-sans text-sm mb-4">
                  Você ainda não está vinculado a uma organização.
                </p>
                <Link href="/dashboard/organizacao"
                  className="text-gold text-sm font-sans hover:text-gold-light transition-colors">
                  Criar organização →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* For corretor: profile form inline (replaces Configurações) */}
      {role === "corretor" && (
        <div className="bg-card border border-border rounded-2xl">
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Edit3 size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Meu Perfil</h2>
          </div>
          <div className="p-6">
            <ProfileForm
              userId={user.id}
              initialData={{
                full_name: profile?.full_name ?? "",
                whatsapp: profile?.whatsapp ?? "",
                creci: profile?.creci ?? "",
                bio: profile?.bio ?? "",
                avatar_url: profile?.avatar_url ?? "",
                slug: profile?.slug ?? "",
              }}
            />
          </div>
        </div>
      )}

      {!minisiteUrl && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground font-sans text-sm">
            Nenhum minisite disponível. Configure seu perfil primeiro.
          </p>
        </div>
      )}
    </div>
  )
}
