"""Etapa 4 — Classificação final dos leads.

site_score e ads_score (etapas 2 e 3) medem QUALIDADE: nota baixa = site/
anúncios ruins ou inexistentes = mais oportunidade de venda. score_final
inverte essa escala para representar OPORTUNIDADE diretamente (nota alta =
mais oportunidade), combinando os dois gaps com uma leve pressão do menor
dos dois — para priorizar quem tem os DOIS gaps (site ruim E poucos
anúncios) em vez de quem só peca em uma frente.
"""

from typing import Tuple

from .models import AdsAnalysis, SiteAnalysis


def compute_final(site: SiteAnalysis, ads: AdsAnalysis) -> Tuple[float, str]:
    site_opportunity = 10.0 - site.site_score
    ads_opportunity = 10.0 - ads.ads_score

    combined = (site_opportunity + ads_opportunity + min(site_opportunity, ads_opportunity)) / 3
    score_final = round(max(0.0, min(10.0, combined)), 1)

    motivo = _build_motivo(site, ads)
    return score_final, motivo


def _build_motivo(site: SiteAnalysis, ads: AdsAnalysis) -> str:
    reasons = []

    if site.site_score == 0:
        reasons.append("sem site")
    elif not site.loads:
        reasons.append("site fora do ar")
    else:
        if not site.https:
            reasons.append("sem HTTPS")
        if not site.mobile_responsive:
            reasons.append("não responsivo (mobile)")
        if not site.crm_detected:
            reasons.append("sem CRM imobiliário detectado")

    if ads.active_ads_count is None:
        reasons.append("Meta Ads não verificado")
    elif ads.active_ads_count == 0:
        reasons.append("0 anúncios ativos")
    elif ads.active_ads_count <= 2:
        reasons.append(f"poucos anúncios ativos ({ads.active_ads_count})")

    if not reasons:
        reasons.append("site e anúncios em bom nível — oportunidade menor")

    return " + ".join(reasons[:3])
