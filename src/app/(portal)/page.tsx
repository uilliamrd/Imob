"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Check, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const BULLETS = [
  "Gerencie seus empreendimentos em um só lugar",
  "Rastreie leads com precisão anti-pelota",
  "Dispare anúncios profissionais automaticamente",
]

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        setError("Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.")
      } else if (authError.message.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Coluna esquerda — Branding (desktop) ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[40%] bg-foreground flex-col relative overflow-hidden shrink-0">
        {/* Círculo decorativo desfocado */}
        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-[var(--gold)]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col justify-between h-full p-12 relative z-10">
          <div>
            {/* Logo */}
            <div className="mb-14">
              <span className="font-serif text-[2.5rem] font-bold text-background leading-none">Base</span>
              <span className="font-serif text-[2.5rem] font-bold text-[var(--gold)] leading-none">Imob</span>
            </div>

            {/* Tagline */}
            <h2 className="font-serif text-2xl font-bold text-background/90 leading-snug mb-10">
              A plataforma que conecta construtoras,<br />
              corretores e compradores.
            </h2>

            {/* Bullets */}
            <ul className="space-y-5">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/50 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-[var(--gold)]" />
                  </div>
                  <span className="text-background/65 font-sans text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-background/25 text-xs font-sans">© 2025 Base Imob</p>
        </div>
      </div>

      {/* ── Coluna direita — Formulário ───────────────────────────────── */}
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-6 min-h-screen">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8 text-center">
          <span className="font-serif text-3xl font-bold text-foreground">Base</span>
          <span className="font-serif text-3xl font-bold text-[var(--gold)]">Imob</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-card rounded-2xl p-8 border border-border shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          <div className="mb-7">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground font-sans">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-sans font-medium text-foreground/80 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm font-sans focus:outline-none focus:border-[var(--gold)]/60 focus:ring-2 focus:ring-[var(--gold)]/10 transition-colors"
              />
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-sans font-medium text-foreground/80">Senha</label>
                <Link
                  href="/login"
                  className="text-[var(--gold)] text-xs font-sans hover:text-[var(--gold-light)] transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm font-sans focus:outline-none focus:border-[var(--gold)]/60 focus:ring-2 focus:ring-[var(--gold)]/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <p className="text-red-500 text-xs font-sans text-center bg-red-500/8 py-2.5 px-3 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-[var(--gold)] text-[#0a0a0a] font-sans font-semibold text-sm hover:bg-[var(--gold-light)] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs font-sans px-1">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Criar conta */}
          <Link
            href="/register"
            className="flex items-center justify-center w-full h-12 rounded-lg border border-border text-foreground font-sans text-sm hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-all duration-200"
          >
            Criar conta gratuita
          </Link>

          {/* Termos */}
          <p className="mt-6 text-center text-xs text-muted-foreground font-sans leading-relaxed">
            Ao acessar você concorda com os{" "}
            <span className="underline underline-offset-2 cursor-default">Termos de uso</span>
            {" | "}
            <span className="underline underline-offset-2 cursor-default">Política de privacidade</span>
          </p>
        </div>
      </div>
    </div>
  )
}
