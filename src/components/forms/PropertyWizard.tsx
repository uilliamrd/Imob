"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  FileText, MapPin, Sliders, Camera, Rocket,
  Check, ChevronLeft, ChevronRight,
  Home, Building2, Briefcase,
  Minus, Plus, Sparkles, AlertTriangle, CheckCircle2,
  Globe, EyeOff, Loader2, X, Users, Lock,
} from "lucide-react"
import { UploadZone } from "@/components/ui/UploadZone"
import { PremiumButton } from "@/components/ui/premium/PremiumButton"
import { getTagInfo, getAllTags } from "@/lib/tag-icons"
import { cn } from "@/lib/utils"
import { transitions } from "@/lib/design-system/motion"
import type { PropertyStatus, PropertyVisibility, Development } from "@/types/database"

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_TAGS = Object.keys(getAllTags())

const STEPS = [
  { label: "Localização",   short: "Local",    icon: MapPin    },
  { label: "Detalhes",      short: "Detalhes", icon: Sliders   },
  { label: "Fotos e mídia", short: "Fotos",    icon: Camera    },
  { label: "Anúncio",       short: "Anúncio",  icon: FileText  },
  { label: "Revisão",       short: "Revisão",  icon: Rocket    },
]

const CATEGORIA_GROUPS = [
  { label: "Apartamento",  icon: Building2,  values: ["Apartamento", "Duplex", "Loft", "Flat / Apart-hotel"] },
  { label: "Casa",         icon: Home,       values: ["Casa Bairro", "Casa em Condomínio"] },
  { label: "Terreno",      icon: MapPin,     values: ["Terreno", "Lote em Condomínio Fechado", "Lote em Rua", "Sítio / Fazenda"] },
  { label: "Comercial",    icon: Briefcase,  values: ["Sala Comercial", "Loja", "Galpão / Depósito"] },
  { label: "Outro",        icon: Home,       values: ["Outro"] },
]

const TIPOS_NEGOCIO = [
  { value: "venda",     label: "Venda" },
  { value: "aluguel",   label: "Aluguel" },
  { value: "temporada", label: "Temporada" },
  { value: "permuta",   label: "Permuta" },
]

const DRAFT_KEY = "pw-draft"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bairro     { id: string; name: string; city: string; state: string }
interface Logradouro { id: string; type: string; name: string; bairro_id: string | null; city: string; cep: string | null }
interface OrgOption  { id: string; name: string; type: string }

interface PropertyWizardProps {
  orgId?: string | null
  role?: string
  isAdmin?: boolean
  construtoras?: OrgOption[]
  developments?: Development[]
  bairros?: Bairro[]
  logradouros?: Logradouro[]
}

