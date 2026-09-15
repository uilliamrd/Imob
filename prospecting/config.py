"""Constantes e parâmetros usados pelo script de prospecção."""

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

REQUEST_TIMEOUT_SECONDS = 12

MAPS_MAX_RESULTS_DEFAULT = 40
MAPS_SEARCH_QUERY_TEMPLATE = "imobiliária em {cidade}"

# Intervalos (segundos) usados com random.uniform() entre requisições,
# para reduzir a chance de bloqueio por scraping.
DELAY_BETWEEN_MAPS_SCROLLS = (1.0, 2.0)
DELAY_BETWEEN_SITE_CHECKS = (1.5, 3.5)
DELAY_BETWEEN_ADS_CHECKS = (2.5, 5.0)

# Assinaturas (substrings em HTML/scripts, em minúsculas) de CRMs/plataformas
# imobiliárias conhecidas no mercado brasileiro. Usadas para detectar se o
# site já usa uma ferramenta especializada do setor.
CRM_SIGNATURES = {
    "vistahost.com.br": "Vista CRM",
    "vistasoft": "Vista CRM",
    "jetimob.com": "Jetimob",
    "tecimob.com.br": "Tecimob",
    "imoview": "Imoview (União Softwares)",
    "unigestor": "Imoview (União Softwares)",
    "grupozap": "Grupo ZAP / Widget OLX",
    "zap-cdn": "Grupo ZAP / Widget OLX",
    "cvcrm.com.br": "CV CRM",
    "leadstation": "Leadstation",
    "superlogica": "Superlógica Imob",
    "imobibrasil": "ImobiBrasil",
    "wimoveis": "W Imóveis",
    "olximoveis": "OLX Imóveis (widget)",
    "resale.com.br": "Resale",
}

# Widgets de chat genéricos: não contam como "CRM imobiliário detectado",
# mas ajudam a compor o motivo/observações do lead.
CHAT_WIDGET_SIGNATURES = {
    "jivochat": "JivoChat",
    "tawk.to": "Tawk.to",
    "typebot": "Typebot",
    "wa.me/": "Botão WhatsApp",
    "api.whatsapp.com/send": "Botão WhatsApp",
    "octadesk": "Octadesk",
    "zenvia": "Zenvia Chat",
}

OUTPUT_DIR = "output"
