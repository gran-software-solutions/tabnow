// The live demo in the hero and the live previews in the Themes section.
// Matching and highlighting are the extension's own code (extension/fuzzy.js, copied into
// src/lib/ by tools/sync-fuzzy.mjs), so the demo ranks tabs exactly like the real thing.
import { search, hl } from '../lib/fuzzy.js';
import { FAV, TABS } from '../data/tabs.js';
import { gmailScene, prScene } from './scenes.js';

const $ = s => document.querySelector(s);
const html = document.documentElement;
const hero = $("#top"), panel = $("#panel"), input = $("#q"), rowsEl = $("#rows"), nEl = $("#n");
const S = hero.dataset; // texts come from the page (i18n), never hardcoded here
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);
const ROWS = 4, CW = 168, CH = 58, PITCH = 84, TOP0 = 92, GAP = 36, TYPED = "gh pr";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) html.classList.add("rm");

/* favicon + row builders shared by panel and theme previews */
const favEl = (k, cls = "fav") => { const [bg, fg, ch] = FAV[k], i = document.createElement("i"); i.className = cls; i.style.cssText = `background:${bg};color:${fg}`; i.textContent = ch; return i; };
function rowEl(r, on, done, away) {
  const t = r.tab, li = document.createElement("li");
  if (on) li.className = "on";
  if (done) li.classList.add("done");
  const fv = favEl(t.k); if (away) fv.classList.add("away"); li.append(fv);
  const txt = document.createElement("div"); txt.className = "txt";
  const a = document.createElement("div"); a.className = "t trunc"; a.append(hl(t.title, r.th));
  const u = document.createElement("div"); u.className = "u trunc";
  const h = document.createElement("span"); h.className = "host"; h.append(hl(t.host, r.uh));
  const p = document.createElement("span"); p.className = "path"; p.append(hl(t.path, r.uh, t.host.length));
  u.append(h, p); txt.append(a, u);
  const go = document.createElement("span"); go.className = "go"; go.textContent = done ? S.switched : "↵";
  li.append(txt, go); return li;
}

/* Desk layout. Four columns of cells around the panel; the right inner column is the match column,
   so its cells beside the panel are left out. Same cells in both states, only jitter differs. */
let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
let L = null; // { cx, inX, outX, cells }
function buildCells() {
  seed = 11;
  const W = hero.clientWidth, cx = W / 2, hr = hero.getBoundingClientRect(), pr = rowsEl.getBoundingClientRect();
  // keep clear only the stretch where the match cards sit (beside the four panel rows), so no other card can peek out from behind them
  const pTop = pr.top - hr.top - 14, pBot = pr.bottom - hr.top + 14;
  const colsX = [cx - 300 - GAP - CW - 20 - CW, cx - 300 - GAP - CW, cx + 300 + GAP, cx + 300 + GAP + CW + 20];
  const cells = [], band = [];
  for (let r = 0; r < 9; r++) colsX.forEach((x, c) => {
    const y = TOP0 + r * PITCH;
    if (c === 2 && y + CH > pTop && y < pBot) { band.push({ x, y }); return; }
    cells.push({ x, y });
  });
  // deterministic shuffle so the desk looks scattered, not sorted
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  // the four tabs that win "gh pr" start in the match column's free cells, so they glide a short way
  const hot = new Set(search(TABS, TYPED).slice(0, ROWS).map(r => r.tab)), inner = band.slice(0, ROWS), rest = cells;
  let hi = 0, ri = 0;
  TABS.forEach(t => { t.cell = (hot.has(t) ? inner[hi++] : rest[ri++]) || null; /* no free cell (very short window): card stays hidden, never piles onto another */ t.jx = (rnd() - .5) * 10; t.jy = (rnd() - .5) * 14; t.jr = (rnd() - .5) * 4.4; });
  L = { matchX: cx + 300 + GAP };
}

/* cards */

const cards = TABS.map((t, i) => {
  const el = document.createElement("div");
  el.className = "card"; el.dataset.i = i; t.el = el;
  el.append(favEl(t.k));
  el.insertAdjacentHTML("beforeend", '<div class="txt"><div class="t trunc"></div><div class="u trunc"></div></div><span class="rk"></span>');
  el.querySelector(".t").textContent = t.title; el.querySelector(".u").textContent = t.host;
  hero.append(el);
  return el;
});

/* state */
let results = [], sel = 1, winStart = 0, busy = false, doneTab = null, resetTimer = 0, autoTyping = false, heroVisible = true;
const alive = () => TABS.filter(t => t.alive);

