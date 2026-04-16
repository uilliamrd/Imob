"use client"

import { useState } from "react"
import { Download, Copy, Check, ImageDown, Loader2 } from "lucide-react"

interface PropertyActionsProps {
  images: string[]
  description: string | null
  title: string
}

async function downloadBlob(url: string, filename: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    // Fallback: open in new tab
    window.open(url, "_blank")
  }
}

export function PropertyActions({ images, description, title }: PropertyActionsProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function copyDescription() {
    if (!description) return
    await navigator.clipboard.writeText(description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadAllPhotos() {
    if (!images.length) return
    setDownloading(true)
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    for (let i = 0; i < images.length; i++) {
      await downloadBlob(images[i], `${slug}-foto-${i + 1}.jpg`)
      // Small delay between downloads to avoid browser throttling
      if (i < images.length - 1) await new Promise((r) => setTimeout(r, 300))
    }
    setDownloading(false)
  }

  if (!images.length && !description) return null

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6 mt-4">
      {images.length > 0 && (
        <button
          onClick={downloadAllPhotos}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all text-xs font-sans uppercase tracking-[0.12em] disabled:opacity-60 disabled:cursor-wait"
        >
          {downloading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <ImageDown size={12} />
          )}
          {downloading
            ? "Baixando..."
            : images.length === 1
            ? "Baixar Foto"
            : `Baixar ${images.length} Fotos`}
        </button>
      )}

      {description && (
        <button
          onClick={copyDescription}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all text-xs font-sans uppercase tracking-[0.12em]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copiar Descrição
            </>
          )}
        </button>
      )}

      {images.length > 1 && (
        <span className="text-muted-foreground/40 text-[10px] font-sans">
          {images.length} fotos disponíveis
        </span>
      )}
    </div>
  )
}

// Minimal variant for use inside the dashboard vitrine cards
export function CopyDescriptionButton({ description }: { description: string | null }) {
  const [copied, setCopied] = useState(false)
  if (!description) return null

  async function copy() {
    await navigator.clipboard.writeText(description!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[10px] font-sans text-muted-foreground hover:text-gold transition-colors"
    >
      {copied ? <Check size={9} className="text-emerald-500" /> : <Copy size={9} />}
      {copied ? "Copiado" : "Copiar descrição"}
    </button>
  )
}

export function DownloadPhotosButton({ images, title }: { images: string[]; title: string }) {
  const [downloading, setDownloading] = useState(false)
  if (!images.length) return null

  async function dl() {
    setDownloading(true)
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    for (let i = 0; i < images.length; i++) {
      await downloadBlob(images[i], `${slug}-foto-${i + 1}.jpg`)
      if (i < images.length - 1) await new Promise((r) => setTimeout(r, 300))
    }
    setDownloading(false)
  }

  return (
    <button
      onClick={dl}
      disabled={downloading}
      className="flex items-center gap-1 text-[10px] font-sans text-muted-foreground hover:text-gold transition-colors disabled:opacity-50"
    >
      {downloading ? <Loader2 size={9} className="animate-spin" /> : <Download size={9} />}
      {downloading ? "Baixando..." : `${images.length} foto${images.length > 1 ? "s" : ""}`}
    </button>
  )
}
