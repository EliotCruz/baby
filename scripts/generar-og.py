#!/usr/bin/env python3
"""
Genera la imagen de vista previa para WhatsApp (Open Graph) a partir de
src/data/evento.json y de la ilustración ya limpia.

Uso:  python3 scripts/generar-og.py     (o `npm run og`)
Requiere: pillow  ->  pip install pillow

Reglas que respeta a propósito, porque WhatsApp es estricto:
  · JPG (nada de WebP ni SVG)
  · 1200 x 630 px
  · peso final por debajo de 300 KB
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "fonts"
SALIDA = RAIZ / "public/og"
SALIDA.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
CREMA = (251, 246, 234)
TINTA = (46, 66, 87)
SALVIA = (138, 154, 120)
ROSA = (199, 144, 152)


def fuente(archivo, tam):
    return ImageFont.truetype(str(FUENTES / archivo), tam)


def texto_espaciado(draw, xy, txt, font, fill, tracking=0, anchor_y="top"):
    """PIL no tiene letter-spacing, así que se dibuja carácter por carácter."""
    x, y = xy
    for ch in txt:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x - tracking


def ancho_espaciado(draw, txt, font, tracking=0):
    return sum(draw.textlength(c, font=font) for c in txt) + tracking * (len(txt) - 1)


def main():
    datos = json.loads((RAIZ / "src/data/evento.json").read_text(encoding="utf-8"))

    base = Image.open(RAIZ / "src/assets/ilustracion-limpia.png").convert("RGB")
    lienzo = base.crop((330, 90, 1510, 710)).resize((W, H), Image.LANCZOS)

    # El nombre del bebé es opcional: si está vacío, la tarjeta se acorta.
    bebe = datos.get("bebe", "").strip()

    # Tarjeta crema a la izquierda, como los bloques de la ilustración original
    cx0, cy0, cx1 = 62, 72, 612
    alto_tarjeta = 486 if bebe else 412
    cy1 = cy0 + alto_tarjeta
    sombra = Image.new("RGB", (W, H), CREMA)
    mascara = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mascara).rectangle([cx0, cy0, cx1, cy1], fill=255)
    lienzo = Image.composite(sombra, lienzo, mascara)

    d = ImageDraw.Draw(lienzo)
    px = cx0 + 54
    y = cy0 + 52

    # Antetítulo
    f_eyebrow = fuente("Jost_400Regular.ttf", 21)
    texto_espaciado(d, (px, y), "TE ESPERAMOS EL", f_eyebrow, SALVIA, tracking=5.5)

    # Fecha corta grande
    y += 36
    f_fecha = fuente("CormorantGaramond_300Light.ttf", 40)
    texto_espaciado(d, (px, y), datos["fechaCorta"], f_fecha, TINTA, tracking=4)

    # Filete
    y += 68
    d.line([px, y, px + 92, y], fill=ROSA, width=2)

    # Título del evento
    y += 30
    f_tipo = fuente("CormorantGaramond_400Regular.ttf", 60)
    texto_espaciado(d, (px, y), datos["tipo"].upper(), f_tipo, TINTA, tracking=5)
    y += 82

    # Nombre del bebé, en cursiva
    if bebe:
        f_bebe = fuente("CormorantGaramond_400Regular_Italic.ttf", 54)
        d.text((px, y), f"de {bebe}", font=f_bebe, fill=ROSA)
        y += 88

    # Hora y lugar
    y += 6
    f_dato = fuente("Jost_300Light.ttf", 23)
    texto_espaciado(d, (px, y), datos["hora"].upper() + "  ·  " + datos["lugar"].upper(),
                    f_dato, TINTA, tracking=2.4)
    y += 36
    f_dir = fuente("Jost_300Light.ttf", 20)
    ciudad = datos["direccion"].split(",")[-2:]
    texto_espaciado(d, (px, y), ",".join(ciudad).strip().upper(), f_dir, SALVIA, tracking=2.4)

    # Guarda comprimiendo hasta quedar debajo de 300 KB
    destino = SALIDA / "invitacion.jpg"
    for q in (90, 86, 82, 78, 74, 70):
        lienzo.save(destino, "JPEG", quality=q, optimize=True, progressive=True)
        kb = destino.stat().st_size / 1024
        if kb < 290:
            break
    print(f"public/og/invitacion.jpg  {W}x{H}  {kb:.0f} KB  (calidad {q})")
    if kb >= 290:
        print("  ⚠ sigue pesando de más; baja la calidad o simplifica la imagen")


if __name__ == "__main__":
    main()
