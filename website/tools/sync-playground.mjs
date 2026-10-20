// The playground on the home page runs the extension's real panel (search.html + search.js) inside a
// fake browser. This copies those files to public/playground/ext/ (git-ignored) before every dev
// server, check and build, so the playground can never drift from the extension. Only two things are
// changed in the copy: search.html gets the fake chrome.* API in front of search.js, and the
// extension's English texts are turned into a script (no network call needed to read them).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ext = join(root, '..', 'extension');
const out = join(root, 'public', 'playground', 'ext');
mkdirSync(out, { recursive: true });

for (const file of ['search.js', 'search.css', 'keys.js', 'fuzzy.js']) copyFileSync(join(ext, file), join(out, file));
copyFileSync(join(root, 'tools', 'playground-stub.js'), join(out, 'stub.js'));

const messages = JSON.parse(readFileSync(join(ext, '_locales', 'en', 'messages.json'), 'utf8'));
writeFileSync(join(out, 'messages.js'), `window.__tnMsgs = ${JSON.stringify(messages)};\n`);

const marker = '<script type="module" src="search.js"></script>';
let html = readFileSync(join(ext, 'search.html'), 'utf8');
if (!html.includes(marker)) throw new Error('sync-playground: search.html no longer has the search.js script tag; update tools/sync-playground.mjs');
html = html
  .replace('<head>', '<head>\n<meta name="robots" content="noindex">')
  .replace(marker, `<script src="messages.js"></script>\n<script src="stub.js"></script>\n${marker}`);
writeFileSync(join(out, 'search.html'), html);
console.log('sync-playground: extension/search.{html,js,css}, keys.js, fuzzy.js, _locales -> public/playground/ext/');
