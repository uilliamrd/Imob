import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <div className="divider-gold mb-12 mx-auto w-20" />
        <p className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-6">
          RealState Intelligence
        </p>
        <h1 className="font-serif text-5xl font-bold text-foreground mb-6">
          Plataforma Imobiliária
          <span className="block italic text-gradient-gold">de Alto Padrão</span>
        </h1>
        <div className="divider-gold my-8 mx-auto w-16" />
        <div className="flex gap-4 justify-center">
          <Link
            href="/construtora/meridian"
            className="px-8 py-3 bg-graphite text-offwhite hover:bg-gold hover:text-graphite transition-all duration-500 text-xs uppercase tracking-[0.2em] font-sans"
          >
            Demo Construtora
          </Link>
          <Link
            href="/imovel/torre-a-apt-1201"
            className="px-8 py-3 border border-border text-foreground hover:border-gold hover:text-gold transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans"
          >
            Demo Imóvel
          </Link>
        </div>
      </div>
    </main>
  )
}
