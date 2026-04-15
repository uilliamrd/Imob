"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Expand, Images } from 'lucide-react'

interface BentoGalleryProps {
  images: string[]
  title: string
}

export function BentoGallery({ images, title }: BentoGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!images.length) {
    return (
      <div className="w-full aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground font-sans text-sm">Imagens em breve</span>
      </div>
    )
  }

  const placeholders = [...images]
  while (placeholders.length < 5) placeholders.push(images[0])

  return (
    <>
      {/* ── Mobile: single hero + scroll strip ──────────────────── */}
      <div className="lg:hidden">
        {/* Hero */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
          <Image src={images[0]} alt={title} fill className="object-cover" />
          <button
            onClick={() => setLightbox(0)}
            className="absolute inset-0 flex items-end justify-end p-3"
          >
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-sans px-3 py-1.5 rounded-full">
              <Images size={12} />
              {images.length} fotos
            </span>
          </button>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
            {images.slice(1).map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i + 1)}
                className="flex-shrink-0 w-16 h-16 relative rounded-xl overflow-hidden border-2 border-transparent hover:border-gold/40 transition-colors"
              >
                <Image src={src} alt={title} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: bento grid ──────────────────────────────────── */}
      <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[520px]">
        {/* Main large image */}
        <motion.button
          className="col-span-2 row-span-2 relative overflow-hidden rounded-xl group"
          onClick={() => setLightbox(0)}
          whileHover="hover"
        >
          <Image src={placeholders[0]} alt={title + ' - 1'} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
        </motion.button>

        {/* 4 smaller images */}
        {placeholders.slice(1, 5).map((src, i) => (
          <motion.button
            key={i}
            className="relative overflow-hidden rounded-xl group"
            onClick={() => setLightbox(i + 1)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Image src={src} alt={title + ' - ' + (i + 2)} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="font-serif text-white text-2xl font-semibold">+{images.length - 5}</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>

            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length) }}
            >
              <ChevronLeft size={32} />
            </button>

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={images[lightbox % images.length]}
              alt={title}
              className="max-w-[92vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length) }}
            >
              <ChevronRight size={32} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm font-sans">
              {(lightbox % images.length) + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
