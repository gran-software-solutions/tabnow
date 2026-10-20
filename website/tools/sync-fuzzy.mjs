// The demo runs the extension's own matching code. extension/fuzzy.js is the source of truth;
// this copies it to src/lib/fuzzy.js (git-ignored) before every dev server, check and build,
// so the site can never drift from what the extension really does.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'src', 'lib'), { recursive: true });
copyFileSync(join(root, '..', 'extension', 'fuzzy.js'), join(root, 'src', 'lib', 'fuzzy.js'));
console.log('sync-fuzzy: extension/fuzzy.js -> src/lib/fuzzy.js');

await import('./sync-playground.mjs');
