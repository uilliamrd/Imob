import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="px-4 py-24" style={{ backgroundColor: "#31473A" }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] font-sans mb-4" style={{ color: "#C9A96E" }}>
          Oportunidade
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Sua próxima oportunidade<br />
          <em className="not-italic italic">começa aqui.</em>
        </h2>
        <p className="text-white/55 font-sans text-base max-w-lg mx-auto mb-10">
          Seja para encontrar o imóvel dos seus sonhos ou para anunciar com inteligência — estamos prontos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#buscar"
            className="px-8 py-4 text-xs uppercase tracking-[0.25em] font-sans font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "#C9A96E", color: "#0a0a0a" }}
          >
            Encontrar imóvel
          </Link>
          <Link
            href="/venda"
            className="px-8 py-4 border border-white/30 hover:border-white/60 text-white text-xs uppercase tracking-[0.25em] font-sans rounded-xl transition-all duration-200 hover:bg-white/5"
          >
            Anunciar imóvel
          </Link>
        </div>
      </div>
    </section>
  )
}
