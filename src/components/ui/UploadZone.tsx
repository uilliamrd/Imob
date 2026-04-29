"use client"

import { useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Loader2, GripVertical, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import * as tus from "tus-js-client"

export interface UploadedFile {
  id: string         // temp ID for tracking
  url: string        // final URL (card variant for images)
  assetId?: string   // DB asset ID (populated after processing)
  blurPlaceholder?: string
  status: "uploading" | "processing" | "ready" | "error"
  progress: number   // 0-100
  error?: string
  name: string
}

interface UploadZoneProps {
  bucket?: string
  folder?: string
  ownerType?: "property" | "organization" | "profile" | "development" | "pending"
  ownerId?: string
  tenantId?: string
  value: string[]
  onChange: (urls: string[]) => void
  onAssetsChange?: (assets: UploadedFile[]) => void
  maxFiles?: number
  acceptMime?: string   // e.g. "image/*" or "application/pdf"
  maxSizeMB?: number
  className?: string
  variant?: "card" | "detail" | "thumb"  // which size to return as primary URL
}

function FileItem({
  file,
  index,
  total,
  onRemove,
  onRetry,
  dragIndex,
  overIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  file: UploadedFile
  index: number
  total: number
  onRemove: () => void
  onRetry: () => void
  dragIndex: number | null
  overIndex: number | null
  onDragStart: (e: React.DragEvent, i: number) => void
  onDragOver: (e: React.DragEvent, i: number) => void
  onDrop: (e: React.DragEvent, i: number) => void
  onDragEnd: () => void
}) {
  const isFirst = index === 0
  const isDragging = dragIndex === index
  const isOver = overIndex === index

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      draggable={file.status === "ready"}
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, index)}
      onDragOver={(e) => onDragOver(e as unknown as React.DragEvent, index)}
      onDrop={(e) => onDrop(e as unknown as React.DragEvent, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden group border transition-all duration-150",
        file.status === "ready" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging   ? "opacity-40 border-gold/40 scale-95"            : "",
        isOver       ? "border-gold ring-1 ring-gold/40 scale-105"     : "",
        !isDragging && !isOver && file.status === "ready"  ? "border-white/10" : "",
        file.status === "error"  ? "border-red-500/40"                  : "",
        file.status === "uploading" || file.status === "processing" ? "border-white/10" : ""
      )}
    >
      {/* Preview image / placeholder */}
      {file.url ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-cover pointer-events-none"
          style={file.blurPlaceholder && file.status !== "ready" ? {
            backgroundImage: `url(${file.blurPlaceholder})`,
            backgroundSize: "cover",
          } : undefined}
        />
      ) : (
        <div className="w-full h-full bg-white/5 flex items-center justify-center">
          <Upload size={16} className="text-white/20" />
        </div>
      )}

      {/* Progress overlay */}
      {(file.status === "uploading" || file.status === "processing") && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
          <Loader2 size={16} className="text-gold animate-spin" />
          <p className="text-[9px] text-white/70 font-sans">
            {file.status === "uploading"
              ? `${file.progress}%`
              : "Otimizando…"}
          </p>
        </div>
      )}

      {/* Error overlay */}
      {file.status === "error" && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 p-1">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-[8px] text-white/70 font-sans text-center leading-tight line-clamp-2">
            {file.error ?? "Erro"}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-0.5 text-[8px] text-gold hover:underline font-sans"
          >
            <RefreshCw size={8} /> Tentar
          </button>
        </div>
      )}

      {/* Cover badge */}
      {isFirst && file.status === "ready" && (
        <span className="absolute bottom-1 left-1 text-[9px] bg-gold text-[#1C1C1C] px-1.5 py-0.5 rounded font-sans uppercase tracking-wider pointer-events-none">
          Capa
        </span>
      )}

      {/* Ready checkmark */}
      {file.status === "ready" && (
        <div className="absolute top-1 left-1">
          <CheckCircle2 size={12} className="text-green-400 drop-shadow" />
        </div>
      )}

      {/* Remove button */}
      {file.status !== "uploading" && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <X size={10} />
        </button>
      )}
    </motion.div>
  )
}

