"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, ArrowLeft, User, Phone, Mail, MapPin, Home, DollarSign,
  BedDouble, Car, FileText, CheckCircle, Sparkles, Star, Shield,
  BadgeCheck, Camera, Handshake, ChevronRight, Building2,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────

export type CorretorCard = {
  id: string
  full_name: string | null
  avatar_url: string | null
  creci: string | null
  bio: string | null
  organization: { name: string } | null
}

type Step = "intro" | "dados" | "exclusividade" | "planos" | "confirmacao"
type Plan = "free" | "destaque" | "super_destaque" | "exclusivo"
type TipoNegocio = "venda" | "locacao"

interface FormState {
  owner_name: string
  owner_phone: string
  owner_email: string
  address: string
  neighborhood: string
  city: string
  cep: string
  tipo: string
  tipo_negocio: TipoNegocio
  price: string
  area_m2: string
  quartos: string
  vagas: string
  description: string
}

const EMPTY_FORM: FormState = {
  owner_name: "", owner_phone: "", owner_email: "",
  address: "", neighborhood: "", city: "", cep: "",
  tipo: "", tipo_negocio: "venda",
  price: "", area_m2: "", quartos: "", vagas: "", description: "",
}

// ── Plans config ──────────────────────────────────────────────

const PLANS: {
  id: Plan
  name: string
  price: string
  badge: string
  color: string
  borderColor: string
  icon: React.ElementType
  features: string[]
  cta: string
}[] = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    badge: "Sem custo",
    color: "text-zinc-300",
    borderColor: "border-zinc-700/50",
    icon: Home,
    features: [
      "Cadastro revisado pela equipe",
      "Visível apenas para corretores credenciados",
      "Entra na fila de aprovação",
    ],
    cta: "Cadastrar grátis",
  },
  {
    id: "destaque",
    name: "Destaque",
    price: "R$ 97",
    badge: "/mês",
    color: "text-amber-300",
    borderColor: "border-amber-700/40",
    icon: Star,
    features: [
      "Badge dourado no portal de busca",
      "Prioridade na listagem para compradores",
      "Contato direto de corretores interessados",
      "Visível para toda a base de clientes",
    ],
    cta: "Escolher Destaque",
  },
  {
    id: "super_destaque",
    name: "Super Destaque",
    price: "R$ 197",
    badge: "/mês",
    color: "text-gold",
    borderColor: "border-gold/50",
    icon: Sparkles,
    features: [
      "Topo do portal — máxima visibilidade",
      "Notificação para toda a rede de corretores",
      "Destaque especial nas buscas",
      "Relatório de visualizações",
    ],
    cta: "Escolher Super Destaque",
  },
  {
    id: "exclusivo",
    name: "Exclusivo",
    price: "% comissão",
    badge: "sobre venda",
    color: "text-emerald-300",
    borderColor: "border-emerald-700/40",
    icon: Shield,
    features: [
      "Corretor dedicado para gerir toda a venda",
      "Fotos e tour virtual profissional",
      "Divulgação em todas as plataformas",
      "Documentação e negociação assistida",
      "Suporte até a assinatura do contrato",
    ],
    cta: "Quero Exclusividade",
  },
]

// ── Component ─────────────────────────────────────────────────

interface Props {
  corretores: CorretorCard[]
}

const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
  transition: { duration: 0.4 },
}

