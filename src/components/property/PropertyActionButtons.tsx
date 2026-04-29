"use client"

import { useState } from "react"
import { Heart, Share2, Check } from "lucide-react"

interface Props {
  title: string
  slug: string
}

export function PropertyActionButtons({ title, slug }: Props) {
  const [shared, setShared] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => null)
    } else {
      await navigator.clipboard.writeText(url).catch(() => null)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2 mb-4 lg:mb-6">
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 transition-all text-xs font-sans"
      >
        <Heart size={13} /> Favoritar
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all text-xs font-sans"
      >
        {shared ? <><Check size={13} className="text-emerald-500" /> Copiado!</> : <><Share2 size={13} /> Compartilhar</>}
      </button>
    </div>
  )
}
