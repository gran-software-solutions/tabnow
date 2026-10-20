// Renders the Chrome Web Store images into extension/store/ with headless Chromium:
//   node extension/tools/store-images.mjs [name ...]     (no names = everything)
//   icon-128.png, screenshot-1..5.png (1280 x 800), tile-small.png (440 x 280), tile-marquee.png (1400 x 560)
// The shots run the real search.html / options.html against a fake chrome.* API (store-stub.js) inside
// store-scene.html. Needs `chromium` on PATH and network for the Geist and Instrument Serif web fonts.
// The tab titles and favicons are made up; nothing of anyone's real browsing is used.

import http from 'node:http';
import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const EXT = resolve(HERE, '..');
const OUT = join(EXT, 'store');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const file = u.pathname.startsWith('/ext/') ? join(EXT, u.pathname.slice(5)) : join(HERE, u.pathname);
  if (!file.startsWith(EXT) && !file.startsWith(HERE) || !existsSync(file)) return res.writeHead(404).end();
  let body = readFileSync(file);
  // The two extension pages that need the fake chrome.* API get the stub first.
  if (/\/ext\/(search|options)\.html$/.test(u.pathname)) body = Buffer.from(body.toString().replace('<head>', '<head>\n<script src="/store-stub.js"></script>'));
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const scene = (p) => `${base}/store-scene.html?` + new URLSearchParams(p);
const tile = (p) => `${base}/store-tiles.html?` + new URLSearchParams(p);
const sc = (o) => JSON.stringify(o);

const JOBS = {
  'screenshot-1': [1280, 800, scene({ theme: 'light', zoom: 115, cap: 'Type a few letters. <em>Hit Enter.</em>', s: sc({ q: 'gh pr' }) })],
  'screenshot-2': [1280, 800, scene({ theme: 'light', zoom: 115, cap: 'Bookmarks and history, <em>when you want them.</em>', s: sc({ q: 'design', perms: true }) })],
  'screenshot-3': [1280, 800, scene({ theme: 'light', zoom: 115, cap: 'Every window, <em>most recent first.</em>', s: sc({ q: '' }) })],
  'screenshot-4': [1280, 800, scene({ theme: 'dark', zoom: 115, cap: 'Light and <em>dark.</em>', s: sc({ q: 'tabnow', settings: { theme: 'dark' } }) })],
  'screenshot-5': [1280, 800, scene({ view: 'options', zoom: 85, cap: 'Your keys, your <em>look.</em>', s: sc({ perms: true }) })],
  'tile-small': [440, 280, tile({ size: 'small' })],
  'tile-marquee': [1400, 560, tile({ size: 'marquee' })],
};

mkdirSync(OUT, { recursive: true });
copyFileSync(join(EXT, 'icons', 'icon-128.png'), join(OUT, 'icon-128.png'));
const only = process.argv.slice(2);
for (const [name, [w, h, url]] of Object.entries(JOBS)) {
  if (only.length && !only.includes(name)) continue;
  // Async on purpose: the page is served by this same process, so a blocking spawn would deadlock.
  const code = await new Promise((done) => {
    const c = spawn('chromium', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      `--user-data-dir=${join(tmpdir(), 'tabnow-store-' + process.pid)}`, `--window-size=${w},${h}`, '--virtual-time-budget=6000',
      `--screenshot=${join(OUT, name + '.png')}`, url], { stdio: 'ignore' });
    const t = setTimeout(() => c.kill(), 60000);
    c.on('exit', (s) => { clearTimeout(t); done(s); });
  });
  console.log(code === 0 ? 'wrote' : 'FAILED', name);
}
server.close();
