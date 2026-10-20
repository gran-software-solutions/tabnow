// Source checks, run before the build. No dependencies.
// 1. every i18n key used in code exists   2. every key in en.json is used
// 3. other locales add no unknown keys     4. no hardcoded visible text in .astro files
// 5. a shipped locale is complete          6. every legal page exists in every locale
// 7. the demo uses the extension's current fuzzy.js and colours
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function leaves(node, prefix = '') {
  if (Array.isArray(node) || typeof node !== 'object' || node === null) return [prefix];
  return Object.entries(node).flatMap(([key, value]) => leaves(value, prefix ? `${prefix}.${key}` : key));
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const en = readJson(join(src, 'i18n', 'en.json'));
const enKeys = new Set(leaves(en));

// src/lib/fuzzy.js is a generated copy of the extension's file, not our code.
const codeFiles = walk(src).filter((file) => /\.(astro|js|mjs|ts)$/.test(file) && !file.includes(`${join(src, 'lib')}/`));
const used = new Set();
const usedPrefixes = new Set();

for (const file of codeFiles) {
  const text = readFileSync(file, 'utf8');
  const name = relative(root, file);

  // Direct calls must resolve.
  for (const match of text.matchAll(/\b(?:t|list|items)\(\s*['"]([\w.]+)['"]/g)) {
    used.add(match[1]);
    if (!enKeys.has(match[1])) errors.push(`${name}: i18n key "${match[1]}" does not exist in en.json`);
  }
  // Keys passed around as plain strings.
  for (const match of text.matchAll(/['"]([a-z]\w*(?:\.\w+)+)['"]/g)) {
    if (enKeys.has(match[1])) used.add(match[1]);
  }
  // Dynamic keys, e.g. t(`legal.${slug}`): the whole prefix counts as used.
  for (const match of text.matchAll(/\bt\(\s*`([\w.]+\.)\$\{/g)) usedPrefixes.add(match[1]);
}

for (const key of enKeys) {
  const viaPrefix = [...usedPrefixes].some((prefix) => key.startsWith(prefix));
  // List items are reached through their list key, which is what the code uses.
  const viaList = [...used].some((u) => key.startsWith(`${u}.`));
  if (!used.has(key) && !viaPrefix && !viaList) errors.push(`en.json: key "${key}" is never used`);
}

for (const file of readdirSync(join(src, 'i18n')).filter((name) => name.endsWith('.json') && name !== 'en.json')) {
  for (const key of leaves(readJson(join(src, 'i18n', file)))) {
    if (!enKeys.has(key)) errors.push(`${file}: key "${key}" does not exist in en.json`);
  }
}

// A locale exists the moment its JSON lands, so a half-translated file would publish itself.
// Complete or not shipped, nothing in between. (English only for now.)
const locales = readdirSync(join(src, 'i18n'))
  .filter((name) => /^[a-z]{2}(-[A-Z]{2})?\.json$/.test(name))
  .map((name) => name.slice(0, -5));

for (const locale of locales.filter((code) => code !== 'en')) {
  const keys = new Set(leaves(readJson(join(src, 'i18n', `${locale}.json`))));
  for (const key of enKeys) {
    if (!keys.has(key)) errors.push(`${locale}.json: "${key}" is missing. A shipped locale falls back to English silently, so it must be complete`);
  }
}

// The same for legal text.
const legal = join(src, 'legal');
const slugs = readdirSync(join(legal, 'en')).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3));
for (const locale of locales) {
  for (const slug of slugs) {
    if (!existsSync(join(legal, locale, `${slug}.md`))) errors.push(`legal/${locale}/${slug}.md is missing, but ${locale} is a shipped locale`);
  }
}
for (const dir of readdirSync(legal)) {
  if (!locales.includes(dir)) errors.push(`legal/${dir}/ has no src/i18n/${dir}.json, so nothing renders it`);
}

// The demo runs the extension's own matching code: the copy in src/lib must be current.
const fuzzySrc = join(root, '..', 'extension', 'fuzzy.js');
const fuzzyCopy = join(src, 'lib', 'fuzzy.js');
if (!existsSync(fuzzyCopy)) errors.push('src/lib/fuzzy.js is missing. Run npm run sync');
else if (readFileSync(fuzzySrc, 'utf8') !== readFileSync(fuzzyCopy, 'utf8')) errors.push('src/lib/fuzzy.js differs from extension/fuzzy.js. Run npm run sync');

// Light and dark are the extension's colours: every hex value in search.css must be in global.css.
const searchCss = readFileSync(join(root, '..', 'extension', 'search.css'), 'utf8');
const globalCss = readFileSync(join(src, 'styles', 'global.css'), 'utf8').toLowerCase();
for (const hex of new Set(searchCss.match(/#[0-9a-fA-F]{6}\b/g) ?? [])) {
  if (!globalCss.includes(hex.toLowerCase())) errors.push(`global.css: colour ${hex} from extension/search.css is missing`);
}

// Hardcoded text: strip everything that is not a template text node, then look for words.
function textNodes(source) {
  let body = source.replace(/^---[\s\S]*?\n---/, '');
  body = body.replace(/<(style|script)[\s\S]*?<\/\1>/g, '');
  body = body.replace(/<!--[\s\S]*?-->/g, '');
  let out = '';
  let depth = 0;
  for (const char of body) {
    if (char === '{') depth += 1;
    else if (char === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) out += char;
  }
  return out.replace(/<[^>]*>/g, ' ');
}

for (const file of codeFiles.filter((name) => name.endsWith('.astro'))) {
  const words = textNodes(readFileSync(file, 'utf8')).match(/\p{L}{2,}/gu);
  if (words) errors.push(`${relative(root, file)}: hardcoded text "${words.slice(0, 5).join(' ')}". Move it to src/i18n/en.json`);
}

if (errors.length > 0) {
  console.error(`check-source: ${errors.length} problem(s)\n` + errors.map((line) => `  - ${line}`).join('\n'));
  process.exit(1);
}
console.log(`check-source: ok (${enKeys.size} keys, ${codeFiles.length} files)`);
