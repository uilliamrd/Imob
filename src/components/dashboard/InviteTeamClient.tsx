"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Check, Copy, Search, User, X } from "lucide-react"
import { searchProfiles } from "@/app/actions/searchProfiles"
import type { ProfileResult } from "@/app/actions/searchProfiles"

interface InviteTeamClientProps {
  orgId: string
}

export function InviteTeamClient({ orgId }: InviteTeamClientProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProfileResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register?org=${orgId}`
    : ""

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await searchProfiles(query)
      setResults(res)
      setSearching(false)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function addToOrg(profile: ProfileResult) {
    setAdding(profile.id)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from("profiles")
      .update({ organization_id: orgId })
      .eq("id", profile.id)
    if (err) {
      setError(err.message)
    } else {
      setAddedIds((prev) => new Set([...prev, profile.id]))
      setResults((prev) => prev.filter((p) => p.id !== profile.id))
    }
    setAdding(null)
  }

  async function copyJoinUrl() {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <h2 className="font-serif text-lg font-semibold text-white border-b border-border pb-4">
        Convidar Membro
      </h2>

      {/* Invite link */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans mb-2">
          Link de Convite
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-xs text-muted-foreground truncate">
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
        <p className="text-muted-foreground/50 text-xs font-sans mt-2">
          Compartilhe este link. Quem se cadastrar via ele entrará automaticamente na sua equipe.
        </p>
      </div>

      <div className="divider-gold opacity-10" />

      {/* Search by name/CRECI */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans mb-2">
          Buscar Corretor por Nome ou CRECI
        </p>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou CRECI do corretor..."
            className="w-full bg-muted/50 border border-border text-white placeholder-muted-foreground/40 pl-10 pr-10 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Results */}
        {(results.length > 0 || (searching && query)) && (
          <div className="mt-2 border border-border rounded-xl overflow-hidden">
            {searching && (
              <div className="px-4 py-3 text-muted-foreground/50 text-xs font-sans">Buscando...</div>
            )}
            {results.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] border-b border-border/50 last:border-0 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.avatar_url
                    ? <Image src={p.avatar_url} alt={p.full_name ?? ""} width={32} height={32} className="object-cover" />
                    : <User size={14} className="text-muted-foreground/40" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground/80 text-sm font-sans font-medium truncate">{p.full_name ?? "Sem nome"}</p>
                  {p.creci && <p className="text-muted-foreground/60 text-xs font-sans">CRECI {p.creci}</p>}
                </div>
                <button
                  onClick={() => addToOrg(p)}
                  disabled={adding === p.id || addedIds.has(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold hover:bg-gold hover:text-graphite border border-gold/30 disabled:opacity-40 transition-all text-xs font-sans uppercase tracking-wider rounded-lg flex-shrink-0"
                >
                  {adding === p.id
                    ? <span className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                    : addedIds.has(p.id)
                    ? <><Check size={11} /> Adicionado</>
                    : <><UserPlus size={11} /> Adicionar</>
                  }
                </button>
              </div>
            ))}
            {!searching && results.length === 0 && query && (
              <div className="px-4 py-3 text-muted-foreground/50 text-xs font-sans">
                Nenhum corretor sem organização encontrado.
              </div>
            )}
          </div>
        )}

        {error && <p className="text-amber-400 text-xs font-sans mt-2">{error}</p>}
      </div>
    </div>
  )
}
