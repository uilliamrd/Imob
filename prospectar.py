#!/usr/bin/env python3
"""Prospecção automatizada de imobiliárias — Imobisis/Imobimax.

Dado o nome de uma cidade, descobre imobiliárias no Google Maps, avalia o
site e a atividade de anúncios no Meta Ads Library de cada uma, e gera um
CSV com uma lista priorizada de leads (maior oportunidade primeiro).

Uso:
    python prospectar.py --cidade "Capão da Canoa"

Antes de rodar, instale as dependências e o navegador do Playwright:
    pip install -r requirements-prospectar.txt
    playwright install chromium
"""

import argparse
import sys

from playwright.sync_api import sync_playwright

from prospecting.ads_library import analyze_ads
from prospecting.config import DELAY_BETWEEN_ADS_CHECKS, DELAY_BETWEEN_SITE_CHECKS, MAPS_MAX_RESULTS_DEFAULT
from prospecting.csv_writer import write_csv
from prospecting.maps_scraper import discover_agencies
from prospecting.models import AdsAnalysis, LeadResult
from prospecting.scoring import compute_final
from prospecting.site_analyzer import analyze_site
from prospecting.utils import random_delay
from prospecting.xlsx_writer import write_xlsx


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prospecção automatizada de imobiliárias para Imobisis/Imobimax.",
    )
    parser.add_argument("--cidade", required=True, help='Cidade a prospectar, ex: "Capão da Canoa"')
    parser.add_argument(
        "--max-resultados",
        type=int,
        default=MAPS_MAX_RESULTS_DEFAULT,
        help=f"Número máximo de imobiliárias a coletar no Google Maps (padrão: {MAPS_MAX_RESULTS_DEFAULT})",
    )
    parser.add_argument(
        "--pular-ads",
        action="store_true",
        help="Pula a consulta à Meta Ads Library (mais rápido; ads_score fica neutro/5.0 para todos)",
    )
    parser.add_argument(
        "--show-browser",
        action="store_true",
        help="Roda o navegador em modo visível, útil para depurar seletores",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.show_browser)
        try:
            print(f'[1/4] Buscando imobiliárias em "{args.cidade}" no Google Maps...')
            agencies = discover_agencies(args.cidade, max_results=args.max_resultados, browser=browser)
            print(f"      -> {len(agencies)} imobiliária(s) encontrada(s)")

            if not agencies:
                print("Nenhuma imobiliária encontrada. Encerrando.")
                sys.exit(0)

            print("[2/4] Analisando sites...")
            site_analyses = []
            for i, agency in enumerate(agencies, start=1):
                print(f"      ({i}/{len(agencies)}) {agency.title}")
                site_analyses.append(analyze_site(agency.website))
                random_delay(DELAY_BETWEEN_SITE_CHECKS)

            print("[3/4] Consultando Meta Ads Library...")
            ads_analyses = []
            for i, agency in enumerate(agencies, start=1):
                if args.pular_ads:
                    ads_analyses.append(AdsAnalysis(ads_score=5.0, notes=["etapa pulada (--pular-ads)"]))
                    continue
                print(f"      ({i}/{len(agencies)}) {agency.title}")
                ads_analyses.append(analyze_ads(agency.title, browser=browser))
                random_delay(DELAY_BETWEEN_ADS_CHECKS)

            print("[4/4] Calculando pontuação final e gerando planilha...")
            results = []
            for agency, site, ads in zip(agencies, site_analyses, ads_analyses):
                score_final, motivo = compute_final(site, ads)
                results.append(LeadResult(agency=agency, site=site, ads=ads, score_final=score_final, motivo=motivo))

            results.sort(key=lambda r: r.score_final, reverse=True)

            csv_path = write_csv(args.cidade, results)
            xlsx_path = write_xlsx(args.cidade, results)
            print(f"\nConcluído.\nPlanilha (.xlsx): {xlsx_path}\nCSV: {csv_path}")
        finally:
            browser.close()


if __name__ == "__main__":
    main()
