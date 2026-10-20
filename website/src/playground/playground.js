// The playground: a fake browser around the extension's real panel.
// This file owns the made-up browser (tabs, windows, address bar, page) and answers the panel's
// chrome.* calls through window.__tn (see tools/playground-stub.js). The panel itself is the
// extension's own search.html / search.js, copied to /playground/ext/ at build time.
import { SITES, TABS, BOOKMARKS, HISTORY } from './data.js';

const root = document.querySelector('[data-pg]');
if (root) init(root);

function init(root) {
  const S = JSON.parse(root.dataset.s);
  const win = root.querySelector('[data-win]');
  const $ = (sel) => root.querySelector(sel);
  const strip = $('[data-strip]'), pageEl = $('[data-page]'), urlEl = $('[data-url]'), marksEl = $('[data-marks]');
  const pill = $('[data-winpill]'), card = $('[data-card]');
  const html = document.documentElement;
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent);
  const fill = (s, n) => s.replace('{n}', n);

  // Mac visitors get Cmd+E in every place the text says Alt+E.
  if (mac) {
    $('[data-line]').textContent = S.lineMac;
    $('[data-hint-text]').textContent = S.hintMac;
    root.querySelector('[data-mod]').textContent = S.keyMac;
    win.setAttribute('aria-label', S.labelMac);
  }

  /* ---------- the fake browser's data ---------- */
  const full = (key, path) => 'https://' + SITES[key][0] + path;
  const strip0 = (u) => u.replace(/^https?:\/\//, '');
  const svgCache = new Map();
  const info = new Map(); // url -> { key, title }
  for (const [k, p, title] of [...TABS, ...BOOKMARKS, ...HISTORY]) info.set(full(k, p), { key: k, title });

  function favicon(url) {
    if (svgCache.has(url)) return svgCache.get(url);
    const site = SITES[info.get(url)?.key];
    const [bg, fg, ch] = site ? [site[1], site[2], site[3]] : ['#c3c8d0', '#fff', ''];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="7" fill="${bg}"/><text x="16" y="22.5" font-family="Helvetica,Arial,sans-serif" font-size="${ch.length > 1 ? 15 : 18}" font-weight="700" text-anchor="middle" fill="${fg}">${ch}</text></svg>`;
    const uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
    svgCache.set(url, uri);
    return uri;
  }

  const now = Date.now();
  let uid = 1;
  const tabs = TABS.map(([k, p, title, w], i) => ({ id: uid++, url: full(k, p), title, windowId: w, lastAccessed: now - i * 61000 }));
  let cur = 1; // window shown
  const active = { 1: tabs[0].id, 2: tabs.find((t) => t.windowId === 2).id };
  const inWin = (w) => tabs.filter((t) => t.windowId === w);
  const byId = (id) => tabs.find((t) => t.id === id);
  const windows = () => [...new Set(tabs.map((t) => t.windowId))].sort();

  /* ---------- tab strip, address bar, bookmarks, window pill ---------- */
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const X = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  function renderStrip() {
    strip.innerHTML = inWin(cur).map((t) =>
      `<button class="pg-tab${t.id === active[cur] ? ' on' : ''}" type="button" tabindex="-1" data-id="${t.id}"><b class="sep"></b><span class="in"><img src="${favicon(t.url)}" alt=""><span class="ttl">${esc(t.title)}</span><span class="x" data-x="${t.id}" role="button" aria-label="${esc(S.closeTab)}">${X}</span></span></button>`
    ).join('');
  }
  function renderBar() {
    const t = byId(active[cur]);
    const u = strip0(t.url), cut = u.search(/[/?#]/);
    urlEl.innerHTML = cut < 0 ? `<b>${esc(u)}</b>` : `<b>${esc(u.slice(0, cut))}</b>${esc(u.slice(cut))}`;
  }
  function renderPill() {
    const ws = windows();
    pill.hidden = ws.length < 2;
    if (ws.length < 2) return;
    const other = ws.find((w) => w !== cur);
    pill.innerHTML = `<span class="wi"></span>${esc(fill(S.windowName, cur))}<span class="of">/ ${ws.length}</span>`;
    pill.title = fill(S.windowSwitch, other);
    pill.dataset.other = other;
  }
  const BAR = [5, 6, 7, 15, 0, 4, 11, 12, 23];
  function renderMarks() {
    marksEl.innerHTML = BAR.map((i) => {
      const [k, p, title] = BOOKMARKS[i];
      const u = full(k, p), short = title.split(/ [-–|·] |: /)[0].replace('gran-software-solutions/', '');
      return `<button class="pg-mk" type="button" tabindex="-1" data-url="${esc(u)}"><img src="${favicon(u)}" alt=""><span>${esc(short)}</span></button>`;
    }).join('') + `<span class="pg-mk all"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/></svg><span>${esc(S.allBookmarks)}</span></span>`;
  }
  function renderAll() {
    renderStrip(); renderBar(); renderPill();
    const t = byId(active[cur]);
    pageEl.innerHTML = page(t);
  }

  /* ---------- browser actions (what chrome.tabs.* would do) ---------- */
  function activate(id) {
    const t = byId(id);
    if (!t) return;
    t.lastAccessed = Date.now();
    cur = t.windowId;
    active[cur] = id;
    renderAll();
  }
  function closeTab(id) {
    const t = byId(id);
    if (!t) return;
    const peers = inWin(t.windowId), i = peers.indexOf(t);
    tabs.splice(tabs.indexOf(t), 1);
    if (!tabs.length) { // never leave a browser without a tab
      tabs.push({ id: uid++, url: 'chrome://newtab/', title: S.newTab, windowId: 1, lastAccessed: Date.now() });
    }
    if (active[t.windowId] === id) {
      const left = inWin(t.windowId);
      if (left.length) active[t.windowId] = (left[Math.min(i, left.length - 1)]).id;
    }
    if (!inWin(cur).length) cur = windows()[0];
    renderAll();
  }
  function openUrl(url, title) {
    const meta = info.get(url);
    const t = { id: uid++, url, title: title ?? meta?.title ?? url, windowId: cur, lastAccessed: Date.now() };
    tabs.splice(tabs.indexOf(byId(active[cur])) + 1, 0, t);
    activate(t.id);
  }

  /* ---------- the TabNow overlay (same layers as overlay() in extension/background.js) ---------- */
  let panel = null;
  const isDark = () => html.dataset.theme === 'dark';
  function paint(p, dark) {
    p.scrim.style.background = dark ? 'rgb(0 0 0/.32)' : 'rgb(20 24 32/.12)';
    p.scrim.style.backdropFilter = 'blur(3px)';
    p.frost.style.backdropFilter = 'blur(24px) saturate(1.3) brightness(' + (dark ? '.7' : '1.15') + ')';
    p.frame.style.colorScheme = dark ? 'dark' : 'light'; // same scheme as the page inside, or the iframe turns opaque
  }
  function openPanel() {
    if (panel) return;
    const el = document.createElement('div');
    el.className = 'pg-ov';
    el.innerHTML = '<div class="scrim"></div><div class="box frost"></div><iframe class="box"></iframe>';
    const [scrim, frost, frame] = el.children;
    frame.title = S.panel;
    const p = (panel = { el, scrim, frost, frame });
    paint(p, isDark());
    frame.src = `/playground/ext/search.html?w=${cur}&t=${isDark() ? 'dark' : 'light'}`;
    scrim.addEventListener('click', closePanel);
    frame.addEventListener('load', () => {
      frame.focus();
      frame.contentWindow?.postMessage('tabnow:focus', '*');
    });
    win.append(el);
    win.focus({ preventScroll: true }); // takes focus away from any button; the frame grabs it on load
  }
  function closePanel() {
    if (!panel) return;
    panel.el.remove();
    panel = null;
    win.focus({ preventScroll: true });
  }
  addEventListener('message', (e) => {
    if (!panel || e.source !== panel.frame.contentWindow) return;
    if (e.data === 'tabnow:close') closePanel();
    else if (e.data?.tabnow === 'theme') paint(panel, e.data.dark);
  });
  const toggle = () => (panel ? closePanel() : openPanel());
  function previous() {
    const [, prev] = [...tabs].sort((a, b) => b.lastAccessed - a.lastAccessed);
    closePanel();
    if (prev) activate(prev.id);
  }

  // Space opens it (only once the window is clicked, so scrolling the page with Space still works): browser and extension shortcuts always need Ctrl, Alt or Cmd, so nothing
  // installed (TabNow itself included) can catch it first. Alt+E / Cmd+E work too when nothing else takes them.
  // Alt+Z flips to the previous tab. Letters come from the physical key (Option+E types a dead accent key on a Mac).
  const noCtrl = (e) => !e.ctrlKey && !e.shiftKey;
  const isSpace = (e) => e.code === 'Space' && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
  const isToggle = (e) => e.code === 'KeyE' && noCtrl(e) && ((e.altKey && !e.metaKey) || (e.metaKey && !e.altKey));
  const isPrevious = (e) => e.code === 'KeyZ' && noCtrl(e) && e.altKey && !e.metaKey;

  window.__tn = {
    tabs: () => tabs.map((t) => ({ ...t })),
    bookmarks: () => BOOKMARKS.map(([k, p, title]) => ({ url: full(k, p), title })),
    history: () => HISTORY.map(([k, p, title, h]) => ({ url: full(k, p), title, lastVisitTime: now - h * 3600e3 })),
    favicon, activate, closeTab, openUrl, toggle, previous, isToggle, isPrevious,
  };

  // Keys are only taken while the visitor is in the window (focus inside, or the pointer over it),
  // so the rest of the page keeps all its own shortcuts.
  document.addEventListener('keydown', (e) => {
    const inside = root.contains(document.activeElement) || win.matches(':hover');
    if (!inside) return;
    if (isToggle(e) || (isSpace(e) && !panel && root.contains(document.activeElement))) { e.preventDefault(); e.stopPropagation(); toggle(); }
    else if (isPrevious(e)) { e.preventDefault(); e.stopPropagation(); previous(); }
    else if (e.key === 'Escape' && panel) { e.preventDefault(); closePanel(); }
  }, true);

  /* ---------- mouse ---------- */
  strip.addEventListener('click', (e) => {
    const x = e.target.closest('[data-x]');
    if (x) return closeTab(+x.dataset.x);
    const tab = e.target.closest('[data-id]');
    if (tab) activate(+tab.dataset.id);
  });
  marksEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-url]');
    if (b) openUrl(b.dataset.url);
  });
  $('[data-newtab]').addEventListener('click', () => openUrl('chrome://newtab/', S.newTab));
  pill.addEventListener('click', () => { const w = +pill.dataset.other; if (w) activate(active[w]); });
  root.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', toggle));

  // Hover card with the full title, like Chrome's.
  let hoverTimer = 0;
  strip.addEventListener('mouseover', (e) => {
    const tab = e.target.closest('[data-id]');
    clearTimeout(hoverTimer);
    if (!tab) return (card.hidden = true);
    hoverTimer = setTimeout(() => {
      const t = byId(+tab.dataset.id);
      if (!t) return;
      const w = win.getBoundingClientRect(), r = tab.getBoundingClientRect();
      card.innerHTML = `<b>${esc(t.title)}</b><span>${esc(strip0(t.url).split(/[/?#]/)[0])}</span>`;
      card.hidden = false;
      card.style.left = Math.max(8, Math.min(r.left - w.left, w.width - 268)) + 'px';
    }, tab.classList.contains('on') ? 500 : 300);
  });
  strip.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); card.hidden = true; });
  strip.addEventListener('click', () => (card.hidden = true));

  /* ---------- mock pages: grey bars where text would be ---------- */
  function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
  const bars = (r, n, a = 45, b = 98, cls = 'l') => Array.from({ length: n }, () => `<i class="${cls}" style="width:${Math.round(a + r() * (b - a))}%"></i>`).join('');
  const rows = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

  function top(site) {
    const [host, bg, fg, ch] = SITES[site];
    return `<div class="pp-top"><span class="pp-logo" style="background:${bg};color:${fg}">${esc(ch)}</span><b>${esc(host)}</b><i class="pp-find"></i><span class="pp-grow"></span><i class="pp-btn"></i><span class="pp-av"></span></div>`;
  }
  const heading = (title) => esc(title.replace(/ · Pull Request.*| · Issue.*| - Stack Overflow$| - Google (Docs|Sheets)$/, ''));

  const LAYOUT = {
    pr: (t, r) => `<div class="pp-main"><h1 class="pp-h">${heading(t.title)}</h1>
      <div class="pp-row"><i class="pp-pill"></i><i class="l" style="width:300px;margin:0"></i></div>
      <div class="pp-tabs"><i></i><i></i><i></i><i></i></div>
      <div class="pp-cols"><div>
        <div class="pp-box"><span class="pp-av"></span><div>${bars(r, 3)}</div></div>
        <div class="pp-diff"><div class="fh"></div>${rows(13, (i) => `<div class="r ${[3, 4, 5, 9, 10].includes(i) ? 'a' : i === 7 ? 'x' : ''}"><i style="width:${30 + Math.round(r() * 60)}%"></i></div>`)}</div>
      </div><div>${bars(r, 4, 40, 90, 'l d')}<div style="height:18px"></div>${bars(r, 5, 40, 90)}</div></div></div>`,
    mail: (t, r) => `<div class="pp-mail"><div class="pp-nav"><div class="compose"></div>${rows(8, (i) => `<div class="n${i === 0 ? ' on' : ''}"><i style="width:${50 + Math.round(r() * 50)}px"></i></div>`)}</div>
      <div class="pp-list">${rows(14, (i) => `<div class="m${i < 5 ? ' u' : ''}"><i style="width:110px"></i><i class="f" style="max-width:${40 + Math.round(r() * 45)}%"></i><i class="f" style="max-width:${5 + Math.round(r() * 20)}%;opacity:.6"></i><i style="width:40px;margin-left:auto"></i></div>`)}</div></div>`,
    doc: (t, r) => `<div class="pp-doc"><div class="rail">${bars(r, 3, 40, 80, 'l d')}<div style="height:12px"></div>${bars(r, 9, 40, 90)}</div>
      <div class="art"><h1 class="pp-h">${heading(t.title)}</h1><div style="height:10px"></div>${bars(r, 3)}<div class="pp-code">${bars(r, 4, 25, 75)}</div>${bars(r, 6)}</div></div>`,
    sheet: (t, r) => `<div class="pp-sheet"><div class="fx"><i style="width:120px"></i><i style="width:260px"></i></div><div class="pp-grid">${rows(8 * 16, (n) => {
      const c = n % 8, rr = Math.floor(n / 8);
      if (rr === 0 || c === 0) return `<div class="h"><i style="width:${c ? 24 : 12}px"></i></div>`;
      return `<div><i${c % 3 === 0 ? ' class="r"' : ''}></i></div>`;
    })}</div></div>`,
    qa: (t, r) => `<div class="pp-qa"><div class="v"><i></i><b></b><i></i></div><div><h1 class="pp-h">${heading(t.title)}</h1>
      <div style="height:6px"></div>${bars(r, 4)}<div class="pp-code">${bars(r, 5, 25, 80)}</div>${bars(r, 3)}</div><div class="side">${bars(r, 6, 40, 90)}</div></div>`,
    figma: (t, r) => `<div class="pp-figma"><div class="layers">${rows(14, (i) => `<div class="n" style="padding-left:${(i % 4 === 0 ? 0 : 14)}px"><i style="width:${50 + Math.round(r() * 60)}px"></i></div>`)}</div>
      <div class="cv"><i class="c1" style="left:60px;top:50px;width:300px;height:240px"></i><i class="c2" style="left:400px;top:50px;width:300px;height:380px"></i><i style="left:60px;top:330px;width:300px;height:140px"></i><i style="left:740px;top:50px;width:120px;height:240px"></i></div>
      <div class="props">${bars(r, 3, 40, 90, 'l d')}<div style="height:12px"></div>${bars(r, 8, 30, 90)}</div></div>`,
    board: (t, r) => `<div class="pp-board">${rows(4, (c) => `<div class="col"><i></i>${rows(4 - (c % 2), () => `<div class="kc">${bars(r, 2, 50, 95)}<em></em></div>`)}</div>`)}</div>`,
    video: (t, r) => `<div class="pp-video"><div><div class="player"></div><h1 class="pp-h" style="font-size:20px;margin-top:16px">${heading(t.title)}</h1>
      <div class="up"><span class="pp-av"></span><i class="l" style="width:160px;margin:0"></i></div></div>
      <div>${rows(6, () => `<div class="th"><i></i><div>${bars(r, 2, 60, 95)}${bars(r, 1, 30, 50, 'l s')}</div></div>`)}</div></div>`,
    chat: (t, r) => `<div class="pp-chat"><div class="rail">${bars(r, 3, 40, 80, 'l d')}<div style="height:10px"></div>${bars(r, 9, 40, 90)}</div>
      <div class="msgs">${rows(6, () => `<div class="msg"><span class="pp-av"></span><div>${bars(r, 1, 18, 30, 'l d')}${bars(r, 2, 50, 95)}</div></div>`)}</div></div>`,
    plain: (t, r) => `<div class="pp-plain"><div class="ban"></div><h1 class="pp-h">${heading(t.title)}</h1><div style="height:8px"></div>${bars(r, 3)}
      <div class="cards">${rows(3, () => `<div>${bars(r, 4, 40, 95)}</div>`)}</div></div>`,
  };
  function page(t) {
    if (t.url.startsWith('chrome://')) return '<div class="pp-new"><i class="bg1"></i><i class="box"></i></div>';
    const site = info.get(t.url)?.key ?? 'cc';
    const kind = SITES[site][4];
    return top(site) + LAYOUT[kind](t, rng(t.id * 7 + 3));
  }

  renderMarks();
  renderAll();
}
