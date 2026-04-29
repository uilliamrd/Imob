"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Link2, MessageCircle, Mail, Check, X } from "lucide-react"

interface PropertyShareProps {
  userId: string
  propertySlug: string
  propertyTitle: string
}

export function PropertyShare({ userId, propertySlug, propertyTitle }: PropertyShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function shareUrl() {
    return `${window.location.origin}/imovel/${propertySlug}?ref=${userId}`
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function shareWhatsapp() {
    const url = shareUrl()
    const msg = encodeURIComponent(`${propertyTitle}\n\n${url}`)
    window.open(`https://wa.me/?text=${msg}`, "_blank")
  }

  function shareEmail() {
    const url = shareUrl()
    const subject = encodeURIComponent(`Imóvel: ${propertyTitle}`)
    const body = encodeURIComponent(`Olá,\n\nConfira este imóvel:\n${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center gap-2 w-full py-3 bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-foreground transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-xl"
      >
        <Share2 size={13} />
        Compartilhar
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 left-0 right-0 force-light bg-[#fdf8f2] border border-[rgba(201,169,110,0.35)] rounded-xl p-3 shadow-xl z-20"
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">
                  Compartilhar com indicação
                </p>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-black/5 transition-colors text-left"
                >
                  {copied
                    ? <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    : <Link2 size={14} className="text-gold flex-shrink-0" />}
                  <span className="text-sm font-sans text-foreground">
                    {copied ? "Link copiado!" : "Copiar link de indicação"}
                  </span>
                </button>

                <button
                  onClick={shareWhatsapp}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-black/5 transition-colors text-left"
                >
                  <MessageCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-sans text-foreground">Enviar pelo WhatsApp</span>
                </button>

                <button
                  onClick={shareEmail}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-black/5 transition-colors text-left"
                >
                  <Mail size={14} className="text-gold/70 flex-shrink-0" />
                  <span className="text-sm font-sans text-foreground">Enviar por e-mail</span>
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground/50 font-sans mt-3 border-t border-border pt-2.5">
                O link inclui sua identificação como corretor indicador.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
