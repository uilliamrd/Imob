import Link from "next/link"
import { ArrowRight, Building2, Users, BarChart3, Shield } from "lucide-react"

const FEATURES = [
  {
    icon: Building2,
    title: "Portfólio Centralizado",
    desc: "Construtoras e imobiliárias cadastram seus imóveis em um só lugar, com imagens, plantas e todas as informações técnicas.",
  },
  {
    icon: Users,
    title: "Corretores Especializados",
    desc: "Uma rede de corretores parceiros com minisites próprios, prontos para apresentar o imóvel certo para cada cliente.",
  },
  {
    icon: BarChart3,
    title: "Busca Inteligente",
    desc: "Filtre por tipo, categoria, cidade, dormitórios e preço para encontrar exatamente o que você procura.",
  },
  {
    icon: Shield,
    title: "Informação Verificada",
    desc: "Todos os imóveis listados aqui passam pela gestão das construtoras e imobiliárias parceiras.",
  },
]

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">Portal</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          Sobre o Portal
        </h1>
        <p className="text-muted-foreground font-sans text-base leading-relaxed max-w-2xl mx-auto">
          O RealState Intelligence é uma plataforma imobiliária de alto padrão que conecta construtoras, imobiliárias e corretores para apresentar imóveis de forma ágil, sofisticada e rastreável.
        </p>
        <div className="divider-gold mt-6 mx-auto w-16" />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
              <Icon size={18} className="text-gold" />
            </div>
            <h3 className="font-serif text-foreground text-base font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground font-sans text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-card border border-gold/20 rounded-xl p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-sans mb-3">Para Profissionais</p>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
          Faça parte da plataforma
        </h2>
        <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto mb-6">
          Corretores e imobiliárias podem criar uma conta, acessar o portfólio das construtoras parceiras e compartilhar imóveis com seus clientes via minisite rastreável.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
          >
            Acessar o Sistema <ArrowRight size={12} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground hover:border-gold/30 hover:text-gold transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
          >
            Ver Imóveis
          </Link>
        </div>
      </div>
    </div>
  )
}
