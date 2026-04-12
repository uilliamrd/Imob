"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { Save, ExternalLink, Globe, FileText, Image, Flame } from "lucide-react"
import type { OrgType } from "@/types/database"

interface OrgFormProps {
  userId: string
  orgId?: string
  initialData: {
    name: string
    type: OrgType | string
    portfolio_desc: string
    about_text?: string
    about_image?: string
    hero_tagline?: string
    hero_image?: string
    website: string
    logo: string
    has_lancamentos?: boolean
    slug?: string
  }
  isAdmin?: boolean
}

export function OrgForm({ userId, orgId, initialData, isAdmin = false }: OrgFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData.name)
  const [type, setType] = useState<OrgType>(initialData.type as OrgType || "construtora")
  const [portfolioDesc, setPortfolioDesc] = useState(initialData.portfolio_desc)
  const [aboutText, setAboutText] = useState(initialData.about_text ?? "")
  const [heroTagline, setHeroTagline] = useState(initialData.hero_tagline ?? "")
  const [website, setWebsite] = useState(initialData.website)
  const [hasLancamentos, setHasLancamentos] = useState(initialData.has_lancamentos ?? false)

  const [logoUrls, setLogoUrls] = useState<string[]>(initialData.logo ? [initialData.logo] : [])
  const [heroImageUrls, setHeroImageUrls] = useState<string[]>(initialData.hero_image ? [initialData.hero_image] : [])
  const [aboutImageUrls, setAboutImageUrls] = useState<string[]>(initialData.about_image ? [initialData.about_image] : [])

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function slugify(s: string) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const payload: Record<string, unknown> = {
      name,
      type,
      slug: slugify(name),
      portfolio_desc: portfolioDesc || null,
      about_text: aboutText || null,
      hero_tagline: heroTagline || null,
      hero_image: heroImageUrls[0] ?? null,
      about_image: aboutImageUrls[0] ?? null,
      website: website || null,
      logo: logoUrls[0] ?? null,
    }

    if (isAdmin) {
      payload.has_lancamentos = hasLancamentos
    }

    if (orgId) {
      const { error } = await supabase.from("organizations").update(payload).eq("id", orgId)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { data: newOrg, error } = await supabase
        .from("organizations")
        .insert(payload)
        .select("id")
        .single()
      if (error || !newOrg) { setError(error?.message ?? "Erro ao criar organização."); setLoading(false); return }
      if (userId) {
        await supabase.from("profiles").update({ organization_id: newOrg.id }).eq("id", userId)
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2"
  const landingSlug = slugify(name)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Logo */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Image size={15} className="text-gold" />
          <h2 className="font-serif text-lg font-semibold text-white">Logo</h2>
        </div>
        <ImageUpload bucket="org-logos" folder={orgId ?? "temp"} value={logoUrls}
          onChange={(urls) => setLogoUrls(urls.slice(-1))} maxFiles={1} />
      </section>

      {/* Basic info */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Globe size={15} className="text-gold" />
          <h2 className="font-serif text-lg font-semibold text-white">Informações Gerais</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome da Empresa *</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Construtora Meridian" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as OrgType)} className={inputClass}>
              <option value="construtora">Construtora</option>
              <option value="imobiliaria">Imobiliária</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://suaempresa.com.br" className={inputClass} />
        </div>

        {/* Admin-only: Lançamentos toggle */}
        {isAdmin && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#111]">
            <div className="flex items-center gap-3">
              <Flame size={16} className={hasLancamentos ? "text-gold" : "text-white/20"} />
              <div>
                <p className="text-white/80 text-sm font-sans font-medium">Plano com Lançamentos</p>
                <p className="text-white/30 text-xs font-sans">Ativa a seção de Lançamentos no minisite (max 5)</p>
              </div>
            </div>
            <button type="button" onClick={() => setHasLancamentos(!hasLancamentos)}
              className={`w-12 h-6 rounded-full transition-colors relative ${hasLancamentos ? "bg-gold" : "bg-white/10"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hasLancamentos ? "left-7" : "left-1"}`} />
            </button>
          </div>
        )}
      </section>

      {/* Hero section */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <FileText size={15} className="text-gold" />
          <h2 className="font-serif text-lg font-semibold text-white">Seção Hero (Topo do Site)</h2>
        </div>
        <div>
          <label className={labelClass}>Frase de Impacto (Tagline)</label>
          <input type="text" value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)}
            placeholder="Onde a Excelência se Encontra com o Lar" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Imagem de Fundo do Hero</label>
          <ImageUpload bucket="org-logos" folder={`${orgId ?? "temp"}/hero`} value={heroImageUrls}
            onChange={(urls) => setHeroImageUrls(urls.slice(-1))} maxFiles={1} />
        </div>
      </section>

      {/* About section */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <FileText size={15} className="text-gold" />
          <h2 className="font-serif text-lg font-semibold text-white">Seção Sobre</h2>
        </div>
        <div>
          <label className={labelClass}>Texto Sobre a Empresa</label>
          <textarea value={aboutText || portfolioDesc} onChange={(e) => setAboutText(e.target.value)}
            placeholder="Descreva a história, missão e diferenciais da empresa..."
            rows={5} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className={labelClass}>Imagem da Seção Sobre</label>
          <ImageUpload bucket="org-logos" folder={`${orgId ?? "temp"}/about`} value={aboutImageUrls}
            onChange={(urls) => setAboutImageUrls(urls.slice(-1))} maxFiles={1} />
        </div>
      </section>

      {/* Landing page link */}
      {name && (
        <section className="bg-[#161616] border border-gold/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold/60 font-sans mb-1">Minisite Publicado</p>
              <p className="text-white/60 font-mono text-sm">
                /construtora/<span className="text-gold">{landingSlug}</span>
              </p>
            </div>
            <a href={`/construtora/${landingSlug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold text-xs font-sans uppercase tracking-wider hover:bg-gold/10 transition-colors rounded-lg">
              <ExternalLink size={12} /> Abrir Site
            </a>
          </div>
        </section>
      )}

      {error && (
        <p className="text-red-400 text-sm font-sans bg-red-900/10 px-4 py-3 rounded-lg">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium">
        {loading
          ? <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
          : saved ? "✓ Salvo com sucesso"
          : <><Save size={14} /> {orgId ? "Salvar Alterações" : "Criar Organização"}</>}
      </button>
    </form>
  )
}
