"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Check, Copy } from "lucide-react"

interface InviteTeamClientProps {
  orgId: string
}

export function InviteTeamClient({ orgId }: InviteTeamClientProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Direct-join link: when a user registers with this URL they get associated to the org
  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register?org=${orgId}`
    : ""

  async function handleInvite(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Look up the profile by email via Supabase admin (service role needed for auth lookup)
    // For now: show the invite link approach, which is always available
    const supabase = createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", email) // email as lookup key if stored
      .maybeSingle()

    if (!profile) {
      setError("Usuário não encontrado. Compartilhe o link de convite abaixo para convidar novas pessoas.")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ organization_id: orgId })
      .eq("id", profile.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setEmail("")
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  async function copyJoinUrl() {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
      <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
        Convidar Membro
      </h2>

      {/* Invite link */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans mb-2">
          Link de Convite
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 font-mono text-xs text-white/30 truncate">
            {joinUrl}
          </div>
          <button
            type="button"
            onClick={copyJoinUrl}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-lg text-xs font-sans uppercase tracking-wider transition-all duration-300 flex-shrink-0 ${
              copied
                ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-400"
                : "border-gold/30 text-gold hover:bg-gold/10"
            }`}
          >
            {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
        <p className="text-white/20 text-xs font-sans mt-2">
          Compartilhe este link. Quem se cadastrar via ele entrará automaticamente na sua equipe.
        </p>
      </div>

      <div className="divider-gold opacity-10" />

      {/* Add by user ID */}
      <form onSubmit={handleInvite}>
        <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-sans mb-2">
          Adicionar por ID de Usuário
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="UUID do usuário..."
            className="flex-1 bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-mono text-xs focus:outline-none focus:border-gold/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-40 transition-all text-xs font-sans uppercase tracking-wider rounded-lg flex-shrink-0"
          >
            {loading
              ? <span className="w-3 h-3 border border-graphite/30 border-t-graphite rounded-full animate-spin" />
              : success
              ? <><Check size={12} /> Adicionado</>
              : <><UserPlus size={12} /> Adicionar</>}
          </button>
        </div>
        {error && <p className="text-amber-400 text-xs font-sans mt-2">{error}</p>}
      </form>
    </div>
  )
}
