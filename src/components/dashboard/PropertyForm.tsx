"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getTagInfo, getAllTags } from "@/lib/tag-icons"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { Save, Plus, X, Hash, Globe, EyeOff } from "lucide-react"
import type { PropertyStatus, PropertyVisibility, Development } from "@/types/database"

const ALL_TAGS = Object.keys(getAllTags())

const CATEGORIAS = [
  "Apartamento", "Casa", "Casa em Condomínio", "Cobertura", "Duplex",
  "Flat / Apart-hotel", "Kitnet / Studio", "Loft", "Terreno",
  "Sala Comercial", "Loja", "Galpão / Depósito", "Sítio / Fazenda", "Outro",
]

const TIPOS_VAGA = ["Coberta", "Descoberta", "Box Fechado", "Garagem", "Pilotis", "Não informado"]
const SITUACOES_VAGA = ["Individual", "Do Condomínio", "Locada", "Não informado"]
const NUMS = Array.from({ length: 11 }, (_, i) => i) // 0–10

interface Bairro     { id: string; name: string; city: string; state: string }
interface Logradouro { id: string; type: string; name: string; bairro_id: string | null; city: string; cep: string | null }

interface InitialData {
  title?: string; slug?: string; description?: string; price?: number
  status?: PropertyStatus; visibility?: PropertyVisibility
  tags?: string[]; images?: string[]; video_url?: string | null
  development_id?: string | null; code?: number
  neighborhood?: string | null; city?: string | null; address?: string | null
  cep?: string | null; categoria?: string | null; tipo_negocio?: string
  bairro_id?: string | null; logradouro_id?: string | null
  org_id?: string | null
  features?: {
    suites?: number; quartos?: number; dormitorios?: number; dependencias?: number
    livings?: number; vagas?: number; numero_vaga?: string; tipo_vaga?: string
    situacao_vaga?: string; area_m2?: number; area_total?: number; area_terreno?: number
    banheiros?: number; andar?: number; numero_apto?: string; torre?: string
    quadra?: string; lote?: string; numero?: string; referencia?: string
    depositos?: number; numero_depositos?: string; agenciador?: string
    chaves?: string; mobiliado?: string; nome_proprietario?: string; contato_proprietario?: string
    [key: string]: number | string | undefined
  }
}

interface OrgOption { id: string; name: string; type: string }

interface PropertyFormProps {
  initialData?: InitialData
  propertyId?: string
  orgId?: string | null
  isAdmin?: boolean
  construtoras?: OrgOption[]
  developments?: Development[]
  bairros?: Bairro[]
  logradouros?: Logradouro[]
}

const TABS = ["Dados Principais", "Identificação", "Fotos", "Diferenciais"]

function numStr(v?: number) { return v != null ? String(v) : "" }

