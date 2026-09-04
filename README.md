# Invitación · Baby Shower

Micrositio de invitación pensado para compartirse por WhatsApp. Al pegar el
enlace en un chat, WhatsApp muestra una vista previa con la ilustración y los
datos del evento; al tocarla se abre la invitación completa.

**Stack:** Astro 5 + Tailwind + GSAP. Salida 100 % estática, sin backend.
**Hospedaje:** GitHub Pages.

---

## 1. Lo único que tienes que editar

Todo el contenido vive en un solo archivo: **`src/data/evento.json`**.

| Campo | Para qué sirve |
|---|---|
| `tipo`, `anfitriones`, `frase` | Títulos y textos principales |
| `bebe` | Opcional. Vacío = sin renglón de nombre, en el sitio y en la imagen de WhatsApp |
| `fechaISO`, `finISO` | Cuenta regresiva, `.ics` y Google Calendar. Incluye el offset: `-06:00` |
| `fechaTexto`, `fechaCorta`, `hora` | Cómo se lee la fecha en pantalla |
| `lugar`, `direccion`, `mapsUrl`, `wazeUrl` | Sección "Cómo llegar" |
| `dressCode`, `notaDressCode` | Código de vestimenta |
| `regalos[]`, `actividades[]` | Mesa de regalos e itinerario |
| `contactoWhatsApp` | Número al que escriben las dudas. Formato: `524621234567`, sin `+` ni espacios |
| `sitioUrl` | **Importante.** De aquí salen `site` y `base` de Astro y las URLs absolutas de Open Graph |
| `ogVersion` | Súbelo (`"2"`, `"3"`…) cada vez que cambies la imagen de vista previa |

Después de editar el JSON:

```bash
npm run og      # regenera la imagen de vista previa de WhatsApp
npm run build
```

## 2. Correrlo local

```bash
npm install
npm run dev      # http://localhost:4321/invitacion/
```

## 3. Publicar en GitHub Pages

1. Sube el repo a GitHub.
2. En **Settings → Pages → Source**, elige **GitHub Actions**.
3. Haz push a `main`. El workflow `.github/workflows/deploy.yml` compila y publica.

Si el repo se llama distinto a `invitacion`, ajusta `sitioUrl` en el JSON —
`astro.config.mjs` deriva el `base` de ahí y no hay que tocar nada más.

**Con dominio propio** (recomendado, el enlace se ve mucho mejor en el chat):

1. Pon el dominio en **Settings → Pages → Custom domain**.
2. Crea `public/CNAME` con el dominio dentro.
3. Cambia `sitioUrl` a `https://tudominio.mx/` (la raíz, sin subcarpeta).

## 4. La vista previa de WhatsApp

WhatsApp **no ejecuta JavaScript**: lee las metaetiquetas del HTML crudo. Por
eso el sitio es estático. Las reglas que respeta este proyecto:

- `og:image` con URL **absoluta** y `https`, sin redirects
- JPG (nada de WebP ni SVG)
- 1200 × 630 px
- **menos de 300 KB** — `scripts/generar-og.py` comprime hasta lograrlo

**El caché.** WhatsApp guarda la vista previa por URL alrededor de 30 días. Si
cambias la imagen y el enlace ya circuló, no vas a ver el cambio. Por eso
existe `ogVersion`: al subirlo, la URL de la imagen cambia (`?v=2`) y se
regenera. Si necesitas invalidar el enlace completo, comparte
`https://…/?v=2`.

**Cómo probarla antes de mandarla.** Mándate el enlace a ti mismo en WhatsApp,
o pégalo en <https://opengraph.xyz>. El depurador de Facebook no refleja lo que
hace WhatsApp.

## 5. Las imágenes

La ilustración original traía rótulos impresos ("MEMORIA DE UN DÍA DULCE",
etc.). `scripts/preparar-assets.py` los borra por difusión y genera todos los
recortes que usa el sitio.

```bash
pip install pillow numpy scipy
npm run assets   # solo si cambias src/assets/ilustracion-original.png
npm run og
```

| Archivo | Uso |
|---|---|
| `public/img/escena-wide.*` | Hero en desktop |
| `public/img/escena-portrait.*` | Hero en móvil |
| `public/img/detalle-limon.*` | Sección "Los datos" |
| `public/img/detalle-flores.*` | Sección "Código de vestimenta" |
| `public/img/detalle-plato.*` | Sección "Itinerario" |
| `public/og/invitacion.jpg` | Vista previa de WhatsApp |

## 6. Detalles de implementación

- **Sin librería de mapas.** El mapa es un SVG ilustrado de ~2 KB con botones a
  Google Maps y Waze. Un mapa real pesa cientos de KB, rompe el estilo y se
  comporta mal en el navegador interno de WhatsApp. Si aun así lo quieres, hay
  un comentario marcando el lugar en `src/components/ComoLlegar.astro`.
- **Animaciones.** GSAP + ScrollTrigger: entrada del hero, parallax del fondo,
  aparición por sección, trazo de las ramitas y pétalos al agregar al
  calendario. Todo respeta `prefers-reduced-motion`.
- **Calendario.** `src/pages/evento.ics.ts` genera un `.ics` estático en build,
  con recordatorio un día antes. El botón de Google Calendar arma la URL desde
  el mismo JSON.
- **Sin confirmación de asistencia** por ahora. Si más adelante la quieres, lo
  más barato es un botón `wa.me` con el mensaje prellenado; el bloque ya está
  armado en la sección de cierre y solo habría que duplicarlo.

## 7. Estructura

```
src/
├─ assets/       ilustración original y su versión limpia
├─ components/   secciones de la página
├─ data/         evento.json  ← lo único editable
├─ layouts/      Base.astro   ← todas las metaetiquetas Open Graph
├─ lib/          helper de rutas con base path
├─ pages/        index.astro y evento.ics.ts
├─ scripts/      main.ts (GSAP, cuenta regresiva, pétalos)
└─ styles/       global.css
scripts/         generadores de imágenes (Python)
fonts/           Cormorant Garamond y Jost, para generar la imagen OG
```
