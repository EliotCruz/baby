#!/usr/bin/env python3
"""
Convierte las fuentes a woff2 recortadas a los caracteres que usa el sitio.

Las servimos nosotros en vez de pedirlas a Google Fonts: son ~15 KB en total,
evitan dos conexiones extra (que en el navegador interno de WhatsApp se sienten)
y quitan el parpadeo de texto sin fuente.

Uso:  python3 scripts/subset-fuentes.py
Requiere: fonttools[woff]  ->  pip install fonttools brotli
"""
from pathlib import Path
from fontTools.subset import main as subset

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "fonts"
DESTINO = RAIZ / "public/fonts"
DESTINO.mkdir(parents=True, exist_ok=True)

# Latín básico + acentos y signos del español + comillas tipográficas
UNICODES = "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2010-2015,U+2018-201E,U+2022,U+2026,U+00B7,U+00BF,U+00A1"

FUENTES = {
    "cormorant-300.woff2": "CormorantGaramond_300Light.ttf",
    "cormorant-400.woff2": "CormorantGaramond_400Regular.ttf",
    "cormorant-400i.woff2": "CormorantGaramond_400Regular_Italic.ttf",
    "jost-300.woff2": "Jost_300Light.ttf",
    "jost-400.woff2": "Jost_400Regular.ttf",
    "jost-500.woff2": "Jost_500Medium.ttf",
}

for salida, entrada in FUENTES.items():
    subset([
        str(ORIGEN / entrada),
        f"--unicodes={UNICODES}",
        "--layout-features=kern,liga,calt,onum,tnum",
        "--flavor=woff2",
        f"--output-file={DESTINO / salida}",
    ])
    print(f"  {salida}  {(DESTINO / salida).stat().st_size / 1024:.1f} KB")
