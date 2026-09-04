// Empaqueta dist/index.html en un solo archivo autocontenido (imágenes, fuentes
// y JS como data: URI) para poder previsualizarlo sin servidor.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SALIDA = process.argv[2] ?? '/tmp/claude-0/-home-claude/08aa45ec-5d34-5f61-b771-5e5be902392b/scratchpad/preview.html';

let html = readFileSync(join(DIST, 'index.html'), 'utf8');

const mime = (p) =>
  ({ webp: 'image/webp', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2' })[
    p.split('.').pop().split('?')[0]
  ] ?? 'application/octet-stream';

const dataUri = (rutaWeb) => {
  const limpia = rutaWeb.replace(/^\/invitacion\//, '').split('?')[0];
  const abs = join(DIST, limpia);
  if (!existsSync(abs)) return null;
  return `data:${mime(limpia)};base64,${readFileSync(abs).toString('base64')}`;
};

// 1) Inlinea el bundle de JS
html = html.replace(
  /<script type="module" src="([^"]+)"><\/script>/g,
  (_, src) => `<script type="module">\n${readFileSync(join(DIST, src.replace(/^\/invitacion\//, '')), 'utf8')}\n</script>`
);

// 2) Sustituye toda referencia a /invitacion/... por su data: URI
html = html.replace(/\/invitacion\/[A-Za-z0-9_\-./]+(\?v=\d+)?/g, (m) => dataUri(m) ?? m);

// 3) Se queda solo con el contenido: el artifact aporta su propio esqueleto
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const titulo = head.match(/<title>[\s\S]*?<\/title>/)[0];
const estilos = [...head.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]).join('\n');
const scriptsHead = [...head.matchAll(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/g)]
  .map((m) => m[0])
  .join('\n');

writeFileSync(SALIDA, `${titulo}\n${estilos}\n${scriptsHead}\n${body}\n`);
console.log(SALIDA, (readFileSync(SALIDA).length / 1024 / 1024).toFixed(2), 'MB');
