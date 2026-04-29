"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Loader2, GripVertical } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  bucket: string
  folder?: string
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  className?: string
}

export function ImageUpload({
  bucket,
  folder = "",
  value,
  onChange,
  maxFiles = 10,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (value.length + fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} imagens permitidas.`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) continue
      const ext = file.name.split(".").pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }

    onChange([...value, ...newUrls])
    setUploading(false)
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  // ── Reorder drag handlers ──────────────────────────────────────────────────
  function handleItemDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = "move"
    // Transparent drag image so the element stays visible
    const ghost = document.createElement("div")
    ghost.style.position = "absolute"
    ghost.style.top = "-9999px"
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  function handleItemDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragIndex !== null && dragIndex !== index) {
      setOverIndex(index)
    }
  }

  function handleItemDrop(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const next = [...value]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    onChange(next)
    setDragIndex(null)
    setOverIndex(null)
  }

  function handleItemDragEnd() {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading || value.length >= maxFiles}
        className={cn(
          "w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all duration-300",
          dragOver ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/25",
          (uploading || value.length >= maxFiles) && "opacity-40 cursor-not-allowed"
        )}
      >
        {uploading ? (
          <Loader2 size={24} className="text-gold animate-spin" />
        ) : (
          <Upload size={24} className="text-white/30" />
        )}
        <div className="text-center">
          <p className="text-white/60 text-sm font-sans">
            {uploading ? "Enviando..." : "Clique ou arraste as imagens aqui"}
          </p>
          <p className="text-white/20 text-xs font-sans mt-1">
            JPG, PNG, WEBP · máx. {maxFiles} imagens
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {/* Preview grid — draggable to reorder */}
      {value.length > 0 && (
        <>
          <p className="text-white/20 text-[11px] font-sans flex items-center gap-1">
            <GripVertical size={11} /> Arraste para reordenar · primeira imagem é a capa
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <AnimatePresence>
              {value.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e as unknown as React.DragEvent, i)}
                  onDragOver={(e) => handleItemDragOver(e as unknown as React.DragEvent, i)}
                  onDrop={(e) => handleItemDrop(e as unknown as React.DragEvent, i)}
                  onDragEnd={handleItemDragEnd}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden group border transition-all duration-150 cursor-grab active:cursor-grabbing",
                    dragIndex === i
                      ? "opacity-40 border-gold/40 scale-95"
                      : overIndex === i
                        ? "border-gold ring-1 ring-gold/40 scale-105"
                        : "border-white/10"
                  )}
                >
                  <img src={url} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] bg-gold text-graphite px-1.5 py-0.5 rounded font-sans uppercase tracking-wider pointer-events-none">
                      Capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
