"""Estruturas de dados compartilhadas entre as etapas do pipeline."""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Agency:
    """Um resultado bruto extraído do Google Maps."""

    title: str = ""
    street: str = ""
    website: str = ""
    phone: str = ""
    categoryName: str = ""
    url: str = ""


@dataclass
class SiteAnalysis:
    loads: bool = False
    status_code: Optional[int] = None
    https: bool = False
    mobile_responsive: bool = False
    crm_detected: Optional[str] = None
    site_score: float = 0.0
    notes: List[str] = field(default_factory=list)


@dataclass
class AdsAnalysis:
    active_ads_count: Optional[int] = None
    creative_quality_score: Optional[float] = None
    ads_score: float = 0.0
    notes: List[str] = field(default_factory=list)


@dataclass
class LeadResult:
    agency: Agency
    site: SiteAnalysis
    ads: AdsAnalysis
    score_final: float = 0.0
    motivo: str = ""
