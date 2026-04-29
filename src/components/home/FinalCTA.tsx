import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/design-system/variants"

export function FinalCTA() {
  return (
    <section className="bg-foreground text-background">
      <div className="divider-gold" />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] font-sans mb-4">
          Para corretores e imobiliárias
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-background leading-tight">
          Anuncie seus imóveis para milhares de compradores
        </h2>
        <p className="mt-4 text-base text-background/60 font-sans max-w-xl mx-auto">
          Planos para corretores autônomos, imobiliárias e construtoras. Comece grátis, escale quando precisar.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "gold", size: "lg" }),
            )}
          >
            Anunciar imóvel
          </Link>
          <Link
            href="/dashboard/upgrade"
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium border border-background/20 text-background/80 hover:bg-background/10 hover:text-background transition-colors duration-200"
            )}
          >
            Ver planos
          </Link>
          <Link
            href="/sobre"
            className="text-sm font-medium text-background/40 hover:text-background/70 transition-colors"
          >
            Saiba mais →
          </Link>
        </div>
      </div>
    </section>
  )
}
