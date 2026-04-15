"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { Save, User } from "lucide-react"

interface ProfileFormProps {
  userId: string
  initialData: {
    full_name: string
    whatsapp: string
    creci: string
    bio: string
    avatar_url: string
  }
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialData.full_name)
  const [whatsapp, setWhatsapp] = useState(initialData.whatsapp)
  const [creci, setCreci] = useState(initialData.creci)
  const [bio, setBio] = useState(initialData.bio)
  const [avatarUrls, setAvatarUrls] = useState<string[]>(
    initialData.avatar_url ? [initialData.avatar_url] : []
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/profiles/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        whatsapp,
        creci,
        bio,
        avatar_url: avatarUrls[0] ?? null,
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Erro ao salvar")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    }
    setLoading(false)
  }

  const inputClass = "w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Avatar */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Foto de Perfil
        </h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-gold/20 overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
            {avatarUrls[0] ? (
              <Image src={avatarUrls[0]} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-white/20" />
            )}
          </div>
          <div className="flex-1">
            <ImageUpload
              bucket="avatar-photos"
              folder={userId}
              value={avatarUrls}
              onChange={(urls) => setAvatarUrls(urls.slice(-1))}
              maxFiles={1}
            />
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-semibold text-white border-b border-white/5 pb-4">
          Informações Pessoais
        </h2>

        <div>
          <label className={labelClass}>Nome Completo *</label>
          <input required type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="João Silva" className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input type="tel" value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+55 11 99999-9999" className={inputClass} />
            <p className="text-white/20 text-xs font-sans mt-1">
              Usado no minisite quando alguém acessar via seu link
            </p>
          </div>
          <div>
            <label className={labelClass}>CRECI</label>
            <input type="text" value={creci}
              onChange={(e) => setCreci(e.target.value)}
              placeholder="123456-F" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bio / Apresentação</label>
          <textarea value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Especialista em imóveis de alto padrão..."
            rows={3} className={inputClass + " resize-none"} />
        </div>
      </section>

      {error && (
        <p className="text-red-400 text-sm font-sans bg-red-900/10 px-4 py-3 rounded-lg">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-lg flex items-center justify-center gap-2 font-medium">
        {loading
          ? <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
          : saved
          ? "✓ Salvo com sucesso"
          : <><Save size={14} /> Salvar Configurações</>}
      </button>
    </form>
  )
}
