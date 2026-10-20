// Builds the Chrome Web Store zip from extension/ and runs the ship checks first.
// Usage: node extension/tools/pack-extension.mjs   -> dist/tabnow-<version>.zip (dist/ is not in git)
// Only runtime files go in (a whitelist). tools/, store/, svg sources and anything else stay out.
// The checks work on an in-memory file map so tests can break each one.

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, dirname, posix, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));
export const EXT_DIR = resolve(HERE, '..');
export const ROOT = resolve(EXT_DIR, '..');
export const EXPECTED_PERMISSIONS = ['activeTab', 'favicon', 'scripting', 'storage', 'tabs'];
export const EXPECTED_OPTIONAL = ['bookmarks', 'history'];
const TEXT_EXT = /\.(js|mjs|html|css|json)$/;
// Runtime files only: top-level code and pages, the English messages, the PNG icons.
const SHIP = [/^[\w-]+\.(js|html|css)$/, /^manifest\.json$/, /^_locales\/[\w-]+\/messages\.json$/, /^icons\/icon-\d+\.png$/];
// The one URL the package may hold: the SVG namespace string (not a request).
const ALLOWED_URLS = new Set(['http://www.w3.org/2000/svg']);

export function readTree(dir) {
  const files = new Map();
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else files.set(relative(dir, full).split(sep).join('/'), readFileSync(full));
    }
  };
  walk(dir);
  return files;
}

export const shipped = (all) => new Map([...all].filter(([p]) => SHIP.some((re) => re.test(p))));
const text = (buf) => buf.toString('utf8');
const codeFiles = (files) => [...files].filter(([p]) => TEXT_EXT.test(p));
const manifestOf = (files) => JSON.parse(text(files.get('manifest.json')));
const result = (name, problems) => ({ name, ok: problems.length === 0, detail: problems.join('; ') });

