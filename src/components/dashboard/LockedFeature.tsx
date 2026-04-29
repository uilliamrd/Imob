import { Lock, Zap } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface LockedFeatureProps {
  title: string
  description: string
  planName?: string
  icon?: LucideIcon
  className?: string
}

export function LockedFeature({ title, description, planName, icon: Icon = Lock, className = "" }: LockedFeatureProps) {
  return (
    <div className={`px-4 py-6 lg:p-8 ${className}`}>
      <div className="max-w-lg mx-auto mt-12 text-center">
        {/* Icon glow */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gold/20 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
            <Icon size={28} className="text-gold" />
          </div>
        </div>

        <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-3">{title}</h2>

        <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-sm mx-auto mb-8">
          {planName ? (
            <>
              Seu plano atual (<strong className="text-foreground/70">{planName}</strong>) não inclui esta funcionalidade.{" "}
              {description}
            </>
          ) : description}
        </p>

        {/* Ghost feature cards */}
        <div className="grid grid-cols-3 gap-2 mb-8 opacity-25 pointer-events-none select-none">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border" />
          ))}
        </div>

        <Link
          href="/dashboard/upgrade"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-[#0F0F0F] hover:bg-gold-light transition-all duration-200 text-[11px] uppercase tracking-[0.2em] font-sans rounded-xl font-medium shadow-lg shadow-gold/20"
        >
          <Zap size={13} />
          Ver planos e fazer upgrade
        </Link>

        <p className="mt-4 text-muted-foreground/40 text-[11px] font-sans">
          Entre em contato pelo WhatsApp para solicitar a mudança de plano.
        </p>
      </div>
    </div>
  )
}
