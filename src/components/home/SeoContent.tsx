import Link from "next/link"
import { Building2, Home, Landmark, TreePine, Store, ChevronRight } from "lucide-react"

const SEO_CARDS = [
  {
    icon: Home,
    title: "Apartamentos à venda",
    description: "Studios, 2 e 3 dormitórios nas melhores localizações da cidade.",
    href: "/?tab=comprar&tipo=Apartamento",
  },
  {
    icon: Building2,
    title: "Lançamentos imobiliários",
    description: "Projetos na planta com condições exclusivas direto com a construtora.",
    href: "/?tab=lancamentos",
  },
  {
    icon: TreePine,
    title: "Casas em condomínio",
    description: "Segurança, lazer e privacidade para a sua família.",
    href: "/?tab=comprar&tipo=Casa",
  },
  {
    icon: Landmark,
    title: "Imóveis para alugar",
    description: "Apartamentos e casas disponíveis para locação residencial.",
    href: "/?tab=alugar",
  },
  {
    icon: Store,
    title: "Imóveis comerciais",
    description: "Salas, lojas e galpões para o seu negócio crescer.",
    href: "/?tab=comprar&tipo=Comercial",
  },
  {
    icon: Building2,
    title: "Coberturas e penthouses",
    description: "Os melhores imóveis de alto padrão com vistas privilegiadas.",
    href: "/?tab=comprar&tipo=Cobertura",
  },
]

export function SeoContent() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
        Explore por tipo de imóvel
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEO_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex items-start gap-4 bg-card rounded-xl p-5 border border-border hover:border-[var(--gold)]/40 hover:shadow-md transition-all duration-200"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] group-hover:bg-[var(--gold)]/20 transition-colors">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm leading-snug">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.description}</p>
              </div>
              <ChevronRight size={14} className="shrink-0 mt-0.5 text-muted-foreground/40 group-hover:text-[var(--gold)] transition-colors" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