function update() {
  const q = input.value.trim(), list = alive();
  results = q ? search(list, q) : list.map(tab => ({ tab, th: [], uh: [] }));
  sel = Math.max(0, Math.min(sel, results.length - 1));
  if (sel < winStart) winStart = sel; if (sel >= winStart + ROWS) winStart = sel - ROWS + 1;
  winStart = Math.max(0, Math.min(winStart, Math.max(0, results.length - ROWS)));
  rowsEl.replaceChildren();
  if (!results.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = S.empty; rowsEl.append(li); }
  results.slice(winStart, winStart + ROWS).forEach((r, i) => {
    const idx = winStart + i, li = rowEl(r, idx === sel, busy && r.tab === doneTab);
    li.addEventListener("click", () => { sel = idx; commit(); });
    li.addEventListener("mousemove", () => { if (!busy && sel !== idx) { sel = idx; update(); } });
    rowsEl.append(li);
  });
  nEl.textContent = q ? (results.length > ROWS ? fill(S.count, { n: sel + 1, total: results.length }) : fill(S.count, { n: results.length, total: list.length })) : "";
  layout(q);
}

/* Place every card. Matches sit beside their panel row, same vertical centre; the rest rest on their cells. */
function layout(q) {
  if (!L) buildCells();
  const hr = hero.getBoundingClientRect(), lis = [...rowsEl.children];
  const slotOf = new Map();
  if (q) results.slice(winStart, winStart + ROWS).forEach((r, i) => { if (lis[i] && !lis[i].classList.contains("empty")) slotOf.set(r.tab, i); });
  for (const t of TABS) {
    const el = t.el, i = slotOf.get(t);
    if (!t.alive) continue;
    const isSlot = i !== undefined, cur = results[sel]?.tab === t;
    el.classList.toggle("slot", isSlot);
    el.classList.toggle("dim", !!q && !isSlot);
    el.classList.toggle("on", !!q && isSlot && (busy ? t === doneTab : cur));
    el.classList.toggle("lift", busy && t === doneTab);
    if (isSlot) {
      const b = lis[i].getBoundingClientRect();
      const h = b.height - 8; el.style.height = h + "px";
      el.style.setProperty("--x", L.matchX + "px"); el.style.setProperty("--y", b.top - hr.top + 4 + "px"); el.style.setProperty("--r", "0deg");
      el.querySelector(".rk").textContent = i + 1;
    } else if (!t.cell) {
      el.style.height = ""; el.style.visibility = "hidden";
    } else {
      el.style.height = ""; el.style.visibility = "";
      const calm = !!q;
      el.style.setProperty("--x", t.cell.x + (calm ? 0 : t.jx) + "px"); el.style.setProperty("--y", t.cell.y + (calm ? 0 : t.jy) + "px"); el.style.setProperty("--r", (calm ? 0 : t.jr) + "deg");
    }
    const key = isSlot ? q + "|" + winStart + "|" + i : "";
    if (el._k !== key) {
      el._k = key;
      const r = isSlot ? results[winStart + i] : null, tt = el.querySelector(".t"), uu = el.querySelector(".u");
      if (r) { tt.replaceChildren(hl(t.title, r.th)); uu.replaceChildren(hl(t.host, r.uh)); }
      else { tt.textContent = t.title; uu.textContent = t.host; }
    }
  }
}

function commit() {
  const r = results[sel]; if (!r || busy) return;
  busy = true; doneTab = r.tab; update();
  resetTimer = setTimeout(reset, 1500);
}
function reset() {
  clearTimeout(resetTimer); busy = false; doneTab = null;
  input.value = TYPED; sel = 0; winStart = 0; update();
  if (heroVisible && scrollY < 300) input.focus({ preventScroll: true });
}
function clearQuery() {
  clearTimeout(resetTimer); busy = false; doneTab = null;
  input.value = ""; sel = 1; winStart = 0; update();
}
function closeTab() {
  const r = results[sel]; if (!r || busy) return;
  const t = r.tab; t.alive = false; t.el.style.opacity = 0; t.el.style.pointerEvents = "none"; t.el.classList.remove("slot", "on");
  update();
}
input.addEventListener("input", () => { sel = input.value.trim() ? 0 : 1; winStart = 0; update(); });
cards.forEach(el => {
  const t = TABS[+el.dataset.i];
  el.addEventListener("mouseenter", () => { if (busy) return; const i = results.findIndex(r => r.tab === t); if (i >= 0 && input.value.trim() && sel !== i) { sel = i; update(); } });
  el.addEventListener("click", () => { if (busy) return; const i = results.findIndex(r => r.tab === t); if (i >= 0) { sel = i; commit(); } });
});

