"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronUp, User } from 'lucide-react'
import type { Profile } from '@/types/database'

const COOKIE_NAME = 'corretor_ref'
const COOKIE_DAYS = 30

function setCookie(value: string) {
  const expires = new Date()
  expires.setDate(expires.getDate() + COOKIE_DAYS)
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function getCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

interface CorretorMinisiteProps {
  defaultWhatsapp: string
  defaultName: string
  defaultPhoto?: string
}

function CorretorMinisiteInner({ defaultWhatsapp, defaultName, defaultPhoto }: CorretorMinisiteProps) {
  const searchParams = useSearchParams()
  const refId = searchParams.get('ref')

  const [corretor, setCorretor] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Persist ref in cookie; fall back to cookie when no URL param
  const [resolvedRef, setResolvedRef] = useState<string | null>(null)

  useEffect(() => {
    if (refId) {
      setCookie(refId)
      setResolvedRef(refId)
    } else {
      const saved = getCookie()
      if (saved) setResolvedRef(saved)
    }
  }, [refId])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!resolvedRef) return
    fetch('/api/corretor/' + resolvedRef)
      .then((r) => r.json())
      .then((data) => { if (data.id) setCorretor(data) })
      .catch(() => {})
  }, [resolvedRef])

  const name = corretor?.full_name ?? defaultName
  const photo = corretor?.avatar_url ?? defaultPhoto
  const whatsapp = corretor?.whatsapp ?? defaultWhatsapp
  const creci = corretor?.creci

  const whatsappUrl = 'https://wa.me/' + whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent('Olá! Tenho interesse em um imóvel.')

  // Don't show widget if there's no corretor reference at all
  if (!resolvedRef && !defaultWhatsapp) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-[#1a1a1a] border border-[rgba(201,169,110,0.2)] rounded-2xl p-6 w-72 shadow-2xl relative overflow-hidden"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    {photo ? (
                      <img src={photo} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-gold/40" />
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-gold/40 flex items-center justify-center bg-white/10">
                        <User size={24} className="text-gold/60" />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]" />
                  </div>
                  <div>
                    <p className="font-serif text-white font-semibold text-base">{name}</p>
                    <p className="text-xs text-gold/80 font-sans uppercase tracking-wider">Consultor Especialista</p>
                    {creci && <p className="text-[10px] text-white/30 font-sans mt-0.5">CRECI {creci}</p>}
                  </div>
                </div>

                <div className="divider-gold opacity-20 mb-4" />

                <p className="text-white/60 text-xs font-sans leading-relaxed mb-5">
                  Estou disponível para apresentar este imóvel e esclarecer todas as suas dúvidas.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-sans uppercase tracking-[0.15em] rounded-lg transition-colors duration-300"
                >
                  <MessageCircle size={16} />
                  Falar no WhatsApp
                </a>
              </motion.div>
            ) : (
              <motion.button
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsOpen(true)}
                className="bg-[#1a1a1a] border border-[rgba(201,169,110,0.2)] rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl hover:border-[rgba(201,169,110,0.5)] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="relative">
                  {photo ? (
                    <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover border border-gold/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center bg-white/5">
                      <User size={18} className="text-gold/60" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-[#1a1a1a]" />
                </div>
                <div className="text-left">
                  <p className="text-white/90 text-sm font-sans font-medium">{name}</p>
                  <p className="text-gold/60 text-[10px] uppercase tracking-wider">Online agora</p>
                </div>
                <ChevronUp size={14} className="text-white/30 group-hover:text-gold/60 transition-colors ml-1" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CorretorMinisite(props: CorretorMinisiteProps) {
  return (
    <Suspense fallback={null}>
      <CorretorMinisiteInner {...props} />
    </Suspense>
  )
}
