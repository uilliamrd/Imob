# Prospecção automatizada — Imobisis/Imobimax

Script para descobrir imobiliárias em uma cidade, avaliar a maturidade
digital de cada uma (site + anúncios no Meta) e gerar uma lista priorizada
de leads para o time comercial (CRM Imobisis / agência Imobimax).

## Instalação

```bash
pip install -r requirements-prospectar.txt
playwright install chromium
```

## Uso

```bash
python prospectar.py --cidade "Capão da Canoa"
```

Opções:

| Flag | Descrição |
|---|---|
| `--cidade` (obrigatório) | Cidade a prospectar |
| `--max-resultados` | Limite de imobiliárias coletadas no Google Maps (padrão: 40) |
| `--pular-ads` | Pula a etapa da Meta Ads Library (mais rápido; `ads_score` fica neutro) |
| `--show-browser` | Roda o navegador em modo visível (útil para depurar seletores) |

## Como funciona

1. **Descoberta (Google Maps)** — busca `imobiliária em <cidade>`, rola o
   feed de resultados e extrai nome, endereço, telefone, categoria, site e
   link do Maps de cada estabelecimento.
2. **Análise de site** — para cada imobiliária com site: checa se carrega
   (status HTTP/timeout), HTTPS, viewport mobile e assinaturas de
   CRMs/widgets imobiliários conhecidos no HTML. Gera `site_score` (0-10;
   quanto pior o site, menor a nota = maior oportunidade). Sem site =
   `site_score = 0`.
3. **Meta Ads Library** — busca a imobiliária pelo nome na biblioteca
   pública de anúncios, conta anúncios ativos e estima a qualidade dos
   criativos (vídeo, CTA claro, volume). Gera `ads_score` (0-10; zero
   anúncios ativos = nota baixa = maior oportunidade).
4. **Classificação final** — combina os dois gaps priorizando quem tem
   deficiência em ambas as frentes, gera `score_final` (0-10, **maior =
   mais oportunidade**) e um `motivo` resumido, e ordena o CSV do maior
   para o menor `score_final`.

## Saída

CSV salvo em `output/<cidade-slugificada>_<data>.csv` com as colunas:
`title, street, phone, categoryName, url, website, site_score, ads_score,
score_final, motivo`.

## Observações

- Delays aleatórios são aplicados entre requisições (Maps, sites, Ads
  Library) para reduzir o risco de bloqueio.
- O DOM do Google Maps e da Meta Ads Library muda com frequência. Se a
  coleta começar a vir vazia ou incompleta, inspecione a página no
  DevTools e ajuste os seletores em `prospecting/maps_scraper.py` e
  `prospecting/ads_library.py`.
- Uma falha na consulta à Ads Library não interrompe o script: o lead
  recebe `ads_score` neutro (5.0) e o motivo sinaliza "não verificado",
  para não distorcer o ranking com um falso "zero anúncios".
