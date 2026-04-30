"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/lib/toast-context"
import { Eye, EyeOff, Lock, Save } from "lucide-react"

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const levels = [
    { label: "Muito fraca", color: "bg-red-500" },
    { label: "Fraca", color: "bg-orange-500" },
    { label: "Média", color: "bg-amber-500" },
    { label: "Forte", color: "bg-emerald-500" },
    { label: "Muito forte", color: "bg-emerald-600" },
  ]
  const level = levels[score] ?? levels[0]
  const textColor = score >= 3 ? "text-emerald-600" : score >= 2 ? "text-amber-600" : "text-red-500"

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? level.color : "bg-border"}`} />
        ))}
      </div>
      <p className={`text-xs font-sans ${textColor}`}>{level.label}</p>
    </div>
  )
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 px-4 py-3 pl-9 pr-10 rounded-lg font-sans text-sm focus:outline-none focus:border-[var(--gold)]/50 focus:ring-2 focus:ring-[var(--gold)]/20 transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={show ? "Ocultar senha" : "Ver senha"}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

export function PasswordChangeForm({ email }: { email: string }) {
  const { toast } = useToast()
  const [current, setCurrent] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPass.length < 8) {
      toast("A nova senha deve ter pelo menos 8 caracteres.", "error")
      return
    }
    if (newPass !== confirm) {
      toast("As senhas não coincidem.", "error")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    })

    if (signInError) {
      toast("Senha atual incorreta.", "error")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPass })

    if (updateError) {
      console.error("[PasswordChangeForm]", updateError)
      toast(updateError.message ?? "Erro ao alterar senha. Tente novamente.", "error")
    } else {
      toast("Senha alterada com sucesso!", "success")
      setCurrent("")
      setNewPass("")
      setConfirm("")
    }

    setLoading(false)
  }

  const canSubmit = current.length > 0 && newPass.length >= 8 && confirm.length > 0 && !loading

  return (
    <section className="bg-card border border-border rounded-2xl p-6 elevation-soft">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-5">
        <Lock size={15} className="text-[var(--gold)]" />
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">Alterar Senha</h2>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Por segurança, escolha uma senha forte.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans font-medium block mb-2">
            Senha Atual
          </label>
          <PasswordInput value={current} onChange={setCurrent} placeholder="Sua senha atual" />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans font-medium block mb-2">
            Nova Senha
          </label>
          <PasswordInput value={newPass} onChange={setNewPass} placeholder="Mínimo 8 caracteres" />
          <StrengthBar password={newPass} />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans font-medium block mb-2">
            Confirmar Nova Senha
          </label>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repita a nova senha" />
          {confirm.length > 0 && newPass !== confirm && (
            <p className="text-xs text-red-500 font-sans mt-1">As senhas não coincidem.</p>
          )}
          {confirm.length > 0 && newPass === confirm && (
            <p className="text-xs text-emerald-600 font-sans mt-1">Senhas conferem.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 mt-2 bg-[var(--gold)] text-[var(--graphite)] hover:bg-[var(--gold-light)] disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {loading ? "Alterando..." : "Alterar Senha"}
        </button>
      </form>
    </section>
  )
}
