import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import evento from './src/data/evento.json' with { type: 'json' };

// Una sola fuente de verdad: la URL final vive en src/data/evento.json.
// De ahí salen `site` y `base`, que es lo que Astro necesita para que las URLs
// de Open Graph queden absolutas (requisito duro de WhatsApp).
const url = new URL(evento.sitioUrl);

export default defineConfig({
  site: url.origin,
  base: url.pathname.replace(/\/$/, '') || '/',
  trailingSlash: 'ignore',
  integrations: [tailwind({ applyBaseStyles: false })],
  build: { inlineStylesheets: 'always' },
  vite: { build: { assetsInlineLimit: 0 } },
});
