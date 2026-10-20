import { DEFAULT_LOCALE, LOCALES } from './locales.js';

const files = import.meta.glob('./*.json', { eager: true });
const messages = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.slice(2, -5), mod.default])
);

const warned = new Set();

function lookup(locale, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), messages[locale]);
}

function resolve(locale, key) {
  let value = lookup(locale, key);
  if (value === undefined && locale !== DEFAULT_LOCALE) {
    const id = `${locale}:${key}`;
    if (!warned.has(id)) {
      warned.add(id);
      console.warn(`[i18n] ${locale} is missing "${key}", using ${DEFAULT_LOCALE}`);
    }
    value = lookup(DEFAULT_LOCALE, key);
  }
  // A missing key must break the build, never render the key name.
  if (value === undefined) throw new Error(`[i18n] missing key "${key}" for locale "${locale}"`);
  return value;
}

function fill(text, vars) {
  return text.replace(/\{(\w+)\}/g, (match, name) => {
    if (!(name in vars)) throw new Error(`[i18n] missing variable "${name}" in "${text}"`);
    return String(vars[name]);
  });
}

export function useT(locale = DEFAULT_LOCALE) {
  if (!LOCALES.includes(locale)) throw new Error(`[i18n] unknown locale "${locale}"`);
  return {
    locale,
    t(key, vars = {}) {
      const value = resolve(locale, key);
      if (typeof value !== 'string') throw new Error(`[i18n] "${key}" is not a string`);
      return fill(value, vars);
    },
    list(key) {
      const value = resolve(locale, key);
      if (!Array.isArray(value)) throw new Error(`[i18n] "${key}" is not a list`);
      return value;
    },
  };
}

// English lives at "/", every other locale under "/<locale>/".
export function localePath(locale, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean}`;
}

export function alternates(path = '/') {
  return LOCALES.map((locale) => ({ locale, path: localePath(locale, path) }));
}

export { DEFAULT_LOCALE, LOCALES };
