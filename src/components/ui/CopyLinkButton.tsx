"use client"

import { useState } from "react"
import { Check, Link2 } from "lucide-react"

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}${path}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-sans transition-colors ${
        copied ? "text-emerald-400" : "text-white/30 hover:text-gold"
      }`}
    >
      {copied ? <><Check size={12} /> Copiado</> : <><Link2 size={12} /> Copiar link</>}
    </button>
  )
}
