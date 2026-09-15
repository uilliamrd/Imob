"""Escrita do CSV final de leads priorizados."""

import csv
import os
from datetime import date
from typing import List

from .config import OUTPUT_DIR
from .models import ROW_FIELDNAMES, LeadResult
from .utils import slugify


def output_path(cidade: str, output_dir: str, extension: str) -> str:
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{slugify(cidade)}_{date.today().isoformat()}.{extension}"
    return os.path.join(output_dir, filename)


def write_csv(cidade: str, results: List[LeadResult], output_dir: str = OUTPUT_DIR) -> str:
    path = output_path(cidade, output_dir, "csv")

    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=ROW_FIELDNAMES)
        writer.writeheader()
        for r in results:
            writer.writerow(r.to_row())

    return path
