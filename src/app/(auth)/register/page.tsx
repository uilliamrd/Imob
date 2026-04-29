"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Building2, Users, User, ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { BorderBeam } from "@/components/magicui/border-beam"
import type { UserRole } from "@/types/database"

type RoleOption = {
  value: UserRole
  emoji: string
  label: string
  desc: string
  badge: string
  badgeVariant: "gold" | "muted"
  icon: React.ElementType
  showCnpj: boolean
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "construtora",
    emoji: "🏗️",
    label: "Construtora",
    desc: "Gerencie empreendimentos e venda mais",
    badge: "Planos pagos",
    badgeVariant: "gold",
    icon: Building2,
    showCnpj: true,
  },
  {
    value: "imobiliaria",
    emoji: "🏢",
    label: "Imobiliária",
    desc: "Acesse imóveis de construtoras parceiras",
    badge: "Acesso gratuito",
    badgeVariant: "muted",
    icon: Users,
    showCnpj: true,
  },
  {
    value: "corretor",
    emoji: "👤",
    label: "Corretor",
    desc: "Dispare anúncios e rastreie seus leads",
    badge: "Acesso gratuito",
    badgeVariant: "muted",
    icon: User,
    showCnpj: false,
  },
]

export default function RegisterPage() {
  const [step, setStep]         = useState<1 | 2>(1)
  const [fullName, setFullName] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole]         = useState<UserRole>("construtora")
  const [cnpj, setCnpj]         = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [creci, setCreci]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)!

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, whatsapp, creci, cnpj } },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Erro ao criar conta.")
      setLoading(false)
      return
    }

    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      role,
      whatsapp: whatsapp || null,
      creci: creci || null,
    }, { onConflict: "id" })

    router.push("/dashboard")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md px-6"
    >
      <div className="relative rounded-2xl p-10 bg-[#1a1a1a] border border-[rgba(201,169,110,0.25)]">
        <BorderBeam size={300} duration={14} delay={2} />

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">
            Base Imob
          </p>
          <h1 className="font-serif text-3xl font-bold text-white">
            Criar sua conta
          </h1>
          <p className="text-white/40 text-sm font-sans mt-2">
            Escolha como você vai usar o Base Imob
          </p>
          <div className="divider-gold mt-5 mx-auto w-16" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-sans transition-colors ${step >= s ? "bg-gold text-graphite" : "border border-white/20 text-white/30"}`}>
                {s}
              </div>
              {s < 2 && <div className={`flex-1 h-px transition-colors ${step > s ? "bg-gold" : "bg-card/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              {/* ── Passo 1: Seleção de perfil ──────────────── */}
              <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-3">Seu Perfil</p>
              <div className="space-y-2 mb-6">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      role === opt.value
                        ? "border-gold/60 bg-gold/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/3"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">{opt.emoji}</span>
                        <div>
                          <p className={`text-sm font-sans font-semibold ${role === opt.value ? "text-gold" : "text-white/80"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[9px] uppercase tracking-wider font-sans px-2 py-1 rounded-full border whitespace-nowrap ${
                        opt.badgeVariant === "gold"
                          ? "bg-gold/15 border-gold/30 text-gold"
                          : "bg-white/5 border-white/15 text-white/40"
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gold text-graphite hover:bg-gold-light transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                Continuar
              </button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              {/* ── Passo 2: Dados da conta ──────────────────── */}
              <div className="flex items-center gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Voltar"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedRole.emoji}</span>
                  <span className="text-white/60 text-xs font-sans">{selectedRole.label}</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">Nome Completo</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="João Silva" className="w-full bg-card/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-card/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">Senha</label>
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-card/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                {selectedRole.showCnpj && (
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">CNPJ</label>
                    <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="w-full bg-card/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                  </div>
                )}
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">WhatsApp</label>
                  <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 99999-9999" className="w-full bg-card/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                {role === "corretor" && (
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">CRECI</label>
                    <input type="text" value={creci} onChange={(e) => setCreci(e.target.value)} placeholder="Ex: 123456-F" className="w-full bg-card/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                  </div>
                )}

                {error && <p className="text-red-400 text-xs font-sans text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium mt-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
                  ) : (
                    <><UserPlus size={14} /> Criar conta</>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-white/30 text-xs font-sans mt-6">
          Já tem conta?{" "}
          <Link href="/" className="text-gold hover:text-gold-light transition-colors">Entrar</Link>
        </p>
      </div>
    </motion.div>
  )
}