// Each check returns { name, ok, detail }.
export function checkNoNetwork(files) {
  const bad = [];
  const apis = [[/(?<![\w$.])fetch\s*\(/, 'fetch('], [/XMLHttpRequest/, 'XMLHttpRequest'], [/WebSocket/, 'WebSocket'],
    [/sendBeacon/, 'sendBeacon'], [/EventSource/, 'EventSource'], [/importScripts/, 'importScripts'],
    [/(?<![\w$.])eval\s*\(/, 'eval('], [/new\s+Function\s*\(/, 'new Function('], [/\bimport\s*\(\s*['"`]https?:/, 'remote import()']];
  for (const [p, buf] of codeFiles(files)) {
    const body = text(buf);
    for (const [re, label] of apis) if (re.test(body)) bad.push(`${p}: ${label}`);
    for (const m of body.matchAll(/https?:\/\/[^\s'"`)<>]*/g)) if (!ALLOWED_URLS.has(m[0])) bad.push(`${p}: ${m[0]}`);
    if (/<script[^>]+src=["']?(https?:)?\/\//i.test(body)) bad.push(`${p}: remote script tag`);
  }
  return result('no network code, remote code or URLs', bad);
}

export function checkMessages(files) {
  const msgs = files.get('_locales/en/messages.json');
  if (!msgs) return result('i18n keys', ['messages.json missing']);
  const keys = new Set(Object.keys(JSON.parse(text(msgs))));
  const referenced = new Set();
  const literals = new Set();
  for (const [p, buf] of codeFiles(files)) {
    if (p.startsWith('_locales/')) continue;
    const body = text(buf);
    for (const m of body.matchAll(/(?:\bmsg|getMessage)\(\s*['"](\w+)['"]/g)) referenced.add(m[1]);
    for (const m of body.matchAll(/data-m="(\w+)"/g)) referenced.add(m[1]);
    for (const m of body.matchAll(/__MSG_(\w+)__/g)) referenced.add(m[1]);
    for (const m of body.matchAll(/['"](\w+)['"]/g)) literals.add(m[1]); // keys picked at run time, e.g. msg(cond ? "a" : "b")
  }
  const problems = [];
  const missing = [...referenced].filter((k) => !keys.has(k));
  // scope hints are built as msg(NAMES[kind] + "Hint"), so a hint counts as used when its base key is
  const unused = [...keys].filter((k) => !referenced.has(k) && !literals.has(k) && !literals.has(k.replace(/Hint$/, "")));
  if (missing.length) problems.push(`missing: ${missing.join(', ')}`);
  if (unused.length) problems.push(`unused: ${unused.join(', ')}`);
  return result('i18n keys', problems);
}

export function checkManifest(files) {
  const m = manifestOf(files);
  const p = [];
  if (m.manifest_version !== 3) p.push('manifest_version is not 3');
  if (!/^\d+(\.\d+){0,3}$/.test(m.version ?? '')) p.push(`bad version ${m.version}`);
  const msgs = JSON.parse(text(files.get('_locales/en/messages.json') ?? Buffer.from('{}')));
  for (const f of ['name', 'description']) {
    const key = /^__MSG_(\w+)__$/.exec(m[f] ?? '')?.[1];
    const val = key ? msgs[key]?.message : m[f];
    if (!val) p.push(`${f} empty`);
    else if (f === 'description' && val.length > 132) p.push(`description is ${val.length} chars (max 132)`);
    else if (f === 'name' && val.length > 75) p.push('name over 75 chars');
  }
  if (!m.default_locale) p.push('default_locale missing');
  if (!m.icons?.['128']) p.push('128px icon missing');
  const perms = [...(m.permissions ?? [])].sort();
  if (JSON.stringify(perms) !== JSON.stringify(EXPECTED_PERMISSIONS)) p.push(`permissions: ${perms.join(', ')}`);
  const opt = [...(m.optional_permissions ?? [])].sort();
  if (JSON.stringify(opt) !== JSON.stringify(EXPECTED_OPTIONAL)) p.push(`optional_permissions: ${opt.join(', ')}`);
  for (const k of ['host_permissions', 'optional_host_permissions', 'content_scripts', 'externally_connectable', 'content_security_policy', 'update_url', 'key'])
    if (m[k] !== undefined) p.push(`unexpected ${k}`);
  // Every file the manifest points at must be in the zip.
  const refs = new Set([...Object.values(m.icons ?? {}), ...Object.values(m.action?.default_icon ?? {}), m.options_ui?.page, m.background?.service_worker,
    ...(m.web_accessible_resources ?? []).flatMap((w) => w.resources)]);
  for (const r of refs) if (r && !files.has(r)) p.push(`manifest points at missing ${r}`);
  for (const w of m.web_accessible_resources ?? []) if (w.resources.some((r) => r === '*' || r.includes('*'))) p.push('wildcard in web_accessible_resources');
  return result('manifest', p);
}

// Every relative import resolves inside the zip (a missing module only breaks at run time).
export function checkImports(files) {
  const bad = [];
  for (const [p, buf] of codeFiles(files)) {
    if (!/\.m?js$/.test(p)) continue;
    for (const m of text(buf).matchAll(/\bimport\s*(?:[^'"()]*?\bfrom\s*)?['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const t = posix.join(posix.dirname(p), m[1]);
      if (!files.has(t)) bad.push(`${p}: ${m[1]}`);
    }
  }
  return result('imports resolve', bad);
}

export function checkNoStrays(files) {
  const bad = [...files.keys()].filter((p) => /\.(svg|md|map|test\.m?js|sh|py)$|^(tools|store|docs)\//.test(p));
  return result('no sources, tests or store files in the zip', bad);
}

export function runShipChecks(files) {
  return [checkManifest(files), checkNoNetwork(files), checkMessages(files), checkImports(files), checkNoStrays(files)];
}

// --- minimal zip writer (deflate, fixed timestamp so the same input gives the same bytes) ---
export function zip(entries) {
  const chunks = [], central = [];
  let offset = 0;
  const DOS_TIME = 0, DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name), packed = deflateRawSync(data), crc = crc32(data);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6); head.writeUInt16LE(8, 8);
    head.writeUInt16LE(DOS_TIME, 10); head.writeUInt16LE(DOS_DATE, 12); head.writeUInt32LE(crc, 14);
    head.writeUInt32LE(packed.length, 18); head.writeUInt32LE(data.length, 22); head.writeUInt16LE(nameBuf.length, 26);
    chunks.push(head, nameBuf, packed);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10);
    c.writeUInt16LE(DOS_TIME, 12); c.writeUInt16LE(DOS_DATE, 14); c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(packed.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nameBuf.length, 28); c.writeUInt32LE(offset, 42);
    central.push(c, nameBuf);
    offset += 30 + nameBuf.length + packed.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, dir, end]);
}

function main() {
  const all = readTree(EXT_DIR);
  const files = shipped(all);
  let failed = false;
  for (const r of runShipChecks(files)) {
    console.error(`${r.ok ? 'pass' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
    if (!r.ok) failed = true;
  }
  if (failed) {
    console.error('Ship checks failed. No zip written.');
    process.exit(1);
  }
  const { version } = manifestOf(files);
  const out = join(ROOT, 'dist', `tabnow-${version}.zip`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, zip([...files].map(([name, data]) => ({ name, data }))));
  console.error(`wrote ${relative(ROOT, out)} (${files.size} files)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
