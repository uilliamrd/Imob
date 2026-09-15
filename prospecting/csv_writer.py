"""Escrita do CSV final de leads priorizados."""

import csv
import os
from datetime import date
from typing import List

from .config import OUTPUT_DIR
from .models import LeadResult
from .utils import slugify

FIELDNAMES = [
    "title",
    "street",
    "phone",
    "categoryName",
    "url",
    "website",
    "site_score",
    "ads_score",
    "score_final",
    "motivo",
]


def write_csv(cidade: str, results: List[LeadResult], output_dir: str = OUTPUT_DIR) -> str:
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{slugify(cidade)}_{date.today().isoformat()}.csv"
    path = os.path.join(output_dir, filename)

    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for r in results:
            writer.writerow(
                {
                    "title": r.agency.title,
                    "street": r.agency.street,
                    "phone": r.agency.phone,
                    "categoryName": r.agency.categoryName,
                    "url": r.agency.url,
                    "website": r.agency.website,
                    "site_score": r.site.site_score,
                    "ads_score": r.ads.ads_score,
                    "score_final": r.score_final,
                    "motivo": r.motivo,
                }
            )

    return path
