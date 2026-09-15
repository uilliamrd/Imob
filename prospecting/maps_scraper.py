"""Etapa 1 — Descoberta de imobiliárias via Google Maps.

O DOM do Google Maps muda com frequência e não é uma API pública estável,
então a extração aqui é best-effort: cada campo é obtido de forma isolada
(com try/except) para que a falha de um seletor não derrube o restante da
coleta. Os atributos `data-item-id` usados abaixo tendem a ser mais estáveis
que classes CSS ofuscadas, mas ainda assim podem exigir ajustes no futuro
caso o Google altere a interface — se a maioria dos campos vier vazia,
inspecione a página com o DevTools e atualize os seletores.
"""

from typing import List, Optional

from playwright.sync_api import Browser, TimeoutError as PlaywrightTimeoutError

from .config import DELAY_BETWEEN_MAPS_SCROLLS, MAPS_SEARCH_QUERY_TEMPLATE, USER_AGENT
from .models import Agency
from .utils import random_delay

FEED_SELECTOR = 'div[role="feed"]'
MAX_STAGNANT_SCROLL_ROUNDS = 4


def discover_agencies(cidade: str, max_results: int, browser: Browser) -> List[Agency]:
    """Busca "imobiliária em <cidade>" no Google Maps e retorna os resultados encontrados."""
    context = browser.new_context(user_agent=USER_AGENT, locale="pt-BR")
    page = context.new_page()
    try:
        query = MAPS_SEARCH_QUERY_TEMPLATE.format(cidade=cidade)
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        page.goto(url, timeout=30000)
        _dismiss_consent(page)

        try:
            page.wait_for_selector(FEED_SELECTOR, timeout=15000)
        except PlaywrightTimeoutError:
            # Pode acontecer quando a busca retorna um único resultado direto
            # (sem lista/feed) — seguimos tentando extrair o que estiver na página.
            pass

        listing_links = _collect_listing_links(page, max_results)

        agencies = []
        for href in listing_links:
            agency = _extract_agency_details(page, href)
            if agency is not None:
                agencies.append(agency)
            random_delay(DELAY_BETWEEN_MAPS_SCROLLS)

        return agencies
    finally:
        context.close()


def _dismiss_consent(page) -> None:
    """Fecha o dialog de consentimento de cookies do Google, quando aparece."""
    for text in ["Aceitar tudo", "Rejeitar tudo", "Accept all", "I agree"]:
        try:
            btn = page.get_by_role("button", name=text)
            if btn.count() > 0:
                btn.first.click(timeout=3000)
                return
        except Exception:
            continue


def _collect_listing_links(page, max_results: int) -> List[str]:
    """Rola o feed de resultados coletando os links de cada imobiliária listada."""
    seen: set = set()
    stagnant_rounds = 0

    while len(seen) < max_results and stagnant_rounds < MAX_STAGNANT_SCROLL_ROUNDS:
        anchors = page.locator(f'{FEED_SELECTOR} a[href*="/maps/place/"]')
        try:
            count = anchors.count()
        except Exception:
            break

        for i in range(count):
            try:
                href = anchors.nth(i).get_attribute("href")
            except Exception:
                href = None
            if href:
                seen.add(href)

        before = len(seen)
        try:
            page.locator(FEED_SELECTOR).evaluate("el => el.scrollTop = el.scrollHeight")
        except Exception:
            break

        random_delay(DELAY_BETWEEN_MAPS_SCROLLS)
        stagnant_rounds = stagnant_rounds + 1 if len(seen) <= before else 0

    return list(seen)[:max_results]


def _extract_agency_details(page, href: str) -> Optional[Agency]:
    """Abre uma aba nova na URL do estabelecimento e lê os dados do painel lateral."""
    detail_page = page.context.new_page()
    try:
        detail_page.goto(href, timeout=20000)
        detail_page.wait_for_timeout(1500)

        title = _text_or_empty(detail_page, "h1")
        if not title:
            return None

        return Agency(
            title=title,
            street=_text_or_empty(detail_page, 'button[data-item-id="address"]'),
            phone=_text_or_empty(detail_page, 'button[data-item-id^="phone:tel:"]'),
            website=_attr_or_empty(detail_page, 'a[data-item-id="authority"]', "href"),
            categoryName=_text_or_empty(detail_page, 'button[jsaction*="category"]'),
            url=href,
        )
    except Exception:
        return None
    finally:
        detail_page.close()


def _text_or_empty(page, selector: str) -> str:
    try:
        loc = page.locator(selector).first
        if loc.count() > 0:
            return loc.inner_text(timeout=3000).strip()
    except Exception:
        pass
    return ""


def _attr_or_empty(page, selector: str, attr: str) -> str:
    try:
        loc = page.locator(selector).first
        if loc.count() > 0:
            return (loc.get_attribute(attr, timeout=3000) or "").strip()
    except Exception:
        pass
    return ""
