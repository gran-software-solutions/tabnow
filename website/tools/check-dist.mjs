// Checks on the built site in dist/. No dependencies.
// Env: STRICT=1 to fail on [[TODO: ...]] markers.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
// Hosts a link may point to. TabNow is not a shop: no payment hosts.
const ALLOWED_HOSTS = new Set([
  'chromewebstore.google.com', 'github.com', 'www.gransoftware.de', 'gransoftware.de',
  'opensource.org',
]);
const strict = process.env.STRICT === '1';
const errors = [];
const warnings = [];

if (!existsSync(dist)) {
  console.error('check-dist: dist/ not found. Run the build first.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(dist);
const pages = files.filter((file) => file.endsWith('.html'));
const siteHost = (() => {
  const canonical = readFileSync(join(dist, 'index.html'), 'utf8').match(/rel="canonical" href="([^"]+)"/);
  return canonical ? new URL(canonical[1]).host : '';
})();

function internalTarget(path) {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (clean === '') return true;
  const full = join(dist, clean);
  if (clean.endsWith('/')) return existsSync(join(full, 'index.html'));
  return existsSync(full);
}

for (const file of pages) {
  const name = relative(dist, file);
  const html = readFileSync(file, 'utf8');

  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)) {
    const href = match[1];
    if (href.startsWith('#') || href.startsWith('mailto:')) continue;
    if (href.startsWith('/')) {
      if (!internalTarget(href)) errors.push(`${name}: broken internal link ${href}`);
      continue;
    }
    let url;
    try { url = new URL(href); } catch { errors.push(`${name}: unreadable link ${href}`); continue; }
    if (url.protocol !== 'https:') errors.push(`${name}: link is not https: ${href}`);
    else if (!ALLOWED_HOSTS.has(url.host) && url.host !== siteHost) errors.push(`${name}: external host not on the allow-list: ${url.host}`);
  }

  // Same-page anchors must exist.
  for (const match of html.matchAll(/<a\b[^>]*\shref="#([\w-]+)"/g)) {
    if (!new RegExp(`\\sid="${match[1]}"`).test(html)) errors.push(`${name}: anchor #${match[1]} has no target`);
  }

  // Nothing may load from another origin: no remote scripts, styles, images, fonts or frames.
  for (const match of html.matchAll(/<(?:script|img|iframe|source|video|audio)\b[^>]*\ssrc="(https?:)?\/\/[^"]*"/g)) {
    errors.push(`${name}: remote resource: ${match[0].slice(0, 80)}`);
  }
  for (const match of html.matchAll(/<link\b[^>]*rel="(?:stylesheet|preload|preconnect|dns-prefetch)"[^>]*href="(?:https?:)?\/\/[^"]*"/g)) {
    errors.push(`${name}: remote resource: ${match[0].slice(0, 80)}`);
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(html)) errors.push(`${name}: Google Fonts must not be used`);

  if (/\bundefined\b|\[object /.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) errors.push(`${name}: template hole ("undefined" or "[object")`);

  const todos = html.match(/\[\[TODO:[^\]]*\]\]/g);
  if (todos) (strict ? errors : warnings).push(`${name}: ${todos.length} TODO marker(s), first: ${todos[0]}`);
  const placeholders = html.match(/PLACEHOLDER[\w-]*/g);
  if (placeholders) (strict ? errors : warnings).push(`${name}: ${placeholders.length} placeholder link(s), first: ${placeholders[0]}`);
}

// Remote requests from CSS and JS bundles: fonts and demo must stay self-contained.
for (const file of files.filter((f) => /\.(css|js)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/url\(\s*["']?(https?:)?\/\/[^)]*\)/g)) errors.push(`${relative(dist, file)}: remote url() ${match[0].slice(0, 80)}`);
  if (/\b(fetch|XMLHttpRequest|sendBeacon)\b/.test(text)) errors.push(`${relative(dist, file)}: network call in a script (the demo must not talk to anything)`);
}

// The home page carries the Install button, the demo and the theme toggle.
const home = readFileSync(join(dist, 'index.html'), 'utf8');
for (const marker of ['data-install', 'id="panel"', 'data-theme-toggle', 'application/ld+json', 'og:image']) {
  if (!home.includes(marker)) errors.push(`index.html: missing ${marker}`);
}
// Self-hosted fonts must ship.
for (const font of ['ibm-plex-sans-latin-wght-normal', 'ibm-plex-mono-latin-400-normal', 'ibm-plex-mono-latin-500-normal', 'instrument-serif-latin-400-normal', 'instrument-serif-latin-400-italic']) {
  if (!existsSync(join(dist, 'fonts', `${font}.woff2`))) errors.push(`missing font fonts/${font}.woff2`);
}
// The click dummies are design history and must not be published.
if (existsSync(join(dist, 'dummies'))) errors.push('dummies/ must not be in dist/');

for (const required of ['404.html', 'sitemap.xml', 'robots.txt', 'llms.txt', 'og.png', 'privacy/index.html', 'imprint/index.html']) {
  if (!existsSync(join(dist, required))) errors.push(`missing ${required}`);
}

if (warnings.length > 0) console.warn('check-dist: warnings\n' + warnings.map((line) => `  - ${line}`).join('\n'));
if (errors.length > 0) {
  console.error(`check-dist: ${errors.length} problem(s)\n` + errors.map((line) => `  - ${line}`).join('\n'));
  process.exit(1);
}
console.log(`check-dist: ok (${pages.length} pages)`);
