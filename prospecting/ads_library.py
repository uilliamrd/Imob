"""Etapa 3 — Consulta à Meta Ads Library (facebook.com/ads/library).

Assim como o Google Maps, a Ads Library é uma página pública que carrega o
conteúdo via JS e não expõe uma API estável e gratuita para esse tipo de
busca — por isso usamos Playwright e tratamos a extração como best-effort.
Se a consulta falhar (timeout, mudança de layout, bloqueio), devolvemos um
resultado neutro (ads_score = 5.0) em vez de derrubar o pipeline ou assumir
"zero anúncios", que enviesaria o score_final para cima incorretamente.
"""

import re
from typing import Optional
from urllib.parse import quote

from playwright.sync_api import Browser

from .config import USER_AGENT
from .models import AdsAnalysis

ADS_LIBRARY_BASE = "https://www.facebook.com/ads/library/"

CTA_KEYWORDS = [
    "saiba mais", "enviar mensagem", "cadastre-se", "comprar agora",
    "ligar agora", "solicitar horário", "enviar whatsapp", "fazer cotação",
    "learn more", "send message", "sign up", "contact us", "get quote",
]

NO_RESULTS_MARKERS = [
    "nenhum resultado encontrado", "0 resultados", "no ads match", "0 results",
    "nenhum anúncio corresponde aos seus critérios de pesquisa",
]

RESULT_COUNT_PATTERNS = [
    re.compile(r"~?\s*([\d.,]+)\s+resultados?", re.IGNORECASE),
    re.compile(r"~?\s*([\d.,]+)\s+results?", re.IGNORECASE),
]

NOT_VERIFIED_ADS_SCORE = 5.0
CREATIVE_SAMPLE_SIZE = 5


def analyze_ads(company_name: str, browser: Browser) -> AdsAnalysis:
    try:
        result = _query_ads_library(company_name, browser)
        if result.active_ads_count == 0:
            # Nomes do Google Maps costumam vir com sufixos descritivos
            # ("Nome - Imobiliária em X - Y") que a busca por palavra-chave
            # da Ads Library não casa bem, gerando falso "0 anúncios". Tenta
            # de novo com um nome mais limpo antes de aceitar o zero.
            clean_name = _clean_company_name(company_name)
            if clean_name and clean_name.lower() != company_name.lower():
                retry = _query_ads_library(clean_name, browser)
                if retry.active_ads_count:
                    retry.notes.append(f'reconsultado como "{clean_name}"')
                    return retry
        return result
    except Exception:
        return AdsAnalysis(
            active_ads_count=None,
            creative_quality_score=None,
            ads_score=NOT_VERIFIED_ADS_SCORE,
            notes=["Meta Ads Library não verificado (falha na consulta)"],
        )


def _clean_company_name(name: str) -> str:
    """Extrai o nome 'nu' do negócio, removendo sufixos descritivos comuns
    em títulos do Google Maps (ex: "Nome - Imobiliária em Gramado - Canela",
    "Nome | Aluguel e venda de imóveis")."""
    for sep in (" - ", " – ", " — ", " | "):
        if sep in name:
            name = name.split(sep)[0]
    return name.strip()


def _query_ads_library(company_name: str, browser: Browser) -> AdsAnalysis:
    context = browser.new_context(user_agent=USER_AGENT, locale="pt-BR")
    page = context.new_page()
    try:
        url = (
            f"{ADS_LIBRARY_BASE}?active_status=active&ad_type=all&country=BR"
            f"&q={quote(company_name)}&search_type=keyword_unordered&media_type=all"
        )
        page.goto(url, timeout=30000)
        _dismiss_consent(page)
        page.wait_for_timeout(3000)

        body_text = page.locator("body").inner_text(timeout=5000)

        if _looks_like_no_results(body_text):
            return AdsAnalysis(active_ads_count=0, creative_quality_score=0.0, ads_score=0.0, notes=["0 anúncios ativos"])

        cards = page.locator("text=Identificação da biblioteca")
        count = _parse_result_count(body_text)
        if count is None:
            count = cards.count()

        creative_quality = _estimate_creative_quality(page, cards)
        ads_score = _compute_ads_score(count, creative_quality)

        return AdsAnalysis(
            active_ads_count=count,
            creative_quality_score=creative_quality,
            ads_score=ads_score,
            notes=[],
        )
    finally:
        context.close()


def _dismiss_consent(page) -> None:
    for text in ["Permitir todos os cookies", "Aceitar tudo", "Allow all cookies", "Accept all"]:
        try:
            btn = page.get_by_role("button", name=text)
            if btn.count() > 0:
                btn.first.click(timeout=3000)
                return
        except Exception:
            continue


def _looks_like_no_results(body_text: str) -> bool:
    lowered = body_text.lower()
    return any(marker in lowered for marker in NO_RESULTS_MARKERS)


def _parse_result_count(body_text: str) -> Optional[int]:
    for pattern in RESULT_COUNT_PATTERNS:
        match = pattern.search(body_text)
        if match:
            digits = re.sub(r"[.,]", "", match.group(1))
            if digits.isdigit():
                return int(digits)
    return None


def _estimate_creative_quality(page, cards_locator) -> float:
    """Heurística simples 0-10: presença de vídeo, CTA claro e múltiplos criativos."""
    try:
        sample_count = cards_locator.count()
    except Exception:
        sample_count = 0

    if sample_count == 0:
        return 5.0

    score = 5.0
    try:
        page_text = page.locator("body").inner_text(timeout=3000).lower()
        if any(kw in page_text for kw in CTA_KEYWORDS):
            score += 2
    except Exception:
        pass

    try:
        if page.locator("video").count() > 0:
            score += 2
    except Exception:
        pass

    if sample_count >= 3:
        score += 1

    return max(0.0, min(10.0, score))


def _compute_ads_score(active_count: Optional[int], creative_quality_score: Optional[float]) -> float:
    """0 a 10: zero anúncios ativos = nota baixa (= maior oportunidade)."""
    if not active_count or active_count <= 0:
        return 0.0

    volume_score = min(10.0, active_count * 2)
    quality = creative_quality_score if creative_quality_score is not None else 5.0
    return round((volume_score + quality) / 2, 1)