export function PropertyForm({ initialData, propertyId, orgId, isAdmin = false, construtoras = [], developments = [], bairros = [], logradouros = [] }: PropertyFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Admin org transfer — track selected org for PATCH
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(initialData?.org_id ?? orgId ?? null)

  // ── Identificação
  const [title, setTitle]       = useState(initialData?.title ?? "")
  const [slug, setSlug]         = useState(initialData?.slug ?? "")
  const [description, setDesc]  = useState(initialData?.description ?? "")
  const [price, setPrice]       = useState(initialData?.price?.toString() ?? "")
  const [status, setStatus]     = useState<PropertyStatus>(initialData?.status ?? "disponivel")
  const [visibility, setVis]    = useState<PropertyVisibility>(initialData?.visibility ?? "publico")
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url ?? "")
  const [images, setImages]     = useState<string[]>(initialData?.images ?? [])
  const [selectedTags, setTags] = useState<string[]>(initialData?.tags ?? [])

  // ── Tipo de negócio (multi-check)
  const [tipoNegocio, setTipoNegocio] = useState(initialData?.tipo_negocio ?? "venda")

  // ── Vínculo
  const [developmentId, setDevId] = useState(initialData?.development_id ?? "")

  // ── Localização com Locais
  const [bairroId, setBairroId]         = useState(initialData?.bairro_id ?? "")
  const [logradouroId, setLogradouroId] = useState(initialData?.logradouro_id ?? "")
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood ?? "")
  const [city, setCity]                 = useState(initialData?.city ?? "")
  const [address, setAddress]           = useState(initialData?.address ?? "")
  const [cep, setCep]                   = useState(initialData?.cep ?? "")
  const [categoria, setCategoria]       = useState(initialData?.categoria ?? "")

  // ── Unidade
  const [numeroApto, setNumeroApto] = useState(initialData?.features?.numero_apto ?? "")
  const [torre, setTorre]           = useState(initialData?.features?.torre ?? "")
  const [andar, setAndar]           = useState(numStr(initialData?.features?.andar))
  const [quadra, setQuadra]         = useState(initialData?.features?.quadra ?? "")
  const [lote, setLote]             = useState(initialData?.features?.lote ?? "")
  const [numero, setNumero]         = useState(initialData?.features?.numero ?? "")
  const [referencia, setRef]        = useState(initialData?.features?.referencia ?? "")

  // ── Cômodos
  const [dormitorios, setDormitorios] = useState(numStr(initialData?.features?.dormitorios))
  const [suites, setSuites]           = useState(numStr(initialData?.features?.suites))
  const [banheiros, setBanheiros]     = useState(numStr(initialData?.features?.banheiros))
  const [livings, setLivings]         = useState(numStr(initialData?.features?.livings))
  const [dependencias, setDeps]       = useState(numStr(initialData?.features?.dependencias))

  // ── Vagas
  const [vagas, setVagas]             = useState(numStr(initialData?.features?.vagas))
  const [tipoVaga, setTipoVaga]       = useState(initialData?.features?.tipo_vaga ?? "")
  const [numeroVaga, setNumeroVaga]   = useState(initialData?.features?.numero_vaga ?? "")
  const [situacaoVaga, setSitVaga]    = useState(initialData?.features?.situacao_vaga ?? "")

  // ── Áreas
  const [areaM2, setAreaM2]           = useState(numStr(initialData?.features?.area_m2))
  const [areaTotal, setAreaTotal]     = useState(numStr(initialData?.features?.area_total))
  const [areaTerreno, setAreaTer]     = useState(numStr(initialData?.features?.area_terreno))

  // ── Depósitos
  const [depositos, setDepositos]         = useState(numStr(initialData?.features?.depositos))
  const [numDepositos, setNumDepositos]   = useState(initialData?.features?.numero_depositos ?? "")

  // ── Admin
  const [agenciador, setAgenciador]           = useState(initialData?.features?.agenciador ?? "")
  const [chaves, setChaves]                   = useState(initialData?.features?.chaves ?? "")
  const [mobiliado, setMobiliado]             = useState(initialData?.features?.mobiliado ?? "")
  const [nomeProprietario, setNomeProp]       = useState(initialData?.features?.nome_proprietario ?? "")
  const [contatoProprietario, setContatoProp] = useState(initialData?.features?.contato_proprietario ?? "")

  const ic = "w-full bg-muted/50 border border-border text-white placeholder-muted-foreground/40 px-3 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const lc = "text-xs uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5"

  const filteredLogradouros = bairroId
    ? logradouros.filter((l) => l.bairro_id === bairroId || !l.bairro_id)
    : logradouros

  function generateSlug(t: string) {
    return t.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-") + "-" + Date.now().toString(36)
  }

  function handleBairroChange(id: string) {
    setBairroId(id)
    setLogradouroId("")
    if (id) {
      const b = bairros.find((b) => b.id === id)
      if (b) { setNeighborhood(b.name); setCity(b.city) }
    }
  }

  function handleLogradouroChange(id: string) {
    setLogradouroId(id)
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

    // Fill free-text fields
    if (dev.neighborhood) setNeighborhood(dev.neighborhood)
    if (dev.city)         setCity(dev.city)
    if (dev.address)      setAddress(dev.address)

    // Try to match bairro by neighborhood name (case-insensitive)
    if (dev.neighborhood && bairros.length > 0) {
      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      const devNorm = norm(dev.neighborhood)
      const matched = bairros.find((b) => {
        if (norm(b.name) === devNorm) return true
        // also try city match as tiebreaker when multiple bairros have similar names
        if (dev.city && norm(b.name) === devNorm && norm(b.city) === norm(dev.city)) return true
        return false
      })
      if (matched) {
        setBairroId(matched.id)
        setCity(matched.city)

        // Try to match logradouro within that bairro by address text
        if (dev.address && logradouros.length > 0) {
          const addrNorm = norm(dev.address)
          const matchedLog = logradouros.find((l) => {
            if (l.bairro_id && l.bairro_id !== matched.id) return false
            const logFull = norm(`${l.type} ${l.name}`)
            return addrNorm.includes(norm(l.name)) || logFull === addrNorm
          })
          if (matchedLog) {
            setLogradouroId(matchedLog.id)
            if (matchedLog.cep) setCep(matchedLog.cep)
          }
        }
      }
    }
  }

  function toggleTag(tag: string) {
    setTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)

    const features: Record<string, number | string | undefined> = {}
    if (dormitorios)    features.dormitorios    = parseInt(dormitorios)
    if (suites)         features.suites         = parseInt(suites)
    if (banheiros)      features.banheiros      = parseInt(banheiros)
    if (livings)        features.livings        = parseInt(livings)
    if (dependencias)   features.dependencias   = parseInt(dependencias)
    if (vagas)          features.vagas          = parseInt(vagas)
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
    if (nomeProprietario)   features.nome_proprietario    = nomeProprietario
    if (contatoProprietario) features.contato_proprietario = contatoProprietario

    const payload = {
      title,
      slug: slug || generateSlug(title),
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
      address: address || null,
      cep: cep || null,
      categoria: categoria || null,
      tipo_negocio: tipoNegocio || "venda",
      bairro_id: bairroId || null,
      logradouro_id: logradouroId || null,
      features,
    }

    const url = propertyId ? `/api/admin/properties/${propertyId}` : "/api/admin/properties"
    const method = propertyId ? "PATCH" : "POST"
    if (!propertyId) {
      Object.assign(payload, { org_id: selectedOrgId ?? orgId ?? null })
    } else if (isAdmin && selectedOrgId !== undefined) {
      // Admin can transfer ownership via PATCH
      Object.assign(payload, { org_id: selectedOrgId })
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push("/dashboard/imoveis")
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error ?? "Erro ao salvar imóvel.")
      setLoading(false)
    }
  }

  // ── Select helper 0-10
  function NumSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
      <div>
        <label className={lc}>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={ic}>
          <option value="">—</option>
          {NUMS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Tab bar ───────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t, i) => (
          <button key={t} type="button" onClick={() => setActiveTab(i)}
            className={`px-5 py-3 text-xs uppercase tracking-[0.15em] font-sans border-b-2 transition-colors ${
              activeTab === i ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground/60"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Código ─────────────────────────── */}
      {initialData?.code && (
        <div className="flex items-center gap-2 px-4 py-3 mb-5 bg-gold/5 border border-gold/20 rounded-xl">
          <Hash size={14} className="text-gold" />
          <span className="text-gold font-sans text-sm">Código: <strong>{initialData.code}</strong></span>
        </div>
      )}

      {/* ══ TAB 0: DADOS PRINCIPAIS ════════════════════════════════ */}
      {activeTab === 0 && (
        <div className="space-y-5">

          {/* Tipo de negócio */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className={lc + " mb-3"}>Tipo de Negócio</p>
            <div className="flex flex-wrap gap-3">
              {[["venda","Venda"], ["aluguel","Aluguel Mês"], ["temporada","Temporada"], ["permuta","Permuta"]].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipo_negocio" value={v}
                    checked={tipoNegocio === v} onChange={() => setTipoNegocio(v)}
                    className="accent-amber-500" />
                  <span className="text-sm font-sans text-foreground/60">{l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vínculo + Categoria */}
          <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Condomínio / Empreendimento</label>
              <select value={developmentId} onChange={(e) => handleDevChange(e.target.value)} className={ic}>
                <option value="">— Imóvel avulso —</option>
                {developments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}{d.city ? ` · ${d.city}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lc}>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={ic}>
                <option value="">— Selecione —</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Admin: ownership transfer */}
          {isAdmin && construtoras.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-sans mb-3 pb-3 border-b border-border">
                Vinculação à Construtora
              </p>
              <div>
                <label className={lc}>Organização / Construtora</label>
                <select
                  value={selectedOrgId ?? ""}
                  onChange={(e) => {
                    const val = e.target.value || null
                    setSelectedOrgId(val)
                    // Auto-publish when linked to a construtora
                    const isConstrutora = construtoras.find((c) => c.id === val)?.type === "construtora"
                    if (isConstrutora) setVis("publico")
                  }}
                  className={ic}
                >
                  <option value="">— Sem organização —</option>
                  {construtoras.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                {selectedOrgId && construtoras.find((c) => c.id === selectedOrgId)?.type === "construtora" && (
                  <p className="text-xs font-sans text-emerald-400/70 mt-1.5">
                    Imóvel vinculado à construtora — visibilidade será definida como Público.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Localização via Locais */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans border-b border-border pb-3">Localização</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lc}>Bairro {bairros.length > 0 && <span className="text-gold/50">(de Locais)</span>}</label>
                {bairros.length > 0 ? (
                  <select value={bairroId} onChange={(e) => handleBairroChange(e.target.value)} className={ic}>
                    <option value="">— Selecione —</option>
                    {bairros.map((b) => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ""}</option>)}
                  </select>
                ) : (
                  <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Copacabana" className={ic} />
                )}
              </div>
              <div>
                <label className={lc}>Logradouro / Rua {logradouros.length > 0 && <span className="text-gold/50">(de Locais)</span>}</label>
                {logradouros.length > 0 ? (
                  <select value={logradouroId} onChange={(e) => handleLogradouroChange(e.target.value)} className={ic}>
                    <option value="">— Selecione —</option>
                    {filteredLogradouros.map((l) => <option key={l.id} value={l.id}>{l.type} {l.name}</option>)}
                  </select>
                ) : (
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Atlântica" className={ic} />
                )}
              </div>
              <div>
                <label className={lc}>Cidade</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Rio de Janeiro" className={ic} />
              </div>
              <div>
                <label className={lc}>CEP</label>
                <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="22071-060" maxLength={9} className={ic} />
              </div>
            </div>
            {/* Endereço complementar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={lc}>Nº</label>
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="1200" className={ic} />
              </div>
              <div>
                <label className={lc}>Apto / Comp.</label>
                <input type="text" value={numeroApto} onChange={(e) => setNumeroApto(e.target.value)} placeholder="1201" className={ic} />
              </div>
              <div>
                <label className={lc}>Quadra</label>
                <input type="text" value={quadra} onChange={(e) => setQuadra(e.target.value)} placeholder="A" className={ic} />
              </div>
              <div>
                <label className={lc}>Lote</label>
                <input type="text" value={lote} onChange={(e) => setLote(e.target.value)} placeholder="12" className={ic} />
              </div>
              <div>
                <label className={lc}>Torre / Bloco</label>
                <input type="text" value={torre} onChange={(e) => setTorre(e.target.value)} placeholder="Torre A" className={ic} />
              </div>
              <div>
                <label className={lc}>Andar</label>
                <input type="number" min="0" value={andar} onChange={(e) => setAndar(e.target.value)} placeholder="12" className={ic} />
              </div>
              <div className="md:col-span-2">
                <label className={lc}>Referência</label>
                <input type="text" value={referencia} onChange={(e) => setRef(e.target.value)} placeholder="Próximo à Praça..." className={ic} />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans border-b border-border pb-3">Características</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumSelect value={dormitorios} onChange={setDormitorios} label="Dormitórios" />
              <NumSelect value={suites}      onChange={setSuites}      label="Suítes" />
              <NumSelect value={banheiros}   onChange={setBanheiros}   label="Banheiros" />
              <NumSelect value={livings}     onChange={setLivings}     label="Livings" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumSelect value={vagas}       onChange={setVagas}       label="Qtd. Vagas" />
              <div>
                <label className={lc}>Tipo de Vaga</label>
                <select value={tipoVaga} onChange={(e) => setTipoVaga(e.target.value)} className={ic}>
                  <option value="">—</option>
                  {TIPOS_VAGA.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lc}>Nº da Vaga</label>
                <input type="text" value={numeroVaga} onChange={(e) => setNumeroVaga(e.target.value)} placeholder="42-B" className={ic} />
              </div>
              <div>
                <label className={lc}>Situação da Vaga</label>
                <select value={situacaoVaga} onChange={(e) => setSitVaga(e.target.value)} className={ic}>
                  <option value="">—</option>
                  {SITUACOES_VAGA.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumSelect value={depositos}   onChange={setDepositos}   label="Depósitos" />
              <div>
                <label className={lc}>Nº dos Depósitos</label>
                <input type="text" value={numDepositos} onChange={(e) => setNumDepositos(e.target.value)} placeholder="D-01" className={ic} />
              </div>
              <NumSelect value={dependencias} onChange={setDeps}       label="Dependências" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={lc}>Área Privativa (m²)</label>
                <input type="number" min="0" step="0.1" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} placeholder="128" className={ic} />
              </div>
              <div>
                <label className={lc}>Área Total (m²)</label>
                <input type="number" min="0" step="0.1" value={areaTotal} onChange={(e) => setAreaTotal(e.target.value)} placeholder="160" className={ic} />
              </div>
              <div>
                <label className={lc}>Área do Terreno (m²)</label>
                <input type="number" min="0" step="0.1" value={areaTerreno} onChange={(e) => setAreaTer(e.target.value)} placeholder="300" className={ic} />
              </div>
            </div>
          </div>

          {/* Mobiliado */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className={lc + " mb-3"}>Mobília</p>
            <div className="flex flex-wrap gap-4">
              {[["mobiliado","Mobiliado"], ["semimobiliado","Semimobiliado"], ["decorado","Decorado"], ["sem_mobilia","Sem mobília"]].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mobiliado" value={v}
                    checked={mobiliado === v} onChange={() => setMobiliado(v)}
                    className="accent-amber-500" />
                  <span className="text-sm font-sans text-foreground/60">{l}</span>
                </label>
              ))}
              {mobiliado && (
                <button type="button" onClick={() => setMobiliado("")}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground font-sans">limpar</button>
              )}
            </div>
          </div>

          {/* Administração */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans border-b border-border pb-3">Administração</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={lc}>Proprietário</label>
                <input type="text" value={nomeProprietario} onChange={(e) => setNomeProp(e.target.value)} placeholder="Nome do proprietário" className={ic} />
              </div>
              <div>
                <label className={lc}>Contato do Proprietário</label>
                <input type="text" value={contatoProprietario} onChange={(e) => setContatoProp(e.target.value)} placeholder="+55 21 99999-9999" className={ic} />
              </div>
              <div>
                <label className={lc}>Agenciador</label>
                <input type="text" value={agenciador} onChange={(e) => setAgenciador(e.target.value)} placeholder="Nome do agenciador" className={ic} />
              </div>
              <div>
                <label className={lc}>Chaves</label>
                <input type="text" value={chaves} onChange={(e) => setChaves(e.target.value)} placeholder="Com o proprietário" className={ic} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB 1: IDENTIFICAÇÃO ══════════════════════════════════ */}
      {activeTab === 1 && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className={lc}>Título *</label>
              <input required type="text" value={title}
                onChange={(e) => { setTitle(e.target.value); if (!propertyId) setSlug(generateSlug(e.target.value)) }}
                placeholder="Ex: Apartamento 3 quartos — Leblon" className={ic} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lc}>Slug (URL)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="apartamento-3-quartos-leblon" className={ic} />
                <p className="text-muted-foreground/50 text-xs font-sans mt-1">/imovel/<span className="text-gold/40">{slug || "seu-slug"}</span></p>
              </div>
              <div>
                <label className={lc}>Preço (R$) *</label>
                <input required type="number" min="0" step="0.01" value={price}
                  onChange={(e) => setPrice(e.target.value)} placeholder="2850000" className={ic} />
              </div>
            </div>
            <div>
              <label className={lc}>Descrição</label>
              <textarea value={description} onChange={(e) => setDesc(e.target.value)}
                placeholder="Descreva o imóvel com detalhes que encantem o comprador..." rows={5}
                className={ic + " resize-none"} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lc}>Status da Unidade</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} className={ic}>
                  <option value="disponivel">Disponível</option>
                  <option value="reserva">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
              {!orgId && (
                <div>
                  <label className={lc}>Visibilidade</label>
                  <select value={visibility} onChange={(e) => setVis(e.target.value as PropertyVisibility)} className={ic}>
                    <option value="publico">Público — todos os corretores</option>
                    <option value="equipe">Equipe — somente sua organização</option>
                    <option value="privado">Privado — somente você</option>
                  </select>
                </div>
              )}
            </div>

            {/* When org is set: show explicit minisite toggle */}
            {orgId && (
              <button type="button"
                onClick={() => setVis(visibility === "publico" ? "privado" : "publico")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  visibility === "publico"
                    ? "border-emerald-700/40 bg-emerald-900/10"
                    : "border-border bg-white/[0.02]"
                }`}>
                <div className="flex items-center gap-3">
                  {visibility === "publico"
                    ? <Globe size={16} className="text-emerald-400" />
                    : <EyeOff size={16} className="text-muted-foreground" />}
                  <div className="text-left">
                    <p className={`text-sm font-sans font-medium ${visibility === "publico" ? "text-emerald-300" : "text-muted-foreground"}`}>
                      {visibility === "publico" ? "Publicado no catálogo e minisite" : "Oculto do catálogo e minisite"}
                    </p>
                    <p className="text-xs font-sans text-muted-foreground/50 mt-0.5">
                      {visibility === "publico"
                        ? "Aparece na Base de Imóveis e no minisite da organização"
                        : "Visível apenas internamente — não aparece no minisite"}
                    </p>
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${visibility === "publico" ? "bg-emerald-600" : "bg-muted"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${visibility === "publico" ? "left-6" : "left-1"}`} />
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB 2: FOTOS ══════════════════════════════════════════ */}
      {activeTab === 2 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <ImageUpload bucket="property-images" folder={slug || "temp"}
            value={images} onChange={setImages} maxFiles={40} />
          <div>
            <label className={lc}>URL do Vídeo (YouTube / Vimeo)</label>
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..." className={ic} />
          </div>
        </div>
      )}

      {/* ══ TAB 3: DIFERENCIAIS ═══════════════════════════════════ */}
      {activeTab === 3 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className={lc + " mb-4"}>Selecione os diferenciais do imóvel</p>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const info = getTagInfo(tag)
              const Icon = info.icon
              const active = selectedTags.includes(tag)
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-sans transition-all ${
                    active ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-white/25"
                  }`}>
                  <Icon size={12} />
                  {info.label}
                  {active ? <X size={10} /> : <Plus size={10} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Erro + Botões ──────────────────── */}
      {error && (
        <div className="mt-5 px-4 py-3 rounded-lg text-sm font-sans bg-red-900/20 text-red-400 border border-red-700/30">
          {error}
        </div>
      )}

      <div className="flex gap-4 mt-6 pb-8">
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 border border-border text-muted-foreground hover:border-white/25 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
          Cancelar
        </button>
        {activeTab < TABS.length - 1 && (
          <button type="button" onClick={() => setActiveTab((t) => t + 1)}
            className="px-6 py-3 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            Próximo
          </button>
        )}
        <button type="submit" disabled={loading}
          className="flex-1 py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium">
          {loading
            ? <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
            : <><Save size={14} /> {propertyId ? "Salvar Alterações" : "Cadastrar Imóvel"}</>}
        </button>
      </div>
    </form>
  )
}