export function VendaWizard({ corretores }: Props) {
  const [step, setStep] = useState<Step>("intro")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [plan, setPlan] = useState<Plan>("free")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null)

  function update(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao enviar."); return }
      setSubmittedStatus(data.status)
      setStep("confirmacao")
    } catch {
      setError("Falha de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-[10px] uppercase tracking-[0.15em] text-white/50 font-sans block mb-1.5"

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AnimatePresence mode="wait">

        {/* ── INTRO ─────────────────────────────────────────────── */}
        {step === "intro" && (
          <motion.div key="intro" {...fade} className="relative">
            {/* Hero */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "radial-gradient(circle, #C9A96E 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/0 to-[#0a0a0a]" />

              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-8"
                >
                  <Sparkles size={12} className="text-gold" />
                  <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-sans">Portal RealState Intelligence</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
                >
                  Venda seu<br />
                  <span className="italic" style={{ color: "#C9A96E" }}>imóvel</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="text-white/60 font-sans text-lg leading-relaxed mb-10 max-w-xl mx-auto"
                >
                  Cadastre seu imóvel e conecte-se com nossa rede de corretores especializados. Alcance os compradores certos, pelo melhor preço.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button
                    onClick={() => setStep("dados")}
                    className="flex items-center justify-center gap-2 px-10 py-4 bg-gold text-[#0a0a0a] hover:brightness-110 transition-all text-sm uppercase tracking-[0.2em] font-sans rounded-sm"
                  >
                    Cadastrar meu imóvel <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setStep("exclusividade")}
                    className="flex items-center justify-center gap-2 px-10 py-4 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm uppercase tracking-[0.2em] font-sans rounded-sm"
                  >
                    Como funciona
                  </button>
                </motion.div>
              </div>
            </section>

            {/* Value props */}
            <section className="py-20 px-6 border-t border-white/5">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Shield, title: "Segurança", desc: "Todos os corretores são credenciados e verificados com CRECI ativo." },
                  { icon: Handshake, title: "Negociação Assistida", desc: "Nossa equipe acompanha todo o processo até a assinatura." },
                  { icon: BadgeCheck, title: "Melhor Preço", desc: "Avaliação de mercado e estratégia de precificação incluídas." },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center mx-auto mb-4">
                        <Icon size={18} className="text-gold/70" />
                      </div>
                      <h3 className="font-serif text-white text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-white/40 font-sans text-sm leading-relaxed">{item.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </section>

            {/* Corretores preview */}
            {corretores.length > 0 && (
              <section className="py-16 px-6 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                  <p className="text-center text-[10px] uppercase tracking-[0.3em] text-gold/60 font-sans mb-3">Nossa Rede</p>
                  <p className="text-center text-white/60 font-sans text-sm mb-8">
                    {corretores.length} corretores ativos prontos para atender sua demanda
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {corretores.slice(0, 8).map((c) => (
                      <div key={c.id} className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-full px-3 py-1.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                          {c.avatar_url
                            ? <Image src={c.avatar_url} alt="" width={24} height={24} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center"><User size={10} className="text-white/30" /></div>
                          }
                        </div>
                        <span className="text-white/60 text-xs font-sans">{c.full_name ?? "Corretor"}</span>
                      </div>
                    ))}
                    {corretores.length > 8 && (
                      <div className="flex items-center px-3 py-1.5 bg-white/[0.04] border border-white/8 rounded-full">
                        <span className="text-white/40 text-xs font-sans">+{corretores.length - 8} mais</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        )}

        {/* ── DADOS ─────────────────────────────────────────────── */}
        {step === "dados" && (
          <motion.div key="dados" {...fade} className="py-16 px-6">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="mb-10">
                <button onClick={() => setStep("intro")} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-sans uppercase tracking-wider mb-6">
                  <ArrowLeft size={12} /> Voltar
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gold text-[#0a0a0a] flex items-center justify-center text-xs font-bold font-serif">1</div>
                  <span className="text-white/40 text-xs font-sans uppercase tracking-wider">Etapa 1 de 3</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-white mb-2">Dados do Imóvel</h2>
                <p className="text-white/40 font-sans text-sm">Preencha as informações sobre o imóvel e seus dados de contato.</p>
              </div>

              {/* Contact */}
              <div className="mb-8">
                <p className="text-gold/70 text-[10px] uppercase tracking-[0.2em] font-sans mb-4 flex items-center gap-2">
                  <User size={10} /> Seus dados
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Nome completo *</label>
                    <input type="text" value={form.owner_name} onChange={(e) => update("owner_name", e.target.value)}
                      placeholder="Seu nome" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefone / WhatsApp *</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="tel" value={form.owner_phone} onChange={(e) => update("owner_phone", e.target.value)}
                        placeholder="(21) 99999-9999" className={inputClass + " pl-9"} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>E-mail</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="email" value={form.owner_email} onChange={(e) => update("owner_email", e.target.value)}
                        placeholder="seu@email.com" className={inputClass + " pl-9"} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property */}
              <div className="mb-8">
                <p className="text-gold/70 text-[10px] uppercase tracking-[0.2em] font-sans mb-4 flex items-center gap-2">
                  <Home size={10} /> Sobre o imóvel
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tipo de imóvel</label>
                    <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)} className={inputClass}>
                      <option value="">Selecione...</option>
                      {["Apartamento", "Casa", "Cobertura", "Flat / Studio", "Terreno / Lote", "Sala Comercial", "Galpão", "Outro"].map((t) => (
                        <option key={t} value={t.toLowerCase()}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Negócio</label>
                    <div className="flex gap-2">
                      {(["venda", "locacao"] as TipoNegocio[]).map((t) => (
                        <button key={t} type="button"
                          onClick={() => update("tipo_negocio", t)}
                          className={`flex-1 py-3 rounded-xl text-xs font-sans uppercase tracking-wider transition-colors border ${
                            form.tipo_negocio === t
                              ? "bg-gold text-[#0a0a0a] border-gold"
                              : "border-white/10 text-white/40 hover:border-white/20"
                          }`}>
                          {t === "venda" ? "Venda" : "Locação"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Endereço</label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)}
                        placeholder="Rua, número" className={inputClass + " pl-9"} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Bairro</label>
                    <input type="text" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)}
                      placeholder="Bairro" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Cidade</label>
                    <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                      placeholder="Cidade" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>CEP</label>
                    <input type="text" value={form.cep} onChange={(e) => update("cep", e.target.value)}
                      placeholder="00000-000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Valor (R$)</label>
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)}
                        placeholder="0" className={inputClass + " pl-9"} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Área (m²)</label>
                    <input type="number" value={form.area_m2} onChange={(e) => update("area_m2", e.target.value)}
                      placeholder="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Quartos</label>
                    <div className="relative">
                      <BedDouble size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="number" value={form.quartos} onChange={(e) => update("quartos", e.target.value)}
                        placeholder="0" className={inputClass + " pl-9"} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Vagas</label>
                    <div className="relative">
                      <Car size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="number" value={form.vagas} onChange={(e) => update("vagas", e.target.value)}
                        placeholder="0" className={inputClass + " pl-9"} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Descrição</label>
                    <div className="relative">
                      <FileText size={13} className="absolute left-3 top-4 text-white/20" />
                      <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                        placeholder="Descreva os diferenciais do seu imóvel..."
                        rows={4}
                        className={inputClass + " pl-9 resize-none leading-relaxed"} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep("exclusividade")}
                disabled={!form.owner_name.trim() || !form.owner_phone.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gold text-[#0a0a0a] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-[0.2em] font-sans rounded-sm"
              >
                Continuar <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── EXCLUSIVIDADE ─────────────────────────────────────── */}
        {step === "exclusividade" && (
          <motion.div key="exclusividade" {...fade} className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setStep(form.owner_name ? "dados" : "intro")}
                className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-sans uppercase tracking-wider mb-8"
              >
                <ArrowLeft size={12} /> Voltar
              </button>

              {/* Pitch */}
              <div className="text-center mb-16">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <div className="w-7 h-7 rounded-full bg-gold text-[#0a0a0a] flex items-center justify-center text-xs font-bold font-serif">2</div>
                  <span className="text-white/40 text-xs font-sans uppercase tracking-wider">Etapa 2 de 3</span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
                  Gestão <span className="italic text-gold">Exclusiva</span> da sua Venda
                </h2>
                <div className="h-px w-16 bg-gold/40 mx-auto mb-6" />
                <p className="text-white/60 font-sans text-lg leading-relaxed max-w-2xl mx-auto">
                  Com o serviço de exclusividade, um corretor dedicado cuida de cada detalhe da venda do seu imóvel — da avaliação à assinatura.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                {[
                  { icon: Camera,     title: "Fotos e Tour Virtual Profissional",    desc: "Produção fotográfica de alto padrão e tour 360° para máximo impacto." },
                  { icon: Sparkles,   title: "Divulgação Premium",                    desc: "Seu imóvel em destaque no portal, redes sociais e para toda a rede de corretores." },
                  { icon: Handshake,  title: "Negociação Assistida",                  desc: "Estratégia de preço, filtragem de compradores sérios, acompanhamento nas visitas." },
                  { icon: BadgeCheck, title: "Documentação e Jurídico",               desc: "Suporte completo até a assinatura — escritura, ITBI e registro incluídos." },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex gap-4 bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                      <div className="w-10 h-10 rounded-xl border border-gold/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-gold/70" />
                      </div>
                      <div>
                        <h4 className="font-serif text-white text-base font-semibold mb-1">{item.title}</h4>
                        <p className="text-white/45 font-sans text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Corretores */}
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 size={14} className="text-gold/60" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-sans">
                    {corretores.length} corretor{corretores.length !== 1 ? "es" : ""} ativos no portal
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {corretores.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/[0.03] border border-white/8 rounded-xl p-4 flex flex-col items-center text-center"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 mb-3 flex-shrink-0">
                        {c.avatar_url
                          ? <Image src={c.avatar_url} alt={c.full_name ?? ""} width={56} height={56} className="object-cover w-full h-full" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <span className="font-serif text-xl text-white/20">{c.full_name?.[0]?.toUpperCase() ?? "C"}</span>
                            </div>
                        }
                      </div>
                      <p className="font-serif text-white text-sm font-semibold leading-tight truncate w-full">{c.full_name ?? "Corretor"}</p>
                      {c.creci && (
                        <p className="text-[10px] font-sans text-gold/50 mt-0.5">CRECI {c.creci}</p>
                      )}
                      {c.organization && (
                        <p className="text-[10px] font-sans text-white/25 mt-1 truncate w-full">{c.organization.name}</p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {corretores.length === 0 && (
                  <div className="py-8 text-center text-white/20 font-sans text-sm">
                    Nenhum corretor ativo no momento.
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep("planos")}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gold text-[#0a0a0a] hover:brightness-110 transition-all text-sm uppercase tracking-[0.2em] font-sans rounded-sm"
              >
                Ver Planos Disponíveis <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PLANOS ────────────────────────────────────────────── */}
        {step === "planos" && (
          <motion.div key="planos" {...fade} className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <button onClick={() => setStep("exclusividade")} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-sans uppercase tracking-wider mb-8">
                <ArrowLeft size={12} /> Voltar
              </button>

              <div className="text-center mb-12">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <div className="w-7 h-7 rounded-full bg-gold text-[#0a0a0a] flex items-center justify-center text-xs font-bold font-serif">3</div>
                  <span className="text-white/40 text-xs font-sans uppercase tracking-wider">Etapa 3 de 3</span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
                  Escolha seu <span className="italic text-gold">Plano</span>
                </h2>
                <div className="h-px w-16 bg-gold/40 mx-auto mb-4" />
                <p className="text-white/50 font-sans">Turbine o alcance do seu anúncio entre corretores e compradores.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {PLANS.map((p) => {
                  const Icon = p.icon
                  const selected = plan === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlan(p.id)}
                      className={`relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-300 ${
                        selected
                          ? `${p.borderColor} bg-white/[0.06]`
                          : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle size={16} className="text-gold" />
                        </div>
                      )}

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${
                        selected ? p.borderColor : "border-white/10"
                      }`}>
                        <Icon size={16} className={selected ? p.color : "text-white/30"} />
                      </div>

                      <p className={`font-serif text-lg font-bold mb-0.5 ${selected ? p.color : "text-white"}`}>
                        {p.name}
                      </p>
                      <p className="text-xs font-sans text-white/40 mb-4">
                        <span className="text-xl font-serif font-bold text-white/80">{p.price}</span>
                        {" "}{p.badge}
                      </p>

                      <ul className="space-y-2 flex-1">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs font-sans text-white/50 leading-relaxed">
                            <span className="mt-0.5 flex-shrink-0 text-gold/60">✦</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>

              {error && (
                <p className="text-red-400 text-xs font-sans text-center mb-4">{error}</p>
              )}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gold text-[#0a0a0a] hover:brightness-110 disabled:opacity-50 transition-all text-sm uppercase tracking-[0.2em] font-sans rounded-sm"
              >
                {loading ? "Enviando..." : (
                  <>{PLANS.find((p) => p.id === plan)?.cta ?? "Confirmar"} <ArrowRight size={14} /></>
                )}
              </button>
              <p className="text-center text-white/20 text-xs font-sans mt-3">
                Planos pagos são gerenciados pela nossa equipe após contato.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── CONFIRMAÇÃO ───────────────────────────────────────── */}
        {step === "confirmacao" && (
          <motion.div key="confirmacao" {...fade} className="py-24 px-6">
            <div className="max-w-xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle size={36} className="text-gold" />
              </motion.div>

              <h2 className="font-serif text-4xl font-bold text-white mb-4">
                {submittedStatus === "duplicate"
                  ? "Imóvel já cadastrado!"
                  : "Cadastro enviado!"}
              </h2>
              <div className="h-px w-16 bg-gold/40 mx-auto mb-6" />
              <p className="text-white/60 font-sans text-base leading-relaxed mb-3">
                {submittedStatus === "duplicate"
                  ? "Encontramos um imóvel com endereço similar no nosso sistema. Nossa equipe vai verificar e entrar em contato para confirmar o cadastro."
                  : "Recebemos seu cadastro com sucesso. Nossa equipe vai revisar as informações e entrar em contato pelo WhatsApp informado em breve."}
              </p>
              <p className="text-white/30 font-sans text-sm mb-12">
                Qualquer dúvida, entre em contato pelo portal ou aguarde nosso retorno.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => { setStep("intro"); setForm(EMPTY_FORM); setPlan("free") }}
                  className="px-8 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
                >
                  Cadastrar outro imóvel
                </button>
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gold text-[#0a0a0a] hover:brightness-110 transition-all text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
                >
                  Ir ao Portal <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
