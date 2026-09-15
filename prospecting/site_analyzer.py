"""Etapa 2 — Análise do site de cada imobiliária.

Usa requests (não Playwright) porque o que precisamos aqui — status HTTP,
disponibilidade de HTTPS, meta tag de viewport e assinaturas de CRM no
HTML/scripts — não depende de renderização JS.
"""

import re
from typing import Optional

import requests

from .config import CHAT_WIDGET_SIGNATURES, CRM_SIGNATURES, REQUEST_TIMEOUT_SECONDS, USER_AGENT
from .models import SiteAnalysis

VIEWPORT_RE = re.compile(r'<meta[^>]+name=["\']viewport["\']', re.IGNORECASE)

# Site sem carregar: quase toda a nota de qualidade vai embora, mas mantemos
# > 0 para diferenciar de "sem site" (site_score = 0, reservado ao caso de
# a imobiliária nem ter website cadastrado no Maps).
SITE_DOWN_SCORE = 1.0


def analyze_site(website: str) -> SiteAnalysis:
    if not website or not website.strip():
        return SiteAnalysis(loads=False, site_score=0.0, notes=["sem site"])

    raw = website.strip()
    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw
    https_url = raw if raw.startswith("https://") else raw.replace("http://", "https://", 1)

    headers = {"User-Agent": USER_AGENT}
    notes = []
    response = None
    https_available = False

    try:
        response = requests.get(https_url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
        https_available = True
    except requests.exceptions.SSLError:
        notes.append("erro de certificado SSL")
    except requests.exceptions.RequestException:
        pass

    if response is None:
        http_url = https_url.replace("https://", "http://", 1)
        try:
            response = requests.get(http_url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
        except requests.exceptions.RequestException as exc:
            notes.append(f"site não carregou ({exc.__class__.__name__})")
            return SiteAnalysis(loads=False, https=False, site_score=SITE_DOWN_SCORE, notes=notes)

    html = response.text or ""
    html_lower = html.lower()

    mobile_responsive = bool(VIEWPORT_RE.search(html))
    crm_detected = _detect_signature(html_lower, CRM_SIGNATURES)
    if crm_detected is None:
        chat_widget = _detect_signature(html_lower, CHAT_WIDGET_SIGNATURES)
        if chat_widget:
            notes.append(f"widget de chat detectado ({chat_widget}), mas sem CRM imobiliário identificado")

    loads = response.status_code < 400
    site_score = _compute_site_score(loads, https_available, mobile_responsive, crm_detected, response.status_code)

    return SiteAnalysis(
        loads=loads,
        status_code=response.status_code,
        https=https_available,
        mobile_responsive=mobile_responsive,
        crm_detected=crm_detected,
        site_score=site_score,
        notes=notes,
    )


def _detect_signature(html_lower: str, signature_map: dict) -> Optional[str]:
    for needle, label in signature_map.items():
        if needle in html_lower:
            return label
    return None


def _compute_site_score(
    loads: bool,
    https_available: bool,
    mobile_responsive: bool,
    crm_detected: Optional[str],
    status_code: Optional[int],
) -> float:
    """0 a 10: quanto mais antigo/sem recursos/sem CRM, menor a nota (= maior oportunidade)."""
    if not loads:
        return SITE_DOWN_SCORE

    score = 10.0
    if not https_available:
        score -= 3
    if not mobile_responsive:
        score -= 3
    if not crm_detected:
        score -= 2
    if status_code and status_code >= 400:
        score -= 2

    return max(0.0, min(10.0, score))
