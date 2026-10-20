// The locale list is the set of JSON files in this folder. Drop in de.json and German exists.
// Read from disk (not import.meta.glob) because astro.config.mjs imports this file too.
// The build always runs from site/, so the path is relative to the working directory.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const DEFAULT_LOCALE = 'en';

const found = readdirSync(join(process.cwd(), 'src', 'i18n'))
  .filter((name) => /^[a-z]{2}(-[A-Z]{2})?\.json$/.test(name))
  .map((name) => name.slice(0, -5));

if (!found.includes(DEFAULT_LOCALE)) throw new Error(`[i18n] src/i18n/${DEFAULT_LOCALE}.json is missing`);

// Default first, the rest in a stable order.
export const LOCALES = [DEFAULT_LOCALE, ...found.filter((code) => code !== DEFAULT_LOCALE).sort()];

// One entry per locale for getStaticPaths. English has no prefix, so its param is undefined.
export function localeStaticPaths() {
  return LOCALES.map((code) => ({ params: { locale: code === DEFAULT_LOCALE ? undefined : code } }));
}
