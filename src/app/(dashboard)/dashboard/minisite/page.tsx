import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { OrgForm } from "@/components/dashboard/OrgForm"
import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { LockedFeature } from "@/components/dashboard/LockedFeature"
import { ExternalLink, Monitor, Edit3 } from "lucide-react"
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
      <LockedFeature
        title="Minisite não disponível"
        description="Faça upgrade para ter sua página personalizada com portfólio, contato e galeria de imóveis."
        planName={getPlanName(entityType, plan)}
        icon={Monitor}
      />
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
      <PageHeader
        icon={Monitor}
        category={role === "corretor" ? "Corretor" : role === "construtora" ? "Construtora" : "Imobiliária"}
        title="Meu Site"
        extra={minisiteUrl ? (
          <a href={minisiteUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-gold/20 text-gold/60 hover:text-gold hover:border-gold/40 transition-all duration-200 text-[11px] uppercase tracking-[0.12em] font-sans rounded-xl">
            <ExternalLink size={12} /> Ver site
          </a>
        ) : undefined}
      />

      {/* URL info */}
      {minisiteUrl && (
        <div className="bg-card border border-border/60 rounded-2xl px-5 py-3.5 mb-4 flex items-center gap-3">
          <Monitor size={13} className="text-gold/50 flex-shrink-0" />
          <p className="text-foreground/50 font-mono text-xs flex-1 truncate">{minisiteUrl}</p>
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
