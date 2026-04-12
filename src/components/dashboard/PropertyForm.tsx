"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getTagInfo, getAllTags } from "@/lib/tag-icons"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { Save, Plus, X, Hash, Building2 } from "lucide-react"
import type { IngestPropertyPayload, PropertyStatus, PropertyVisibility, Development } from "@/types/database"

const ALL_TAGS = Object.keys(getAllTags())

interface PropertyFormProps {
  initialData?: Partial<IngestPropertyPayload> & { images?: string[]; code?: number; development_id?: string | null }
  propertyId?: string
  orgId?: string | null
  developments?: Development[]
}

export function PropertyForm({ initialData, propertyId, orgId, developments = [] }: PropertyFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "")
  const [status, setStatus] = useState<PropertyStatus>(initialData?.status ?? "disponivel")
  const [visibility, setVisibility] = useState<PropertyVisibility>(initialData?.visibility ?? "publico")
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags ?? [])
  const [developmentId, setDevelopmentId] = useState<string>(initialData?.development_id ?? "")

  // Features
  const [suites, setSuites] = useState(initialData?.features?.suites?.toString() ?? "")
  const [dependencias, setDependencias] = useState(initialData?.features?.dependencias?.toString() ?? "")
  const [dormitorios, setDormitorios] = useState(initialData?.features?.dormitorios?.toString() ?? "")
  const [vagas, setVagas] = useState(initialData?.features?.vagas?.toString() ?? "")
  const [numeroVaga, setNumeroVaga] = useState(initialData?.features?.numero_vaga?.toString() ?? "")
  const [area, setArea] = useState(initialData?.features?.area_m2?.toString() ?? "")
  const [banheiros, setBanheiros] = useState(initialData?.features?.banheiros?.toString() ?? "")
  const [andar, setAndar] = useState(initialData?.features?.andar?.toString() ?? "")
  const [numeroApto, setNumeroApto] = useState(initialData?.features?.numero_apto?.toString() ?? "")
  const [nomeProprietario, setNomeProprietario] = useState(initialData?.features?.nome_proprietario?.toString() ?? "")
  const [contatoProprietario, setContatoProprietario] = useState(initialData?.features?.contato_proprietario?.toString() ?? "")

  // Location
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood ?? "")
  const [city, setCity] = useState(initialData?.city ?? "")
  const [address, setAddress] = useState(initialData?.address ?? "")

  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function generateSlug(t: string) {
    return t.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-")
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handleDevelopmentChange(devId: string) {
    setDevelopmentId(devId)
    if (!devId) return
    const dev = developments.find((d) => d.id === devId)
    if (dev) {
      if (dev.address) setAddress(dev.address)
      if (dev.neighborhood) setNeighborhood(dev.neighborhood)
      if (dev.city) setCity(dev.city)
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const payload = {
      title,
      slug: slug || generateSlug(title),
      description: description || null,
      price: parseFloat(price),
      status,
      visibility,
      tags: selectedTags,
      images,
      video_url: videoUrl || null,
      development_id: developmentId || null,
      features: {
        ...(suites ? { suites: parseInt(suites) } : {}),
        ...(dependencias ? { dependencias: parseInt(dependencias) } : {}),
        ...(dormitorios ? { dormitorios: parseInt(dormitorios) } : {}),
        ...(vagas ? { vagas: parseInt(vagas) } : {}),
        ...(numeroVaga ? { numero_vaga: numeroVaga } : {}),
        ...(area ? { area_m2: parseFloat(area) } : {}),
        ...(banheiros ? { banheiros: parseInt(banheiros) } : {}),
        ...(andar ? { andar: parseInt(andar) } : {}),
        ...(numeroApto ? { numero_apto: numeroApto } : {}),
        ...(nomeProprietario ? { nome_proprietario: nomeProprietario } : {}),
        ...(contatoProprietario ? { contato_proprietario: contatoProprietario } : {}),
      },
      neighborhood: neighborhood || null,
      city: city || null,
      address: address || null,
      updated_at: new Date().toISOString(),
    }

    if (propertyId) {
      const { error } = await supabase.from("properties").update(payload).eq("id", propertyId)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from("properties").insert({
        ...payload,
        created_by: user?.id,
        org_id: orgId ?? null,
        created_at: new Date().toISOString(),
      })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push("/dashboard/imoveis")
    router.refresh()
  }

  const inputClass = "w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Código do Imóvel ─────────────────────────────────── */}
      {initialData?.code && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gold/5 border border-gold/20 rounded-xl">
          <Hash size={14} className="text-gold" />
          <span className="text-gold font-sans text-sm">Código do imóvel: <strong>{initialData.code}</strong></span>
        </div>
      )}

      {/* ── Empreendimento ────────────────────────────────────── */}
      {developments.length > 0 && (
        <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Building2 size={16} className="text-gold" />
            <h2 className="font-serif text-lg font-semibold text-white">Empreendimento</h2>
            <span className="text-white/30 text-xs font-sans ml-1">(opcional)</span>
          </div>
          <div>
            <label className={labelClass}>Vincular a um empreendimento</label>
            <select
              value={developmentId}
              onChange={(e) => handleDevelopmentChange(e.target.value)}
              className={inputClass}
            >
              <option value="">— Imóvel avulso (sem empreendimento) —</option>
              {developments.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name}{dev.neighborhood ? ` · ${dev.neighborhood}` : ""}{dev.city ? `, ${dev.city}` : ""}
                  {dev.is_lancamento ? " 🔥 Lançamento" : ""}
                </option>
              ))}
            </select>
            {developmentId && (
              <p className="text-gold/50 text-xs font-sans mt-1">
                Localização preenchida automaticamente pelo empreendimento.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Fotos ───────────────────────────────────────────── */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Fotos do Imóvel
        </h2>
        <ImageUpload
          bucket="property-images"
          folder={slug || "temp"}
          value={images}
          onChange={setImages}
          maxFiles={40}
        />
        <div>
          <label className={labelClass}>URL do Vídeo (YouTube / Vimeo)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>
      </section>

      {/* ── Informações Básicas ─────────────────────────────── */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Informações Básicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Título *</label>
            <input required type="text" value={title}
              onChange={(e) => { setTitle(e.target.value); if (!propertyId) setSlug(generateSlug(e.target.value)) }}
              placeholder="Ex: Torre A — Apt 1201" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <input required type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="torre-a-apt-1201" className={inputClass} />
            <p className="text-white/20 text-xs font-sans mt-1">
              /imovel/<span className="text-gold/40">{slug || "seu-slug"}</span>
            </p>
          </div>
          <div>
            <label className={labelClass}>Preço (R$) *</label>
            <input required type="number" min="0" step="0.01" value={price}
              onChange={(e) => setPrice(e.target.value)} placeholder="2850000" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o imóvel com detalhes que encantem o comprador..." rows={4}
              className={inputClass + " resize-none"} />
          </div>
        </div>
      </section>

      {/* ── Características ─────────────────────────────────── */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Características
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>Suítes</label>
            <input type="number" min="0" value={suites} onChange={(e) => setSuites(e.target.value)} placeholder="4" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Dormitórios</label>
            <input type="number" min="0" value={dormitorios} onChange={(e) => setDormitorios(e.target.value)} placeholder="2" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Dependências</label>
            <input type="number" min="0" value={dependencias} onChange={(e) => setDependencias(e.target.value)} placeholder="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Banheiros</label>
            <input type="number" min="0" value={banheiros} onChange={(e) => setBanheiros(e.target.value)} placeholder="2" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Vagas</label>
            <input type="number" min="0" value={vagas} onChange={(e) => setVagas(e.target.value)} placeholder="3" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nº da Vaga</label>
            <input type="text" value={numeroVaga} onChange={(e) => setNumeroVaga(e.target.value)} placeholder="Ex: 42-B" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Área (m²)</label>
            <input type="number" min="0" step="0.1" value={area} onChange={(e) => setArea(e.target.value)} placeholder="198" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Andar</label>
            <input type="number" min="0" value={andar} onChange={(e) => setAndar(e.target.value)} placeholder="12" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nº do Apto</label>
            <input type="text" value={numeroApto} onChange={(e) => setNumeroApto(e.target.value)} placeholder="1201" className={inputClass} />
          </div>
        </div>

        <div className="border-t border-white/5 pt-5">
          <p className="text-xs uppercase tracking-[0.15em] text-white/30 font-sans mb-4">Proprietário</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nome do Proprietário</label>
              <input type="text" value={nomeProprietario} onChange={(e) => setNomeProprietario(e.target.value)}
                placeholder="João Silva" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contato do Proprietário</label>
              <input type="text" value={contatoProprietario} onChange={(e) => setContatoProprietario(e.target.value)}
                placeholder="+55 11 99999-9999" className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Localização ─────────────────────────────────────── */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Localização
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-3">
            <label className={labelClass}>Endereço Completo</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Delfim Moreira, 1200" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Leblon" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Cidade</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="Rio de Janeiro" className={inputClass} />
          </div>
        </div>
      </section>

      {/* ── Diferenciais ────────────────────────────────────── */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4 mb-5">
          Diferenciais
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => {
            const info = getTagInfo(tag)
            const Icon = info.icon
            const active = selectedTags.includes(tag)
            return (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-sans transition-all duration-200 ${
                  active ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-white/40 hover:border-white/25"
                }`}>
                <Icon size={12} />
                {info.label}
                {active ? <X size={10} /> : <Plus size={10} />}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Status & Visibilidade ────────────────────────────── */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Status & Visibilidade
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Status da Unidade</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} className={inputClass}>
              <option value="disponivel">Disponível</option>
              <option value="reserva">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Visibilidade</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as PropertyVisibility)} className={inputClass}>
              <option value="publico">Público — visível a todos os corretores</option>
              <option value="equipe">Equipe — somente sua organização</option>
              <option value="privado">Privado — somente você</option>
            </select>
          </div>
        </div>
      </section>

      {error && <p className="text-red-400 text-sm font-sans text-center bg-red-900/10 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex gap-4 pb-8">
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 border border-white/10 text-white/50 hover:border-white/25 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium">
          {loading
            ? <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
            : <><Save size={14} /> {propertyId ? "Salvar Alterações" : "Cadastrar Imóvel"}</>}
        </button>
      </div>
    </form>
  )
}
