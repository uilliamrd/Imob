import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { OrgForm } from "@/components/dashboard/OrgForm"
import { ExternalLink, Monitor, Edit3 } from "lucide-react"
import type { UserRole } from "@/types/database"
import Link from "next/link"

export default async function MinisitePage() {
  const user = await requireAuth(["imobiliaria", "corretor"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, organization_id, full_name")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  // For imobiliaria: fetch org data to show/edit minisite
  const { data: org } = orgId
    ? await admin.from("organizations").select("*").eq("id", orgId).single()
    : { data: null }

  // Minisite URL
  const minisiteUrl =
    role === "imobiliaria" && org?.slug ? `/imobiliaria/${org.slug}` :
    role === "corretor" ? `/corretor/${user.id}` :
    null

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Monitor size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">
            {role === "corretor" ? "Corretor" : "Imobiliária"}
          </p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Meu Minisite</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* URL card */}
      {minisiteUrl && (
        <div className="bg-[#161616] border border-gold/20 rounded-2xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/60 font-sans mb-1">Endereço do seu site</p>
            <p className="text-white/70 font-mono text-sm">{minisiteUrl}</p>
          </div>
          <div className="flex gap-3">
            <a href={minisiteUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
              <ExternalLink size={13} /> Abrir Site
            </a>
            <Link href="/dashboard/organizacao"
              className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
              <Edit3 size={13} /> Editar Branding
            </Link>
          </div>
        </div>
      )}

      {/* Iframe preview */}
      {minisiteUrl && (
        <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Monitor size={14} className="text-gold" />
            <p className="text-white/60 text-sm font-sans">Pré-visualização</p>
            <span className="text-white/20 text-xs font-sans ml-auto">
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

      {/* For imobiliaria: show the org edit form inline */}
      {role === "imobiliaria" && (
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
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
                <p className="text-white/30 font-sans text-sm mb-4">
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

      {/* For corretor: compact links to customize profile */}
      {role === "corretor" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/organizacao"
            className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/20 transition-all">
            <Edit3 size={20} className="text-gold mb-3" />
            <h3 className="font-serif text-lg font-semibold text-white mb-1">Personalizar Branding</h3>
            <p className="text-white/30 text-sm font-sans">Editar logo, cores e texto do minisite</p>
          </Link>
          <Link href="/dashboard/corretor"
            className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/20 transition-all">
            <ExternalLink size={20} className="text-gold mb-3" />
            <h3 className="font-serif text-lg font-semibold text-white mb-1">Links de Referência</h3>
            <p className="text-white/30 text-sm font-sans">Gerar links rastreáveis para imóveis</p>
          </Link>
        </div>
      )}

      {/* No org linked */}
      {!minisiteUrl && (
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-white/30 font-sans text-sm">
            Nenhum minisite disponível. Configure seu branding primeiro.
          </p>
          <Link href="/dashboard/organizacao"
            className="inline-block mt-4 text-gold text-sm font-sans hover:text-gold-light transition-colors">
            Configurar agora →
          </Link>
        </div>
      )}
    </div>
  )
}