/* auto-type "gh pr" at human speed; any key or click takes over */
function autoType() {
  if (reduced) { input.value = TYPED; sel = 0; update(); return; }
  autoTyping = true;
  if (scrollY < 300) input.focus({ preventScroll: true });
  let n = 0;
  const step = () => {
    if (!autoTyping) return;
    n++; input.value = TYPED.slice(0, n); sel = 0; update();
    if (n < TYPED.length) setTimeout(step, 110 + rnd() * 170 + (TYPED[n] === " " ? 90 : 0));
    else autoTyping = false;
  };
  setTimeout(step, 400);
}
hero.addEventListener("pointerdown", () => { autoTyping = false; });

/* keys */
new IntersectionObserver(([e]) => { heroVisible = e.intersectionRatio > .45; if (!heroVisible && document.activeElement === input) input.blur(); }, { threshold: [0, .45, 1] }).observe(hero);
addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if ((e.altKey && e.code === "KeyE") || ((e.ctrlKey || e.metaKey) && k === "e")) { e.preventDefault(); autoTyping = false; scrollTo({ top: 0 }); input.focus({ preventScroll: true }); input.select(); return; }
  const ae = document.activeElement;
  if (ae !== input && !(ae === document.body && heroVisible)) return;
  if (autoTyping && !["shift", "control", "alt", "meta", "tab"].includes(k)) autoTyping = false;
  if (busy) { if (k === "escape") clearQuery(); else if (["arrowdown", "arrowup", "enter"].includes(k)) e.preventDefault(); return; }
  if (k === "arrowdown" || (e.ctrlKey && k === "j")) { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); update(); }
  else if (k === "arrowup" || (e.ctrlKey && k === "k")) { e.preventDefault(); sel = Math.max(sel - 1, 0); update(); }
  else if (k === "enter") { e.preventDefault(); commit(); }
  else if (e.ctrlKey && k === "backspace") { e.preventDefault(); closeTab(); }
  else if (e.ctrlKey && k === "u") { e.preventDefault(); clearQuery(); }
  else if (k === "escape") { clearQuery(); }
});

/* themes section: live previews driven by opacity, blur and size */
const box = $("#themesBox"), sliders = { opacity: $("#o-opacity"), blur: $("#o-blur"), size: $("#o-size") };
const DEF = { opacity: 86, blur: 24, size: 100 };
function applyOpts() {
  const o = +sliders.opacity.value, b = +sliders.blur.value, s = +sliders.size.value;
  box.style.setProperty("--alpha", o / 100); box.style.setProperty("--blur", b + "px"); box.style.setProperty("--zoom", s / 100);
  $("#o-opacity-v").textContent = o + "%"; $("#o-blur-v").textContent = b ? b + " px" : S.off; $("#o-size-v").textContent = s + "%";
}
Object.values(sliders).forEach(el => el.addEventListener("input", applyOpts));
$("#o-reset").addEventListener("click", () => { for (const k in sliders) sliders[k].value = DEF[k]; applyOpts(); });
for (const bd of document.querySelectorAll(".backdrop")) {
  // A real page behind the panel so the opacity and blur sliders show: Gmail by day, a GitHub pull request by night.
  bd.innerHTML = (bd.closest(".canvas").dataset.theme === "dark" ? prScene : gmailScene)();
}
const staticRes = search(TABS, TYPED);
for (const b of document.querySelectorAll("[data-static]")) {
  b.querySelector(".n").textContent = fill(S.count, { n: staticRes.length, total: TABS.length });
  staticRes.slice(0, 3).forEach((r, i) => b.querySelector("ul").append(rowEl(r, i === 0)));
}
applyOpts();

/* boot: cards settle, then the typing starts */
update(); // builds the cells once the panel rows exist
const settle = [];
cards.forEach((el, i) => {
  const d = reduced ? 0 : 250 + i * 37 + (i % 5) * 60;
  setTimeout(() => el.classList.add("in"), d);
  settle.push(d);
});
document.fonts.ready.then(() => { L = null; update(); });
addEventListener("resize", () => { L = null; update(); });
setTimeout(autoType, reduced ? 0 : Math.max(...settle) + 900);

/* ---- moments: scroll-in rises, and the three panels that are not the hero ----
   Everything is visible by default. Motion is only armed when scripts and IntersectionObserver
   run, and anything already in view is left alone. Reduced motion gets no motion at all. */
const canMove = !reduced && "IntersectionObserver" in window;
const nearBottom = (el, f = .9) => el.getBoundingClientRect().top < innerHeight * f;
if (canMove) {
  const els = [...document.querySelectorAll("[data-reveal]")];
  els.filter(el => nearBottom(el, .94)).forEach(el => el.classList.add("in"));
  html.classList.add("rv");
  const seen = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add("in"); seen.unobserve(e.target); }
  }), { rootMargin: "0px 0px -6% 0px" });
  els.filter(el => !el.classList.contains("in")).forEach(el => seen.observe(el));
}
/* play(): calls fn when el scrolls into the lower part of the screen; stop(): when it leaves */
function whenInView(el, on, off) {
  new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off && off()), { rootMargin: "0px 0px -18% 0px" }).observe(el);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

