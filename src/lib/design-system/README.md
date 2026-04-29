# Design System — RealState Intelligence

**Diretriz visual:** Marketplace Premium  
70 % Airbnb · 20 % QuintoAndar · 10 % luxo editorial

---

## Tokens

Todos os tokens vivem em `src/app/globals.css` via `@theme inline` (Tailwind v4).

| Token CSS | Valor (light) | Uso |
|---|---|---|
| `--forest` | `#2D4A3E` | CTA principal, botões primários |
| `--forest-foreground` | `#F5F0E8` | Texto sobre forest |
| `--surface` | `#EDE8DF` | Fundos de seção, chips, icon-pills |
| `--gold` | `#C9A96E` | Acento premium (use com moderação) |
| `--gold-light` | `#E0C896` | Gradiente gold início |
| `--gold-dark` | `#A8834A` | Gradiente gold fim, ícones |
| `--background` | `#F5F0E8` | Base da página |
| `--card` | `#FDFAF4` | Cartões, sidebars, popovers |
| `--muted` | `#EDE8DF` | Fundos suaves |
| `--border` | `#DDD5C8` | Bordas padrão |

### Sombras

```css
--shadow-soft:    /* 1px — botões, inputs */
--shadow-card:    /* 4px — cards, panels */
--shadow-premium: /* 8px — modais, cards em hover */
```

Classes utilitárias: `.elevation-soft` · `.elevation-card` · `.elevation-premium`

---

## Motion

`src/lib/design-system/motion.ts`

```ts
import { fadeUpVariants, hoverEffects, transitions } from "@/lib/design-system/motion"

// Transition presets
transitions.snappy   // botões, chips
transitions.smooth   // painéis, cartões
transitions.editorial // hero, modais
transitions.fade     // opacity

// Variant presets
fadeVariants
fadeUpVariants       // fade + sobe (card entrances)
fadeDownVariants     // fade + desce (dropdowns)
scaleVariants        // scale in (modais)
staggerContainerVariants + listItemVariants  // listas animadas

// Hover helpers (spread direto no motion.*)
hoverEffects.lift    // cards: translateY(-2px) + shadow upgrade
hoverEffects.scale   // botões: scale pop
hoverEffects.glow    // icon buttons: brightness
```

---

## Variants (class-variance-authority)

`src/lib/design-system/variants.ts`

```ts
import { buttonVariants, badgeVariants, iconSizes, sectionSpacing, container } from "@/lib/design-system/variants"
```

### buttonVariants

| variant | uso |
|---|---|
| `primary` | Ação principal — forest fill |
| `gold` | CTA premium — gradiente gold |
| `outline` | Secundário com borda forest |
| `ghost` | Terciário sem borda |
| `destructive` | Ações destrutivas |
| `secondary` | Neutro |

Tamanhos: `xs` · `sm` · `md` (default) · `lg` · `xl` · `icon`

### badgeVariants

| variant | uso |
|---|---|
| `gold` | Status premium (usa `.badge-premium`) |
| `forest` | Tipo de negócio (Venda / Aluguel) |
| `outline` | Genérico |
| `muted` | Rótulo neutro |
| `destructive` | Erro / cancelado |
| `success` | Aprovado / ativo |
| `warning` | Pendente / atenção |

---

## Componentes Premium

Importar de `@/components/ui/premium`.

### `<SectionWrapper>`
Seção animada com `whileInView`. Props: `animate`, `spacing` (tight/normal/loose).

### `<SectionHeader>`
Cabeçalho de seção com icon-pill dourada, título serif, descrição e slot de ação.

### `<PremiumButton>`
Wrapper animado de `<button>` com suporte a `variant`, `size`, `icon`, `iconRight`, `loading`.

### `<PremiumBadge>`
Badge com todas as variantes do `badgeVariants`. Aceita `icon`.

### `<PropertyCard>`
Cartão de imóvel completo: imagem, badges sobrepostos, título serif, localização, stats (quartos/vagas/área), preço formatado. Suporte a `blur` de placeholder via Next/Image.

### `<StatsBar>`
Grid ou row de métricas animadas (stagger). Cada item aceita `label`, `value`, `icon`, `trend` e `accent`.

### `<EmptyState>`
Estado vazio centralizado com icon-pill, título, descrição e slot de ação. Variante `compact`.

### `<SkeletonCard>` / `<SkeletonGrid>`
Placeholders de carregamento usando `.skeleton-luxury` (shimmer gold). `SkeletonGrid` aceita `count` e renderiza N cards.

### `<IntentChip>` / `<IntentChipGroup>`
Chips de filtro single-select. Estado `active` usa forest fill. `IntentChipGroup` gerencia seleção via `value`/`onChange`.

---

## Utilitários CSS (globals.css)

```css
.elevation-soft       /* box-shadow suave */
.elevation-card       /* box-shadow de card */
.elevation-premium    /* box-shadow premium */
.hover-lift           /* translateY(-2px) + shadow no hover */
.border-gold-subtle   /* border rgba(gold, 0.3) */
.bg-surface           /* background var(--surface) */
.badge-premium        /* pill gradiente gold */
.line-clamp-2         /* truncate em 2 linhas */
.line-clamp-3         /* truncate em 3 linhas */
.skeleton-luxury      /* shimmer gold animado */
.divider-gold         /* linha gold degradê */
.glass-card           /* glassmorphism light */
.text-gradient-gold   /* texto degradê gold */
.force-light          /* força tokens light em containers escuros */
.scrollbar-none       /* esconde scrollbar */
.safe-bottom          /* padding iOS safe area */
```

---

## Regras de uso

1. **Gold é acento** — nunca usar como cor de fundo de página inteira; reservado para badges premium, dividers e CTAs de upsell.
2. **Forest é primário** — todos os botões de ação principal e estados ativos usam `--forest`.
3. **Tipografia** — títulos de página: `font-serif` (Playfair Display). Corpo: `font-sans` (Inter).
4. **Sombras por camada** — `elevation-soft` para inputs/badges, `elevation-card` para cards em repouso, `elevation-premium` para hover ou modais.
5. **Animações** — `transitions.snappy` para feedback imediato (≤ 200 ms); `transitions.smooth` para entradas de painel; nunca animar layout crítico.
6. **Ícones** — exclusivamente Lucide, `strokeWidth={1.75}`, tamanho via `iconSizes`.
