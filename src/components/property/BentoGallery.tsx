"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'

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
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[520px]">
        {/* Main large image - spans 2 cols and 2 rows */}
        <motion.button
          className="col-span-2 row-span-2 relative overflow-hidden rounded-xl group"
          onClick={() => setLightbox(0)}
          whileHover="hover"
        >
          <Image src={placeholders[0]} alt={title + ' - 1'} fill className="object-cover" />
          <motion.div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
          >
            <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
          </motion.div>
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

      {/* Lightbox */}
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
              className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X size={28} />
            </button>

            <button
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length) }}
            >
              <ChevronLeft size={36} />
            </button>

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={images[lightbox % images.length]}
              alt={title}
              className="max-w-[85vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length) }}
            >
              <ChevronRight size={36} />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-sm font-sans">
              {(lightbox % images.length) + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
