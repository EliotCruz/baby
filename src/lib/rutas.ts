const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ruta a un archivo de /public respetando el base path de GitHub Pages. */
export const ruta = (p: string) => `${base}/${p.replace(/^\//, '')}`;

/** Igual, pero absoluta. Open Graph exige URLs absolutas. */
export const absoluta = (p: string, site: URL | undefined) =>
  new URL(ruta(p), site ?? 'http://localhost:4321').href;
