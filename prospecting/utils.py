"""Helpers genéricos usados por mais de uma etapa do pipeline."""

import random
import re
import time
import unicodedata


def slugify(text: str) -> str:
    """Converte texto livre em algo seguro para nome de arquivo (sem acentos/espaços)."""
    nfkd = unicodedata.normalize("NFKD", text)
    ascii_text = nfkd.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower().strip()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text)
    return ascii_text.strip("-") or "cidade"


def random_delay(bounds) -> None:
    """Dorme por um tempo aleatório dentro de (min, max) segundos."""
    time.sleep(random.uniform(*bounds))
