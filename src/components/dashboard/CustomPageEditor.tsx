"use client"

import { useState, useRef } from "react"
import { Code2, Upload, X, Eye, FileJson, FileCode, AlertTriangle } from "lucide-react"

interface CustomPageEditorProps {
  value: string
  type: "html" | "json" | null
  onChange: (value: string, type: "html" | "json" | null) => void
}

export function CustomPageEditor({ value, type, onChange }: CustomPageEditorProps) {
  const [preview, setPreview] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const detectedType = ext === "json" ? "json" : ext === "html" || ext === "htm" ? "html" : null
    if (!detectedType) {
      alert("Apenas arquivos .html ou .json são aceitos.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(e.target?.result as string, detectedType)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function clear() {
    onChange("", null)
    setPreview(false)
  }

  const hasContent = !!value

  return (
    <div className="space-y-3">
      {!hasContent ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-white/10 hover:border-gold/30 rounded-xl p-8 text-center transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={24} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm font-sans">Clique ou arraste um arquivo <strong>.html</strong> ou <strong>.json</strong></p>
          <p className="text-white/20 text-xs font-sans mt-1">O conteúdo substituirá o layout padrão do lançamento</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-gold/20 rounded-xl p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === "json"
                ? <FileJson size={16} className="text-blue-400" />
                : <FileCode size={16} className="text-amber-400" />}
              <span className="text-white/70 text-sm font-sans font-medium">
                Página customizada ({type?.toUpperCase()})
              </span>
              <span className="text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-700/30 px-2 py-0.5 rounded-full font-sans uppercase tracking-wide">
                ativa
              </span>
            </div>
            <div className="flex items-center gap-2">
              {type === "html" && (
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-1.5 text-xs font-sans text-white/30 hover:text-gold transition-colors"
                >
                  <Eye size={12} /> {preview ? "Fechar" : "Pré-visualizar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-sans text-white/30 hover:text-gold transition-colors"
              >
                <Upload size={12} /> Trocar
              </button>
              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-1.5 text-xs font-sans text-white/20 hover:text-red-400 transition-colors"
              >
                <X size={12} /> Remover
              </button>
            </div>
          </div>

          {/* Code preview (truncated) */}
          {!preview && (
            <pre className="text-[11px] font-mono text-white/30 bg-black/30 rounded-lg p-3 overflow-hidden max-h-24 leading-relaxed">
              {value.slice(0, 400)}{value.length > 400 ? "\n…" : ""}
            </pre>
          )}

          {/* HTML preview iframe */}
          {preview && type === "html" && (
            <div className="rounded-lg overflow-hidden border border-white/10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border-b border-white/5">
                <AlertTriangle size={11} className="text-amber-400" />
                <span className="text-[10px] font-sans text-white/30">Pré-visualização — estilos externos podem não carregar</span>
              </div>
              <iframe
                srcDoc={value}
                className="w-full h-96 bg-white"
                sandbox="allow-scripts"
                title="Pré-visualização da página customizada"
              />
            </div>
          )}
        </div>
      )}

      {/* Paste area (textarea fallback) */}
      {!hasContent && (
        <div>
          <p className="text-white/20 text-xs font-sans mb-1.5">Ou cole o conteúdo diretamente:</p>
          <textarea
            rows={4}
            placeholder="<html>...</html>  ou  { ... }"
            className="w-full bg-[#111] border border-white/10 text-white/60 placeholder-white/15 px-3 py-2.5 rounded-lg font-mono text-xs focus:outline-none focus:border-gold/50 transition-colors resize-none"
            onChange={(e) => {
              const v = e.target.value.trim()
              if (!v) return
              const detectedType = v.startsWith("{") || v.startsWith("[") ? "json" : "html"
              onChange(v, detectedType)
            }}
          />
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".html,.htm,.json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
