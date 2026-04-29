"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadZone } from "@/components/ui/UploadZone"
import { Save, ExternalLink, Globe, FileText, Image, Flame, CreditCard, Star } from "lucide-react"
import type { OrgPlan, OrgType, SubscriptionStatus } from "@/types/database"
import { getPlanName } from "@/lib/plans"

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
    brand_color?: string
    plan?: OrgPlan
    subscription_status?: SubscriptionStatus
    subscription_expires_at?: string | null
    payment_due_date?: string | null
    highlight_quota?: number | null
    super_highlight_quota?: number | null
    is_section_highlighted?: boolean
  }
  isAdmin?: boolean
}

export function OrgForm({ userId: _userId, orgId, initialData, isAdmin = false }: OrgFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData.name)
  const [type, setType] = useState<OrgType>(initialData.type as OrgType || "construtora")
  const [portfolioDesc] = useState(initialData.portfolio_desc)
  const [aboutText, setAboutText] = useState(initialData.about_text ?? "")
  const [heroTagline, setHeroTagline] = useState(initialData.hero_tagline ?? "")
  const [website, setWebsite] = useState(initialData.website)
  const [hasLancamentos, setHasLancamentos] = useState(initialData.has_lancamentos ?? false)
  const [brandColor, setBrandColor] = useState(initialData.brand_color ?? "#C4A052")
  const [plan, setPlan] = useState<OrgPlan>(initialData.plan ?? "free")
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(initialData.subscription_status ?? "trial")
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(initialData.subscription_expires_at ? initialData.subscription_expires_at.slice(0, 10) : "")
  const [paymentDueDate, setPaymentDueDate] = useState(initialData.payment_due_date ? initialData.payment_due_date.slice(0, 10) : "")
  const [highlightQuota, setHighlightQuota] = useState<string>(initialData.highlight_quota != null ? String(initialData.highlight_quota) : "")
  const [superHighlightQuota, setSuperHighlightQuota] = useState<string>(initialData.super_highlight_quota != null ? String(initialData.super_highlight_quota) : "")
  const [isSectionHighlighted, setIsSectionHighlighted] = useState(initialData.is_section_highlighted ?? false)

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
      brand_colors: { primary: brandColor },
    }

    if (isAdmin) {
      payload.has_lancamentos = hasLancamentos
      payload.plan = plan
      payload.subscription_status = subscriptionStatus
      payload.subscription_expires_at = subscriptionExpiresAt ? new Date(subscriptionExpiresAt).toISOString() : null
      payload.payment_due_date = paymentDueDate ? new Date(paymentDueDate).toISOString() : null
      payload.highlight_quota = highlightQuota !== "" ? parseInt(highlightQuota) : null
      payload.super_highlight_quota = superHighlightQuota !== "" ? parseInt(superHighlightQuota) : null
      payload.is_section_highlighted = isSectionHighlighted
    }

    if (orgId) {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erro ao salvar.")
        setLoading(false)
        return
      }
    } else {
      const res = await fetch(`/api/organizations/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erro ao criar organização.")
        setLoading(false)
        return
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full bg-muted/50 border border-border text-white placeholder-muted-foreground/40 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-2"
  const landingSlug = slugify(name)
  const minisitePath = type === "imobiliaria" ? `/imobiliaria/${landingSlug}` : `/construtora/${landingSlug}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Logo */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Image size={15} className="text-gold" />
          <h2 className="font-serif text-lg font-semibold text-white">Logo</h2>
        </div>
        <UploadZone bucket="uploads-temp" folder={`${orgId ?? "temp"}/logo`}
          ownerType="organization" ownerId={orgId} tenantId={orgId}
          value={logoUrls} onChange={(urls) => setLogoUrls(urls.slice(-1))}
          maxFiles={1} acceptMime="image/*" variant="card" />
      </section>

      {/* Basic info */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-4">
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
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <Flame size={16} className={hasLancamentos ? "text-gold" : "text-muted-foreground/50"} />
              <div>
                <p className="text-foreground/80 text-sm font-sans font-medium">Plano com Lançamentos</p>
                <p className="text-muted-foreground text-xs font-sans">Ativa a seção de Lançamentos no minisite</p>
              </div>
            </div>
            <button type="button" onClick={() => setHasLancamentos(!hasLancamentos)}
              className={`w-12 h-6 rounded-full transition-colors relative ${hasLancamentos ? "bg-gold" : "bg-muted"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hasLancamentos ? "left-7" : "left-1"}`} />
            </button>
          </div>
        )}
      </section>

      {/* Admin-only: Plan & Subscription */}
      {isAdmin && (
        <section className="bg-card border border-gold/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <CreditCard size={15} className="text-gold" />
            <h2 className="font-serif text-lg font-semibold text-white">Plano & Assinatura</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Plano</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value as OrgPlan)} className={inputClass}>
                {(["free", "starter", "pro", "enterprise"] as OrgPlan[]).map((p) => (
                  <option key={p} value={p}>
                    {getPlanName(type as OrgType, p)} ({p})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status da Assinatura</label>
              <select value={subscriptionStatus} onChange={(e) => setSubscriptionStatus(e.target.value as SubscriptionStatus)} className={inputClass}>
                <option value="trial">Trial</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Vencimento da Assinatura</label>
              <input type="date" value={subscriptionExpiresAt} onChange={(e) => setSubscriptionExpiresAt(e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Próximo Pagamento Due</label>
              <input type="date" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)}
                className={inputClass} />
              <p className="text-muted-foreground/50 text-xs font-sans mt-1">Acesso suspenso 3 dias após esta data</p>
            </div>
          </div>
        </section>
      )}

      {/* Admin-only: Destaques */}
      {isAdmin && (
        <section className="bg-card border border-amber-900/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Star size={15} className="text-amber-400" />
            <h2 className="font-serif text-lg font-semibold text-white">Destaques</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Quota de Destaques (override)</label>
              <input type="number" min="0" value={highlightQuota}
                onChange={(e) => setHighlightQuota(e.target.value)}
                placeholder="Deixe vazio para usar o plano"
                className={inputClass} />
              <p className="text-muted-foreground/40 text-xs mt-1">Sobrescreve o limite do plano</p>
            </div>
            <div>
              <label className={labelClass}>Quota de Super Destaques (override)</label>
              <input type="number" min="0" value={superHighlightQuota}
                onChange={(e) => setSuperHighlightQuota(e.target.value)}
                placeholder="Deixe vazio para usar o plano"
                className={inputClass} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <Star size={16} className={isSectionHighlighted ? "text-amber-400" : "text-muted-foreground/50"} />
              <div>
                <p className="text-foreground/80 text-sm font-sans font-medium">Destaque na Seção do Portal</p>
                <p className="text-muted-foreground text-xs font-sans">Aparece primeiro na lista de construtoras/imobiliárias</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsSectionHighlighted(!isSectionHighlighted)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isSectionHighlighted ? "bg-amber-500" : "bg-muted"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isSectionHighlighted ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </section>
      )}

      {/* Hero section */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-4">
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
          <UploadZone bucket="uploads-temp" folder={`${orgId ?? "temp"}/hero`}
            ownerType="organization" ownerId={orgId} tenantId={orgId}
            value={heroImageUrls} onChange={(urls) => setHeroImageUrls(urls.slice(-1))}
            maxFiles={1} acceptMime="image/*" variant="detail" />
        </div>
      </section>

      {/* About section */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-4">
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
          <UploadZone bucket="uploads-temp" folder={`${orgId ?? "temp"}/about`}
            ownerType="organization" ownerId={orgId} tenantId={orgId}
            value={aboutImageUrls} onChange={(urls) => setAboutImageUrls(urls.slice(-1))}
            maxFiles={1} acceptMime="image/*" variant="detail" />
        </div>
      </section>

      {/* Brand color */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: brandColor }} />
          <h2 className="font-serif text-lg font-semibold text-white">Cor do Minisite</h2>
        </div>
        <div className="flex items-center gap-4">
          <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-border p-1" />
          <div>
            <p className="text-foreground/60 text-sm font-sans">Cor de destaque do minisite</p>
            <p className="text-muted-foreground/50 text-xs font-sans font-mono mt-0.5">{brandColor}</p>
          </div>
          <div className="flex gap-2 ml-auto flex-wrap">
            {["#C4A052","#E8C96B","#B8860B","#1E3A5F","#2D6A4F","#9B2226","#6B21A8"].map((c) => (
              <button key={c} type="button" onClick={() => setBrandColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: brandColor === c ? "#fff" : "transparent" }} />
            ))}
          </div>
        </div>
      </section>

      {/* Landing page link */}
      {name && (
        <section className="bg-card border border-gold/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold/60 font-sans mb-1">Minisite Publicado</p>
              <p className="text-foreground/60 font-mono text-sm">
                <span className="text-muted-foreground">{minisitePath.replace(landingSlug, "")}</span>
                <span className="text-gold">{landingSlug}</span>
              </p>
            </div>
            <a href={minisitePath} target="_blank" rel="noopener noreferrer"
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
