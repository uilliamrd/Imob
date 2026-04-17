"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Phone, User, ArrowRight } from "lucide-react"

const COOKIE_NAME = "corretor_ref"

function getCorretorRef(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get("ref")
  if (fromUrl) return fromUrl
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

interface LeadCaptureFormProps {
  propertyId: string
  propertySlug: string
  propertyTitle: string
  orgId: string | null
  orgWhatsapp: string
  refId?: string | null
  source?: "imovel" | "minisite" | "selecao"
}

function formatWhatsappNumber(raw: string) {
  return raw.replace(/\D/g, "")
}

export function LeadCaptureForm({
  propertyId,
  propertySlug,
  propertyTitle,
  orgId,
  orgWhatsapp,
  refId,
  source,
}: LeadCaptureFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  // Resolve corretor WhatsApp from ref param or cookie — overrides orgWhatsapp
  const [resolvedWhatsapp, setResolvedWhatsapp] = useState(orgWhatsapp)
  const [resolvedRefId, setResolvedRefId] = useState(refId ?? null)

  useEffect(() => {
    const ref = getCorretorRef()
    if (!ref) return
    setResolvedRefId(ref)
    fetch(`/api/corretor/${ref}`)
      .then((r) => r.json())
      .then((data) => { if (data?.whatsapp) setResolvedWhatsapp(data.whatsapp) })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          property_id: propertyId,
          property_slug: propertySlug,
          ref_id: resolvedRefId ?? null,
          org_id: orgId,
          source: source ?? (resolvedRefId ? "minisite" : "imovel"),
        }),
      })
    } catch {
      // silently continue — still open WhatsApp
    }

    setSent(true)
    setLoading(false)

    const whatsappNumber = formatWhatsappNumber(resolvedWhatsapp)
    const msg = encodeURIComponent(
      `Olá! Me chamo ${name.trim()} e tenho interesse no imóvel: ${propertyTitle}.`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-full py-4 bg-[#1C1C1C] text-[#F5F0E8] hover:bg-[#C9A96E] hover:text-[#1C1C1C] transition-all duration-500 text-xs uppercase tracking-[0.2em] font-sans rounded-xl mb-3"
      >
        Solicitar Informações
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
            >
              <div className="force-light bg-[#fdf8f2] border border-[rgba(201,169,110,0.3)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md shadow-2xl pointer-events-auto relative max-h-[92dvh] overflow-y-auto">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>

                {sent ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                      Redirecionando...
                    </h3>
                    <p className="text-muted-foreground text-sm font-sans">
                      Abrindo WhatsApp com seu contato pré-preenchido.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold font-sans mb-1">
                        Solicitar informações
                      </p>
                      <h3 className="font-serif text-2xl font-bold text-foreground">
                        {propertyTitle}
                      </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                          Seu nome
                        </label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Nome completo"
                            className="w-full bg-card border border-border text-foreground placeholder-muted-foreground/50 pl-9 pr-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                          WhatsApp / Telefone
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="(21) 99999-9999"
                            className="w-full bg-card border border-border text-foreground placeholder-muted-foreground/50 pl-9 pr-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/60 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !name.trim() || !phone.trim()}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#1C1C1C] text-[#F5F0E8] hover:bg-[#C9A96E] hover:text-[#1C1C1C] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-500 text-xs uppercase tracking-[0.2em] font-sans rounded-xl mt-2"
                      >
                        {loading ? (
                          "Aguarde..."
                        ) : (
                          <>
                            <MessageCircle size={14} />
                            Falar no WhatsApp
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[11px] text-muted-foreground/60 font-sans text-center mt-4">
                      Seus dados são usados apenas para contato sobre este imóvel.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