export function UploadZone({
  bucket = "property-images",
  folder = "",
  ownerType = "pending",
  ownerId,
  tenantId,
  value,
  onChange,
  onAssetsChange,
  maxFiles = 10,
  acceptMime = "image/*",
  maxSizeMB = 30,
  className,
  variant = "card",
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>(() =>
    value.map((url, i) => ({
      id: `existing-${i}`,
      url,
      status: "ready" as const,
      progress: 100,
      name: url.split("/").pop() ?? "imagem",
    }))
  )
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadRefs = useRef<Map<string, tus.Upload>>(new Map())

  const canUploadMore = files.filter(f => f.status !== "error").length < maxFiles

  // Update parent when files change
  const syncToParent = useCallback((updatedFiles: UploadedFile[]) => {
    const readyUrls = updatedFiles
      .filter(f => f.status === "ready" && f.url)
      .map(f => f.url)
    onChange(readyUrls)
    onAssetsChange?.(updatedFiles)
  }, [onChange, onAssetsChange])

  function updateFile(id: string, patch: Partial<UploadedFile>) {
    setFiles(prev => {
      const next = prev.map(f => f.id === id ? { ...f, ...patch } : f)
      syncToParent(next)
      return next
    })
  }

  async function processUploadedFile(
    tempFileId: string,
    storageKey: string,
    originalName: string,
    mimeType: string,
    fileSize: number,
    localPreviewUrl: string
  ) {
    if (!tenantId) {
      // No tenantId → just use the direct Supabase URL
      const supabase = createClient()
      const { data } = supabase.storage.from("uploads-temp").getPublicUrl(storageKey)
      updateFile(tempFileId, { url: data?.publicUrl ?? localPreviewUrl, status: "ready", progress: 100 })
      return
    }

    updateFile(tempFileId, { status: "processing", progress: 100 })

    try {
      const res = await fetch("/api/media/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey,
          originalName,
          mimeType,
          fileSize,
          tenantId,
          ownerType,
          ownerId: ownerId ?? undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro no processamento")

      const asset = json.asset
      // Pick the requested variant URL, falling back gracefully
      const variantUrl = asset.variants?.[variant]?.url
        ?? asset.variants?.card?.url
        ?? asset.variants?.full?.url
        ?? localPreviewUrl

      updateFile(tempFileId, {
        url: variantUrl,
        assetId: asset.id,
        blurPlaceholder: asset.variants?.blur_placeholder as string | undefined,
        status: "ready",
        progress: 100,
      })
    } catch (err) {
      updateFile(tempFileId, {
        status: "error",
        error: err instanceof Error ? err.message : "Erro no processamento",
      })
    }
  }

  async function uploadFileViaTUS(file: File): Promise<{ storageKey: string; mimeType: string }> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Sessão expirada")

    const ext = file.name.split(".").pop() ?? "bin"
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const storageKey = folder
      ? `${folder}/${timestamp}-${random}.${ext}`
      : `${timestamp}-${random}.${ext}`

    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "x-upsert": "false",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: "uploads-temp",
          objectName: storageKey,
          contentType: file.type,
          cacheControl: "3600",
        },
        chunkSize: 6 * 1024 * 1024,
        onError: (error) => reject(error),
        onProgress: (bytesUploaded, bytesTotal) => {
          const pct = Math.round((bytesUploaded / bytesTotal) * 90) // 0-90% for upload phase
          setFiles(prev => prev.map(f =>
            uploadRefs.current.has(f.id) ? { ...f, progress: pct } : f
          ))
        },
        onSuccess: () => resolve({ storageKey, mimeType: file.type }),
      })

      // Store ref for potential cancellation
      upload.start()

      // We'll match this upload to the file ID differently (via closure)
      // This is a simplified version; in production you'd track better
    })
  }

  async function handleFiles(rawFiles: FileList | File[]) {
    const fileArray = Array.from(rawFiles)
    const currentCount = files.filter(f => f.status !== "error").length
    if (currentCount + fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivo${maxFiles !== 1 ? "s" : ""} permitido${maxFiles !== 1 ? "s" : ""}.`)
      return
    }

    for (const file of fileArray) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`"${file.name}" excede o limite de ${maxSizeMB}MB.`)
        continue
      }

      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const localPreview = URL.createObjectURL(file)

      // Add to list with uploading status
      const newFile: UploadedFile = {
        id: tempId,
        url: localPreview,
        status: "uploading",
        progress: 0,
        name: file.name,
      }

      setFiles(prev => {
        const next = [...prev, newFile]
        return next
      })

      // Upload via TUS
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error("Sessão expirada")

        const ext = file.name.split(".").pop() ?? "bin"
        const storageKey = folder
          ? `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        await new Promise<void>((resolve, reject) => {
          const upload = new tus.Upload(file, {
            endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000],
            headers: {
              authorization: `Bearer ${session.access_token}`,
              "x-upsert": "false",
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            metadata: {
              bucketName: "uploads-temp",
              objectName: storageKey,
              contentType: file.type,
              cacheControl: "3600",
            },
            chunkSize: 6 * 1024 * 1024,
            onError: reject,
            onProgress: (bytesUploaded, bytesTotal) => {
              const pct = Math.round((bytesUploaded / bytesTotal) * 90)
              setFiles(prev => prev.map(f => f.id === tempId ? { ...f, progress: pct } : f))
            },
            onSuccess: () => {
              processUploadedFile(tempId, storageKey, file.name, file.type, file.size, localPreview)
              resolve()
            },
          })
          uploadRefs.current.set(tempId, upload)
          upload.start()
        })
      } catch (err) {
        updateFile(tempId, {
          status: "error",
          error: err instanceof Error ? err.message : "Falha no upload",
        })
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  function removeFile(id: string) {
    const upload = uploadRefs.current.get(id)
    if (upload) {
      upload.abort()
      uploadRefs.current.delete(id)
    }
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id)
      syncToParent(next)
      return next
    })
  }

  function retryFile(id: string) {
    // Just remove the errored file so user can re-add it
    removeFile(id)
  }

  // ── Reorder drag handlers ───────────────────────────────────────────────────
  function handleItemDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = "move"
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
    if (dragIndex !== null && dragIndex !== index) setOverIndex(index)
  }

  function handleItemDrop(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null); setOverIndex(null); return
    }
    const next = [...files]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    setFiles(next)
    syncToParent(next)
    setDragIndex(null); setOverIndex(null)
  }

  function handleItemDragEnd() {
    setDragIndex(null); setOverIndex(null)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      {canUploadMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all duration-300",
            dragOver
              ? "border-gold bg-gold/5 scale-[1.01]"
              : "border-white/10 hover:border-white/25"
          )}
        >
          <Upload size={22} className={dragOver ? "text-gold" : "text-white/30"} />
          <div className="text-center">
            <p className="text-white/60 text-sm font-sans">
              Clique ou arraste os arquivos aqui
            </p>
            <p className="text-white/20 text-xs font-sans mt-1">
              {acceptMime} · máx. {maxSizeMB}MB · até {maxFiles} arquivo{maxFiles !== 1 ? "s" : ""}
            </p>
            {tenantId && (
              <p className="text-white/10 text-[10px] font-sans mt-0.5">
                Otimização automática ativada
              </p>
            )}
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptMime}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Preview grid */}
      {files.length > 0 && (
        <>
          <p className="text-white/20 text-[11px] font-sans flex items-center gap-1">
            <GripVertical size={11} /> Arraste para reordenar · primeira é a capa
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <AnimatePresence>
              {files.map((file, i) => (
                <FileItem
                  key={file.id}
                  file={file}
                  index={i}
                  total={files.length}
                  onRemove={() => removeFile(file.id)}
                  onRetry={() => retryFile(file.id)}
                  dragIndex={dragIndex}
                  overIndex={overIndex}
                  onDragStart={handleItemDragStart}
                  onDragOver={handleItemDragOver}
                  onDrop={handleItemDrop}
                  onDragEnd={handleItemDragEnd}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