/* 1. Type less: the extension's own ranking, typed out once when scrolled into view */
const mq = $("#mFuzzyQ"), mn = $("#mFuzzyN"), mr = $("#mFuzzyRows");
function drawFuzzy(q) {
  const res = q ? search(TABS, q) : [];
  mq.textContent = q;
  mr.replaceChildren(...res.slice(0, 4).map((r, i) => rowEl(r, i === 0)));
  mn.textContent = q ? fill(S.count, { n: res.length, total: TABS.length }) : "";
}
drawFuzzy(TYPED);
if (canMove) {
  let played = false;
  whenInView($("#mFuzzy"), () => {
    if (played) return; played = true;
    let n = 0; drawFuzzy("");
    const step = () => { n++; drawFuzzy(TYPED.slice(0, n)); if (n < TYPED.length) setTimeout(step, 230 + (TYPED[n] === " " ? 120 : 0)); };
    setTimeout(step, 450);
  });
}

/* 2. Every window: rows appear one by one (other windows carry the small badge), then "/" opens the scope list */
const WIN = [[0, 0], [1, 1], [2, 1], [3, 0], [4, 1]];
const winRows = WIN.map(([i, away], k) => rowEl({ tab: TABS[i], th: [], uh: [] }, k === 0, false, away));
$("#mWinRows").append(...winRows);
const winQ = $("#mWinQ"), winMenu = $("#mWinMenu"), winScopes = [...winMenu.children];
if (canMove) {
  let played = false;
  whenInView($("#mWin"), async () => {
    if (played) return; played = true;
    winRows.forEach(li => li.classList.add("pre")); winMenu.classList.add("pre");
    winScopes.forEach((d, i) => d.classList.toggle("on", i === 0));
    await wait(500);
    for (const li of winRows) { li.classList.remove("pre"); await wait(520); }
    await wait(500);
    winQ.classList.remove("ph"); winQ.textContent = "/";
    await wait(380);
    winMenu.classList.remove("pre");
    await wait(1100);
    winScopes.forEach((d, i) => d.classList.toggle("on", i === 1));
    await wait(1000);
    winScopes.forEach((d, i) => d.classList.toggle("on", i === 2));
  });
}

/* 3. Back and forth: Alt+Z flips between the last two tabs. The keys go down, the active tab flips,
   the page cross-fades. Loops gently while the panel is in view. */
const BACK = [0, 1], STRIP = [0, 1, 2, 3, 11], tabsEl = $("#mBackTabs"), pageEl = $("#mBackPage"), keysEl = $("#mBackKeys");
const stripEls = STRIP.map(i => {
  const t = TABS[i], d = document.createElement("div"); d.className = "tab"; d.append(favEl(t.k));
  const s = document.createElement("span"); s.className = "trunc"; s.textContent = t.title; d.append(s); tabsEl.append(d); return d;
});
const pgs = BACK.map(i => {
  const t = TABS[i], p = document.createElement("div"), u = document.createElement("div"), h = document.createElement("div"), sk = document.createElement("div");
  p.className = "pg"; u.className = "url"; u.textContent = t.disp; h.className = "pt"; h.textContent = t.title; sk.className = "sk"; sk.innerHTML = "<i></i><i></i><i></i><i></i>";
  p.append(u, h, sk); pageEl.append(p); return p;
});
const [kAlt, kZ] = keysEl.children;
let cur = 0;
function showBack(k) {
  cur = k;
  stripEls.forEach((el, j) => el.classList.toggle("on", STRIP[j] === BACK[k]));
  pgs.forEach((p, j) => p.classList.toggle("on", j === k));
}
showBack(0);
if (canMove) {
  let inView = false, looping = false;
  async function loop() {
    if (looping) return; looping = true;
    await wait(900);
    while (inView) {
      if (!document.hidden) {
        kAlt.classList.add("dn"); await wait(220);
        kZ.classList.add("dn"); await wait(160);
        showBack(cur ^ 1); await wait(260);
        kZ.classList.remove("dn"); await wait(160);
        kAlt.classList.remove("dn");
      }
      await wait(2100);
    }
    kAlt.classList.remove("dn"); kZ.classList.remove("dn"); looping = false;
  }
  whenInView($("#mBack"), () => { inView = true; loop(); }, () => { inView = false; });
}
