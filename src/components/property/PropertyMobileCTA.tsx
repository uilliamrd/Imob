"use client"

import { LeadCaptureForm } from "./LeadCaptureForm"

const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível", reserva: "Em Negociação", vendido: "Vendido",
}
const STATUS_COLOR: Record<string, string> = {
  disponivel: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  reserva: "text-amber-400 bg-amber-900/20 border-amber-700/40",
  vendido: "text-zinc-500 bg-zinc-800 border-zinc-700/40",
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

interface PropertyMobileCTAProps {
  price: number
  status: string
  propertyId: string
  propertySlug: string
  propertyTitle: string
  orgId: string | null
  orgWhatsapp: string
  refId?: string | null
}

export function PropertyMobileCTA({
  price, status, propertyId, propertySlug, propertyTitle, orgId, orgWhatsapp, refId,
}: PropertyMobileCTAProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3">
      <div className="flex items-center gap-3 mb-0">
        <div className="flex-1 min-w-0">
          <p className="font-serif text-xl font-bold text-foreground leading-none">{formatPrice(price)}</p>
          <p className={`text-[10px] mt-0.5 font-sans ${STATUS_COLOR[status] ?? ""} inline-flex px-1.5 py-0.5 rounded-full border`}>
            {STATUS_LABEL[status] ?? status}
          </p>
        </div>
        <div className="flex-shrink-0 w-48">
          <LeadCaptureForm
            propertyId={propertyId}
            propertySlug={propertySlug}
            propertyTitle={propertyTitle}
            orgId={orgId}
            orgWhatsapp={orgWhatsapp}
            refId={refId}
            source="imovel"
          />
        </div>
      </div>
    </div>
  )
}
