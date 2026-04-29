"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-4 py-2.5 border text-xs uppercase tracking-[0.15em] font-sans rounded-lg transition-all duration-300 ${
        copied
          ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-400"
          : "border-gold/30 text-gold hover:bg-gold/10"
      }`}
    >
      {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> {label}</>}
    </button>
  )
}
