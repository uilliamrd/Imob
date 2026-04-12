"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import type { UserRole } from "@/types/database"

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "corretor", label: "Corretor", desc: "Acesso a imóveis e geração de links com ref" },
  { value: "imobiliaria", label: "Imobiliária", desc: "Gestão de imóveis e equipe de corretores" },
  { value: "construtora", label: "Construtora", desc: "Landing pages e portfólio de empreendimentos" },
]

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("corretor")
  const [whatsapp, setWhatsapp] = useState("")
  const [creci, setCreci] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, whatsapp, creci } },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Erro ao criar conta.")
      setLoading(false)
      return
    }

    // Tenta atualizar o perfil (funciona se email confirmation estiver desativado)
    // Se não funcionar, o trigger do Supabase vai ler os metadados acima
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
            RealState Intelligence
          </p>
          <h1 className="font-serif text-3xl font-bold text-white">
            Criar{" "}
            <AnimatedGradientText className="font-serif text-3xl font-bold italic">
              Conta
            </AnimatedGradientText>
          </h1>
          <div className="divider-gold mt-6 mx-auto w-16" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-sans transition-colors ${
                  step >= s ? "bg-gold text-graphite" : "border border-white/20 text-white/30"
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className={`flex-1 h-px transition-colors ${step > s ? "bg-gold" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">Nome Completo</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="João Silva" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">Senha</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-3">Seu Perfil</label>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        role === r.value
                          ? "border-gold/60 bg-gold/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <p className={`text-sm font-sans font-medium ${role === r.value ? "text-gold" : "text-white/80"}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">WhatsApp</label>
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 99999-9999" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
              </div>
              {(role === "corretor" || role === "imobiliaria") && (
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">CRECI</label>
                  <input type="text" value={creci} onChange={(e) => setCreci(e.target.value)} placeholder="Ex: 123456-F" className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
              )}
            </>
          )}

          {error && <p className="text-red-400 text-xs font-sans text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 text-white/60 hover:border-white/30 transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg">
                Voltar
              </button>
            )}
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium">
              {loading ? (
                <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
              ) : step === 1 ? (
                "Continuar"
              ) : (
                <><UserPlus size={14} /> Cadastrar</>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-white/30 text-xs font-sans mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors">Entrar</Link>
        </p>
      </div>
    </motion.div>
  )
}
