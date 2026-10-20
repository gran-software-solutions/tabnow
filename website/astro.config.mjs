import { defineConfig } from 'astro/config';
import { DEFAULT_LOCALE, LOCALES } from './src/i18n/locales.js';

// SITE_URL overrides it for a build.
const site = process.env.SITE_URL || 'https://tabnow.app';

// dummies/ holds the click dummies (design history). It is outside src/ and public/, so Astro
// never builds it; tools/check-dist.mjs also fails the build if it shows up in dist/.
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
    routing: { prefixDefaultLocale: false },
  },
});
