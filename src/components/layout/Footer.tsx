import Link from "next/link"

const LINKS = {
  plataforma: [
    { label: "Comprar",      href: "/?tab=comprar" },
    { label: "Alugar",       href: "/?tab=alugar" },
    { label: "Lançamentos",  href: "/?tab=lancamentos" },
    { label: "Mapa",         href: "/#mapa" },
    { label: "Blog",         href: "/blog" },
  ],
  empresas: [
    { label: "Anunciar imóvel",            href: "/dashboard" },
    { label: "Planos para imobiliárias",   href: "/dashboard/upgrade" },
    { label: "Planos para construtoras",   href: "/dashboard/upgrade" },
    { label: "Área do corretor",           href: "/dashboard" },
    { label: "API",                        href: "/api-docs" },
  ],
  institucional: [
    { label: "Sobre o Base Imob",      href: "/sobre" },
    { label: "Contato",                href: "/contato" },
    { label: "Termos de uso",          href: "/termos" },
    { label: "Política de privacidade", href: "/privacidade" },
    { label: "LGPD",                   href: "/lgpd" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-baseline gap-0 mb-3">
              <span className="font-serif text-2xl font-bold text-background">Base</span>
              <span className="font-serif text-2xl font-bold text-[var(--gold)]">Imob</span>
            </div>
            <p className="text-sm text-background/60 font-sans leading-relaxed max-w-xs">
              Onde imóveis, negócios e oportunidades se conectam.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { label: "Instagram", href: "#", abbr: "IG" },
                { label: "LinkedIn",  href: "#", abbr: "in" },
                { label: "Facebook",  href: "#", abbr: "f" },
              ].map(({ label, href, abbr }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background/10 hover:bg-[var(--gold)]/20 text-background/60 hover:text-[var(--gold)] transition-colors text-xs font-bold leading-none w-8 h-8 flex items-center justify-center"
                >
                  {abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-background/30 font-sans mb-4">Plataforma</p>
            <ul className="space-y-2.5">
              {LINKS.plataforma.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-[var(--gold)] transition-colors font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Para empresas */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-background/30 font-sans mb-4">Para empresas</p>
            <ul className="space-y-2.5">
              {LINKS.empresas.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-[var(--gold)] transition-colors font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-background/30 font-sans mb-4">Institucional</p>
            <ul className="space-y-2.5">
              {LINKS.institucional.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-background/60 hover:text-[var(--gold)] transition-colors font-sans">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-background/30 font-sans">
            © 2025 Base Imob. Todos os direitos reservados.
          </p>
          <p className="text-xs text-background/20 font-sans">
            Ecossistema imobiliário B2B2C
          </p>
        </div>
      </div>
    </footer>
  )
}
