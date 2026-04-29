import Link from "next/link"
import { Particles } from "@/components/magicui/particles"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center relative overflow-hidden">
      <Particles quantity={30} color="#C9A96E" />
      <div className="relative z-10 text-center px-6">
        <div className="divider-gold mb-10 mx-auto w-16" />
        <p className="text-xs uppercase tracking-[0.4em] text-gold/60 font-sans mb-4">Erro 404</p>
        <h1 className="font-serif text-7xl md:text-9xl font-bold text-white/10 mb-2">404</h1>
        <h2 className="font-serif text-3xl font-bold text-white mb-4">
          Página não encontrada
        </h2>
        <p className="text-white/40 font-sans mb-10 max-w-sm mx-auto leading-relaxed">
          O imóvel ou página que você procura pode ter sido removido ou o endereço está incorreto.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg"
          >
            Voltar ao Início
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 border border-white/10 text-white/60 hover:border-gold/40 hover:text-gold transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
