import { LOCALES, localePath } from '../i18n/index.js';

// Hand-written so the site needs no sitemap dependency. The legal pages carry noindex and are left out.
const PAGES = ['/'];

export function GET({ site }) {
  const urls = LOCALES.flatMap((locale) => PAGES.map((page) => `  <url>\n    <loc>${new URL(localePath(locale, page), site).href}</loc>\n  </url>`));
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
