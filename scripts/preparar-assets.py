#!/usr/bin/env python3
"""
Limpia la ilustración original (quita los rótulos que traía impresos) y genera
todas las variantes web que consume el sitio.

Uso:  python3 scripts/preparar-assets.py
Requiere: pillow, numpy, scipy   ->  pip install pillow numpy scipy
Solo hay que volver a correrlo si cambias la ilustración de origen.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "src/assets/ilustracion-original.png"
SALIDA = RAIZ / "public/img"
SALIDA.mkdir(parents=True, exist_ok=True)

# Rectángulos donde la ilustración original traía texto impreso.
ROTULOS = [
    (235, 180, 470, 255),    # "MEMORIA DE UN DÍA DULCE"
    (1465, 300, 1695, 400),  # "EL COMIENZO DE LA PRIMAVERA"
    (1470, 715, 1740, 760),  # "FRUTO DE AMOR"
    (455, 935, 745, 1005),   # "EL COMIENZO DE LA PRIMAVERA" (tarjeta crema)
]


def limpiar(img: Image.Image) -> Image.Image:
    """Borra los rótulos por difusión: los pixeles oscuros de cada rectángulo se
    rellenan promediando iterativamente sus vecinos, así el trazo del pincel
    de alrededor se reconstruye sin dejar costura."""
    a = np.asarray(img.convert("RGB")).astype(np.float64).copy()
    lum = a.sum(2) / 3

    mascara = np.zeros(lum.shape, bool)
    for x0, y0, x1, y1 in ROTULOS:
        mascara[y0:y1, x0:x1] = lum[y0:y1, x0:x1] < 170
    mascara = binary_dilation(mascara, iterations=4)

    for c in range(3):
        canal = a[:, :, c]
        for x0, y0, x1, y1 in ROTULOS:
            sub, msk = canal[y0:y1, x0:x1], mascara[y0:y1, x0:x1]
            if msk.any():
                sub[msk] = sub[~msk].mean()
        for _ in range(300):
            p = np.pad(canal, 1, mode="edge")
            vecinos = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4
            canal[mascara] = vecinos[mascara]
        a[:, :, c] = canal

    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def exportar(img: Image.Image, nombre: str, ancho: int):
    alto = round(img.height * ancho / img.width)
    r = img.resize((ancho, alto), Image.LANCZOS)
    r.save(SALIDA / f"{nombre}.jpg", quality=86, optimize=True, progressive=True)
    r.save(SALIDA / f"{nombre}.webp", quality=82, method=6)
    kb = (SALIDA / f"{nombre}.webp").stat().st_size / 1024
    print(f"  {nombre}: {ancho}x{alto}  webp {kb:.0f} KB")


def main():
    print("Limpiando ilustración…")
    limpia = limpiar(Image.open(ORIGEN))
    limpia.save(RAIZ / "src/assets/ilustracion-limpia.png")

    print("Exportando variantes…")
    # Escena completa, para desktop
    exportar(limpia, "escena-wide", 1600)
    # Recorte vertical centrado en el limón, para móvil
    exportar(limpia.crop((700, 40, 1500, 1106)), "escena-portrait", 900)
    # Detalles para las secciones
    exportar(limpia.crop((830, 90, 1470, 730)), "detalle-limon", 700)
    exportar(limpia.crop((880, 400, 1360, 880)), "detalle-flores", 700)
    exportar(limpia.crop((1130, 740, 1690, 1160)), "detalle-plato", 700)
    print("Listo.")


if __name__ == "__main__":
    main()
