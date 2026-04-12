"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.")
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md px-6"
    >
      <div className="relative rounded-2xl p-10 bg-[#1a1a1a] border border-[rgba(201,169,110,0.25)]">
        <BorderBeam size={300} duration={10} />

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">
            RealState Intelligence
          </p>
          <h1 className="font-serif text-3xl font-bold text-white">
            Bem-vindo{" "}
            <AnimatedGradientText className="font-serif text-3xl font-bold italic">
              de volta
            </AnimatedGradientText>
          </h1>
          <div className="divider-gold mt-6 mx-auto w-16" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-sans text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={14} /> Entrar
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs font-sans mt-8">
          Não tem conta?{" "}
          <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