// ── Helper components ─────────────────────────────────────────────────────────

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-[var(--forest)] hover:text-white hover:border-[var(--forest)] transition-all"
        >
          <Minus size={13} />
        </button>
        <span className="font-serif text-3xl font-bold text-foreground w-10 text-center leading-none">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-[var(--forest)] hover:text-white hover:border-[var(--forest)] transition-all"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-destructive text-sm font-sans mt-1">{msg}</p>
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PropertyWizard({
  orgId, role = "corretor", isAdmin = false, construtoras = [], developments = [], bairros = [], logradouros = [],
}: PropertyWizardProps) {
  const router = useRouter()
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [step, setStep]         = useState(0)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [autosaveSt, setAutoSt] = useState<"idle" | "saving" | "saved">("idle")
  const [shaking, setShaking]   = useState(false)
  const [cepLoading, setCepL]   = useState(false)
  const [showAddr, setShowAddr] = useState(true)

  // ── Form state (same fields as PropertyForm) ──────────────────────────────────
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(orgId ?? null)
  const [title, setTitle]       = useState("")
  const [description, setDesc]  = useState("")
  const [price, setPrice]       = useState("")
  const [status, setStatus]     = useState<PropertyStatus>("disponivel")
  const [visibility, setVis]    = useState<PropertyVisibility>("publico")
  const [videoUrl, setVideoUrl] = useState("")
  const [images, setImages]     = useState<string[]>([])
  const [selectedTags, setTags] = useState<string[]>([])
  const [tipoNegocio, setTipoNegocio] = useState("venda")
  const [developmentId, setDevId]     = useState("")
  const [bairroId, setBairroId]       = useState("")
  const [logradouroId, setLogId]      = useState("")
  const [neighborhood, setNeighb]     = useState("")
  const [city, setCity]               = useState("")
  const [address, setAddress]         = useState("")
  const [cep, setCep]                 = useState("")
  const [categoria, setCategoria]     = useState("")
  const [catGroup, setCatGroup]       = useState("") // UI visual selector group

  // Feature numeric fields (stored as numbers for steppers)
  const [dormitorios, setDorms] = useState(0)
  const [suites, setSuites]     = useState(0)
  const [banheiros, setBanhs]   = useState(0)
  const [vagas, setVagas]       = useState(0)
  const [areaM2, setAreaM2]     = useState("")
  const [areaTotal, setAreaTot] = useState("")
  const [andar, setAndar]       = useState("")
  const [areaTerreno, setAreaT] = useState("")

  // Remaining fields (kept for submit payload compatibility)
  const [numero, setNumero]     = useState("")
  const [numeroApto, setApto]   = useState("")
  const [torre, setTorre]       = useState("")
  const [quadra, setQuadra]     = useState("")
  const [lote, setLote]         = useState("")
  const [referencia, setRef]    = useState("")
  const [livings, setLivings]   = useState("")
  const [dependencias, setDeps] = useState("")
  const [depositos, setDeps2]   = useState("")
  const [numDepositos, setND]   = useState("")
  const [tipoVaga, setTVaga]    = useState("")
  const [numeroVaga, setNVaga]  = useState("")
  const [situacaoVaga, setSitV] = useState("")
  const [mobiliado, setMob]     = useState("")
  const [agenciador, setAgent]  = useState("")
  const [chaves, setChaves]     = useState("")
  const [nomeProp, setNomeProp] = useState("")
  const [contatoProp, setConProp] = useState("")

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  // ── Restore draft ────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return
    try {
      const d = JSON.parse(saved)
      if (d.title)       setTitle(d.title)
      if (d.description) setDesc(d.description)
      if (d.price)       setPrice(d.price)
      if (d.categoria)   { setCategoria(d.categoria); setCatGroup(d.catGroup ?? "") }
      if (d.tipoNegocio) setTipoNegocio(d.tipoNegocio)
      if (d.neighborhood) setNeighb(d.neighborhood)
      if (d.city)        setCity(d.city)
      if (d.address)     setAddress(d.address)
      if (d.cep)         setCep(d.cep)
      if (d.dormitorios) setDorms(d.dormitorios)
      if (d.suites)      setSuites(d.suites)
      if (d.banheiros)   setBanhs(d.banheiros)
      if (d.vagas)       setVagas(d.vagas)
      if (d.areaM2)      setAreaM2(d.areaM2)
      if (d.images)      setImages(d.images)
      if (d.selectedTags) setTags(d.selectedTags)
    } catch { /* ignore */ }
  }, [])

  // ── Autosave (debounced) ─────────────────────────────────────────────────────
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setAutoSt("saving")
    autosaveTimer.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        title, description, price, categoria, catGroup,
        tipoNegocio, neighborhood, city, address, cep,
        dormitorios, suites, banheiros, vagas, areaM2,
        images, selectedTags,
      }))
      setAutoSt("saved")
    }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, price, categoria, tipoNegocio, neighborhood, city, address, cep, dormitorios, suites, banheiros, vagas, areaM2, images.length, selectedTags.length])

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function generateSlug(t: string) {
    return t.toLowerCase().normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-") + "-" + Date.now().toString(36)
  }

  function triggerShake() {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  const filteredLogradouros = bairroId
    ? logradouros.filter((l) => l.bairro_id === bairroId || !l.bairro_id)
    : logradouros

  // ── CEP auto-fill ─────────────────────────────────────────────────────────────
  async function fetchCep(raw: string) {
    const clean = raw.replace(/\D/g, "")
    if (clean.length !== 8) return
    setCepL(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        if (data.logradouro) setAddress(data.logradouro)
        if (data.bairro)     setNeighb(data.bairro)
        if (data.localidade) setCity(data.localidade)
        // Try to match bairro in DB list
        if (data.bairro && bairros.length > 0) {
          const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
          const match = bairros.find((b) => norm(b.name) === norm(data.bairro))
          if (match) setBairroId(match.id)
        }
      }
    } catch { /* ignore */ }
    finally { setCepL(false) }
  }

  // ── Location handlers (same as PropertyForm) ──────────────────────────────────
  function handleBairroChange(id: string) {
    setBairroId(id)
    setLogId("")
    if (id) {
      const b = bairros.find((b) => b.id === id)
      if (b) { setNeighb(b.name); setCity(b.city) }
    }
  }

  function handleLogradouroChange(id: string) {
    setLogId(id)
    if (id) {
      const l = logradouros.find((l) => l.id === id)
      if (l) {
        setAddress(`${l.type} ${l.name}`)
        if (l.cep) setCep(l.cep)
        if (!bairroId && l.bairro_id) handleBairroChange(l.bairro_id)
      }
    }
  }

  function handleDevChange(devId: string) {
    setDevId(devId)
    if (!devId) return
    const dev = developments.find((d) => d.id === devId)
    if (!dev) return
    if (dev.neighborhood) setNeighb(dev.neighborhood)
    if (dev.city)         setCity(dev.city)
    if (dev.address)      setAddress(dev.address)
    if (dev.neighborhood && bairros.length > 0) {
      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      const matched = bairros.find((b) => norm(b.name) === norm(dev.neighborhood!))
      if (matched) setBairroId(matched.id)
    }
  }

  // ── AI generation ─────────────────────────────────────────────────────────────
  async function handleGenerateContent() {
    setAiLoading(true)
    try {
      const res = await fetch("/api/admin/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria, tipo_negocio: tipoNegocio,
          price: parseFloat(price) || 0,
          neighborhood, city,
          features: {
            suites: suites || undefined, quartos: dormitorios || undefined,
            vagas: vagas || undefined, area_m2: areaM2 ? parseFloat(areaM2) : undefined,
            banheiros: banheiros || undefined, andar: andar ? parseInt(andar) : undefined,
          },
          tags: selectedTags.map((t) => getTagInfo(t).label),
          development_name: developments.find((d) => d.id === developmentId)?.name,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.title)       setTitle(data.title)
        if (data.description) setDesc(data.description)
      }
    } catch { /* ignore */ }
    finally { setAiLoading(false) }
  }

  function toggleTag(tag: string) {
    setTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  function validateStep(): boolean {
    const errs: Record<string, string> = {}
    // Step 0: Localização
    if (step === 0) {
      if (!neighborhood && !bairroId) errs.neighborhood = "Bairro/localização é obrigatório"
      if (!city) errs.city = "Cidade é obrigatória"
    }
    // Step 2: Fotos
    if (step === 2) {
      if (images.length === 0) errs.images = "Adicione pelo menos uma foto"
    }
    // Step 3: Anúncio
    if (step === 3) {
      if (!title.trim()) errs.title = "Título é obrigatório"
      if (!categoria)    errs.categoria = "Selecione o tipo de imóvel"
      if (!price || parseFloat(price) <= 0) errs.price = "Informe o preço"
      if (description.length > 0 && description.length < 20)
        errs.description = "Descrição deve ter pelo menos 20 caracteres"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function goNext() {
    if (!validateStep()) { triggerShake(); return }
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function goPrev() {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true); setError(null)

    const features: Record<string, number | string | undefined> = {}
    if (dormitorios)    features.dormitorios    = dormitorios
    if (suites)         features.suites         = suites
    if (banheiros)      features.banheiros      = banheiros
    if (livings)        features.livings        = parseInt(livings)
    if (dependencias)   features.dependencias   = parseInt(dependencias)
    if (vagas)          features.vagas          = vagas
    if (tipoVaga)       features.tipo_vaga      = tipoVaga
    if (numeroVaga)     features.numero_vaga    = numeroVaga
    if (situacaoVaga)   features.situacao_vaga  = situacaoVaga
    if (areaM2)         features.area_m2        = parseFloat(areaM2)
    if (areaTotal)      features.area_total     = parseFloat(areaTotal)
    if (areaTerreno)    features.area_terreno   = parseFloat(areaTerreno)
    if (andar)          features.andar          = parseInt(andar)
    if (numeroApto)     features.numero_apto    = numeroApto
    if (torre)          features.torre          = torre
    if (quadra)         features.quadra         = quadra
    if (lote)           features.lote           = lote
    if (numero)         features.numero         = numero
    if (referencia)     features.referencia     = referencia
    if (depositos)      features.depositos      = parseInt(depositos)
    if (numDepositos)   features.numero_depositos = numDepositos
    if (agenciador)     features.agenciador     = agenciador
    if (chaves)         features.chaves         = chaves
    if (mobiliado)      features.mobiliado      = mobiliado
    if (nomeProp)       features.nome_proprietario    = nomeProp
    if (contatoProp)    features.contato_proprietario = contatoProp

    const payload = {
      title,
      slug: generateSlug(title),
      description: description || null,
      price: parseFloat(price) || 0,
      status,
      visibility,
      tags: selectedTags,
      images,
      video_url: videoUrl || null,
      development_id: developmentId || null,
      neighborhood: neighborhood || null,
      city: city || null,
      address: showAddr ? (address || null) : null,
      cep: cep || null,
      categoria: categoria || null,
      tipo_negocio: tipoNegocio || "venda",
      bairro_id: bairroId || null,
      logradouro_id: logradouroId || null,
      features,
      org_id: selectedOrgId ?? orgId ?? null,
    }

    const res = await fetch("/api/admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      localStorage.removeItem(DRAFT_KEY)
      router.push("/dashboard/imoveis")
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error ?? "Erro ao salvar imóvel.")
      setLoading(false)
    }
  }

  // ── Quality score ─────────────────────────────────────────────────────────────
  function getScore() {
    let s = 0
    if (title.length > 0)       s += 15
    if (parseFloat(price) > 0)  s += 15
    if (neighborhood || city)   s += 15
    if (images.length >= 5)     s += 25
    else if (images.length >= 3) s += 15
    else if (images.length > 0) s += 5
    if (description.length >= 200) s += 20
    else if (description.length >= 50) s += 10
    if (categoria)              s += 5
    if (selectedTags.length > 0) s += 5
    return Math.min(100, s)
  }

  const score = getScore()
  const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"

  const ic = "w-full bg-muted/50 border border-border text-foreground placeholder-muted-foreground/40 px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-[var(--gold)]/50 transition-colors"

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl">

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-border mx-8 hidden sm:block" />
          <div
            className="absolute left-0 top-5 h-0.5 bg-[var(--gold)] mx-8 hidden sm:block transition-all duration-500"
            style={{ right: `${(1 - step / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done   = i < step
            const active = i === step
            return (
              <button
                key={i}
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn("flex flex-col items-center gap-1.5 relative z-10 group", i < step && "cursor-pointer")}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  done   && "bg-[var(--gold)] border-[var(--gold)] text-[#1C1C1C]",
                  active && "bg-[var(--forest)] border-[var(--forest)] text-white",
                  !done && !active && "bg-muted border-border text-muted-foreground"
                )}>
                  {done ? <Check size={15} /> : <Icon size={15} />}
                </div>
                <span className={cn(
                  "text-[10px] font-sans transition-colors hidden sm:block",
                  active ? "text-foreground font-semibold" : done ? "text-[var(--gold)]" : "text-muted-foreground"
                )}>
                  {s.short}
                </span>
              </button>
            )
          })}
        </div>

        {/* Autosave indicator */}
        <div className="flex items-center justify-end mt-3">
          {autosaveSt === "saving" && (
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
              <Loader2 size={10} className="animate-spin" /> Salvando...
            </span>
          )}
          {autosaveSt === "saved" && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-500/70 font-sans">
              <Check size={10} /> Salvo automaticamente
            </span>
          )}
        </div>
      </div>

      {/* ── Step title ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]/60 font-sans">Passo {step + 1} de {STEPS.length}</p>
        <h2 className="font-serif text-2xl font-bold text-foreground mt-0.5">{STEPS[step].label}</h2>
      </div>

      {/* ── Step content ───────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={transitions.smooth}
        >

          {/* ══ STEP 0 — LOCALIZAÇÃO ════════════════════════════════ */}
          {step === 0 && (
            <div className="space-y-5">

              {/* Bairro */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">
                  Bairro <span className="text-destructive">*</span>
                </label>
                {bairros.length > 0 ? (
                  <select value={bairroId} onChange={(e) => handleBairroChange(e.target.value)} className={cn(ic, errors.neighborhood && "border-destructive")}>
                    <option value="">— Selecione —</option>
                    {bairros.map((b) => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ""}</option>)}
                  </select>
                ) : (
                  <input type="text" value={neighborhood} onChange={(e) => setNeighb(e.target.value)} placeholder="Copacabana" className={cn(ic, errors.neighborhood && "border-destructive")} />
                )}
                <FieldError msg={errors.neighborhood} />
              </div>

              {/* Logradouro */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">Logradouro / Rua</label>
                {logradouros.length > 0 ? (
                  <select value={logradouroId} onChange={(e) => handleLogradouroChange(e.target.value)} className={ic}>
                    <option value="">— Selecione —</option>
                    {filteredLogradouros.map((l) => <option key={l.id} value={l.id}>{l.type} {l.name}</option>)}
                  </select>
                ) : (
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Atlântica" className={ic} />
                )}
              </div>

              {/* Número + Complemento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">Número</label>
                  <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="1200" className={ic} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">Apto / Comp.</label>
                  <input type="text" value={numeroApto} onChange={(e) => setApto(e.target.value)} placeholder="1201" className={ic} />
                </div>
              </div>

              {/* Cidade */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">
                  Cidade <span className="text-destructive">*</span>
                </label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Rio de Janeiro" className={cn(ic, errors.city && "border-destructive")} />
                <FieldError msg={errors.city} />
              </div>

              {/* Toggle endereço */}
              <button
                type="button"
                onClick={() => setShowAddr((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-colors",
                  showAddr ? "border-emerald-700/40 bg-emerald-900/10" : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  {showAddr
                    ? <Globe size={15} className="text-emerald-400" />
                    : <EyeOff size={15} className="text-muted-foreground" />}
                  <div className="text-left">
                    <p className={cn("text-sm font-sans font-medium", showAddr ? "text-emerald-300" : "text-muted-foreground")}>
                      {showAddr ? "Endereço completo visível no anúncio" : "Mostrar apenas bairro e cidade"}
                    </p>
                    <p className="text-xs font-sans text-muted-foreground/50 mt-0.5">
                      {showAddr ? "Comprador verá o endereço exato" : "Endereço completo ficará oculto"}
                    </p>
                  </div>
                </div>
                <div className={cn("w-11 h-6 rounded-full transition-colors relative flex-shrink-0", showAddr ? "bg-emerald-600" : "bg-muted")}>
                  <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", showAddr ? "left-6" : "left-1")} />
                </div>
              </button>
            </div>
          )}

          {/* ══ STEP 1 — DETALHES E DIFERENCIAIS ════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">

              {/* Steppers */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Cômodos</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stepper label="Quartos"  value={dormitorios} onChange={setDorms} />
                  <Stepper label="Suítes"   value={suites}      onChange={setSuites} />
                  <Stepper label="Banheiros" value={banheiros}  onChange={setBanhs} />
                  <Stepper label="Vagas"    value={vagas}       onChange={setVagas} />
                </div>
              </div>

              {/* Áreas */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Áreas</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5">Área privativa (m²)</label>
                    <input type="number" min="0" step="0.1" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} placeholder="128" className={ic} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5">Área total (m²)</label>
                    <input type="number" min="0" step="0.1" value={areaTotal} onChange={(e) => setAreaTot(e.target.value)} placeholder="160" className={ic} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5">Andar</label>
                    <input type="number" min="0" value={andar} onChange={(e) => setAndar(e.target.value)} placeholder="12" className={ic} />
                  </div>
                </div>
              </div>

              {/* Diferenciais */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Diferenciais</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_TAGS.map((tag) => {
                    const info = getTagInfo(tag)
                    const Icon = info.icon
                    const active = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-sans transition-all text-left",
                          active
                            ? "bg-[var(--forest)]/10 border-[var(--forest)] text-[var(--forest)]"
                            : "bg-card border-border text-muted-foreground hover:border-[var(--gold)]/40 hover:text-foreground"
                        )}
                      >
                        <Icon size={13} className="flex-shrink-0" />
                        <span className="truncate">{info.label}</span>
                        {active && <X size={10} className="ml-auto flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — FOTOS E MÍDIA ══════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5">

              {/* Alert: few photos */}
              {images.length > 0 && images.length < 3 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-sans">Imóveis com mais fotos recebem 3x mais contatos. Adicione pelo menos 5 fotos.</p>
                </div>
              )}

              {/* Error: no photos */}
              {errors.images && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertTriangle size={14} />
                  <p className="text-sm font-sans">{errors.images}</p>
                </div>
              )}

              <UploadZone
                bucket="property-images"
                folder={orgId ? `${orgId}/properties` : "temp"}
                value={images}
                onChange={setImages}
                maxFiles={40}
                acceptMime="image/*"
                maxSizeMB={30}
              />

              {/* Video */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">URL do tour virtual / vídeo (opcional)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className={ic}
                />
                <p className="text-[10px] text-muted-foreground/40 font-sans mt-1">YouTube, Vimeo ou Matterport</p>
              </div>
            </div>
          )}

          {/* ══ STEP 3 — ANÚNCIO ════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Admin org transfer */}
              {isAdmin && construtoras.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Organização (Admin)</p>
                  <select
                    value={selectedOrgId ?? ""}
                    onChange={(e) => setSelectedOrgId(e.target.value || null)}
                    className={ic}
                  >
                    <option value="">— Sem organização —</option>
                    {construtoras.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              )}

              {/* Tipo de imóvel */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">
                  Tipo de imóvel <span className="text-destructive">*</span>
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CATEGORIA_GROUPS.map((g) => {
                    const Icon = g.icon
                    const active = catGroup === g.label
                    return (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => {
                          setCatGroup(g.label)
                          setCategoria(g.values[0])
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-sans transition-all",
                          active
                            ? "bg-[var(--forest)] border-[var(--forest)] text-white"
                            : "bg-card border-border text-muted-foreground hover:border-[var(--gold)]/40 hover:text-foreground"
                        )}
                      >
                        <Icon size={18} strokeWidth={1.5} />
                        <span className="leading-tight text-center">{g.label}</span>
                      </button>
                    )
                  })}
                </div>
                {catGroup && CATEGORIA_GROUPS.find((g) => g.label === catGroup)!.values.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATEGORIA_GROUPS.find((g) => g.label === catGroup)!.values.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCategoria(v)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs font-sans transition-all",
                          categoria === v
                            ? "bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold)]"
                            : "border-border text-muted-foreground hover:border-[var(--gold)]/40"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
                <FieldError msg={errors.categoria} />
              </div>

              {/* Operação */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Operação</p>
                <div className="flex gap-2 flex-wrap">
                  {TIPOS_NEGOCIO.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTipoNegocio(t.value)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl border font-sans text-sm font-medium transition-all",
                        tipoNegocio === t.value
                          ? "bg-[var(--forest)] border-[var(--forest)] text-white"
                          : "border-border text-muted-foreground hover:border-[var(--gold)]/40 hover:text-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Empreendimento */}
              {developments.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">
                    Empreendimento (opcional)
                  </label>
                  <select value={developmentId} onChange={(e) => handleDevChange(e.target.value)} className={ic}>
                    <option value="">— Imóvel avulso —</option>
                    {developments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}{d.city ? ` · ${d.city}` : ""}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Título */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">
                    Título do anúncio <span className="text-destructive">*</span>
                  </label>
                  <span className={cn("text-[10px] font-sans", title.length > 90 ? "text-amber-500" : "text-muted-foreground/40")}>
                    {title.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Apartamento espaçoso com vista para o mar"
                  className={cn(ic, errors.title && "border-destructive")}
                />
                <FieldError msg={errors.title} />
              </div>

              {/* Preço */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5">
                  Preço <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-sans text-sm pointer-events-none">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className={cn(ic, "pl-10", errors.price && "border-destructive")}
                  />
                </div>
                <FieldError msg={errors.price} />
              </div>

              {/* Descrição + AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">
                    Descrição
                  </label>
                  <span className={cn("text-[10px] font-sans", description.length > 1800 ? "text-amber-500" : "text-muted-foreground/40")}>
                    {description.length}/2000
                  </span>
                </div>
                <textarea
                  value={description}
                  maxLength={2000}
                  rows={5}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Descreva o imóvel com detalhes que encantem o comprador..."
                  className={cn(ic, "resize-none", errors.description && "border-destructive")}
                />
                <FieldError msg={errors.description} />
                <button
                  type="button"
                  onClick={handleGenerateContent}
                  disabled={aiLoading || (!categoria && !neighborhood)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Sugerir com IA (baseado nas características)
                </button>
              </div>

              {/* Visibilidade */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Visibilidade</p>
                {role === "corretor" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "publico",  icon: Globe,   label: "Público",  desc: "Todos os usuários" },
                      { value: "equipe",   icon: Users,   label: "Equipe",   desc: "Só da minha imobiliária" },
                      { value: "privado",  icon: Lock,    label: "Privado",  desc: "Só eu + link direto" },
                    ].map(({ value, icon: Icon, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVis(value as PropertyVisibility)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all",
                          visibility === value
                            ? "bg-[var(--forest)]/10 border-[var(--forest)] text-[var(--forest)]"
                            : "bg-card border-border text-muted-foreground hover:border-[var(--gold)]/40"
                        )}
                      >
                        <Icon size={16} className="mb-0.5" />
                        <span className="text-sm font-sans font-medium">{label}</span>
                        <span className="text-[10px] font-sans opacity-70">{desc}</span>
                      </button>
                    ))}
                  </div>
                ) : orgId ? (
                  <button
                    type="button"
                    onClick={() => setVis(visibility === "publico" ? "privado" : "publico")}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-colors",
                      visibility === "publico" ? "border-emerald-700/40 bg-emerald-900/10" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {visibility === "publico"
                        ? <Globe size={14} className="text-emerald-400" />
                        : <EyeOff size={14} className="text-muted-foreground" />}
                      <p className={cn("text-sm font-sans", visibility === "publico" ? "text-emerald-300" : "text-muted-foreground")}>
                        {visibility === "publico" ? "Publicar no catálogo" : "Manter privado"}
                      </p>
                    </div>
                    <div className={cn("w-10 h-5 rounded-full transition-colors relative flex-shrink-0", visibility === "publico" ? "bg-emerald-600" : "bg-muted")}>
                      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", visibility === "publico" ? "left-5" : "left-0.5")} />
                    </div>
                  </button>
                ) : (
                  <select value={visibility} onChange={(e) => setVis(e.target.value as PropertyVisibility)} className={ic}>
                    <option value="publico">Público — aparece na busca</option>
                    <option value="corretores">Corretores — apenas profissionais</option>
                    <option value="equipe">Minha equipe</option>
                    <option value="privado">Privado — só eu</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 4 — REVISÃO E PUBLICAÇÃO ═══════════════════════ */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">

                {/* Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] font-sans">Preview</span>
                    <p className="text-xs text-muted-foreground font-sans">Como vai aparecer</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {images[0]
                        ? <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                            <Camera size={32} strokeWidth={1} />
                          </div>
                      }
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--forest)] text-white font-sans uppercase tracking-wider">
                          {tipoNegocio}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-base font-semibold text-foreground line-clamp-2 mb-1">
                        {title || "Título do imóvel"}
                      </p>
                      {(neighborhood || city) && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin size={11} /> {[neighborhood, city].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <p className="font-serif text-lg font-bold text-foreground">
                        {price ? `R$ ${parseFloat(price).toLocaleString("pt-BR")}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist + score */}
                <div className="space-y-4">

                  {/* Quality score */}
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-sans font-medium text-foreground">Qualidade do anúncio</p>
                      <span className={cn("text-sm font-serif font-bold", score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-400")}>
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", scoreColor)}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 font-sans mt-2">
                      {score < 50 ? "Adicione mais detalhes para atrair mais contatos" :
                       score < 80 ? "Bom! Adicione fotos e descrição para melhorar" :
                       "Excelente! Seu anúncio está bem otimizado"}
                    </p>
                  </div>

                  {/* Checklist */}
                  <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans mb-3">Checklist</p>
                    {[
                      { ok: title.length > 0,             label: "Título preenchido" },
                      { ok: parseFloat(price) > 0,        label: "Preço informado" },
                      { ok: !!(neighborhood || city),      label: "Localização definida" },
                      { ok: images.length >= 5,           label: "5+ fotos adicionadas", warn: images.length > 0 && images.length < 5 },
                      { ok: description.length >= 100,    label: "Descrição completa", warn: description.length > 0 && description.length < 100 },
                      { ok: !!videoUrl,                   label: "Tour virtual (opcional)", optional: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {item.ok
                          ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                          : item.warn
                          ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                          : <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex-shrink-0", item.optional ? "border-muted-foreground/20" : "border-destructive/40")} />
                        }
                        <span className={cn(
                          "text-xs font-sans",
                          item.ok ? "text-foreground/70" : item.optional ? "text-muted-foreground/40" : "text-foreground/60"
                        )}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
                  {error}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pb-8">
        {/* Voltar */}
        {step > 0 ? (
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 transition-all font-sans text-sm"
          >
            <ChevronLeft size={15} /> Voltar
          </button>
        ) : <div />}

        {/* Continuar / Publicar */}
        {step < STEPS.length - 1 ? (
          <motion.button
            type="button"
            onClick={goNext}
            animate={shaking ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--forest)] text-white hover:opacity-90 transition-all font-sans text-sm font-medium"
          >
            Continuar <ChevronRight size={15} />
          </motion.button>
        ) : (
          <PremiumButton
            variant="gold"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            icon={Rocket}
          >
            Publicar anúncio
          </PremiumButton>
        )}
      </div>
    </div>
  )
}
