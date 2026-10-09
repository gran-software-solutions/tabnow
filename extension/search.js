import { search, group, hl, parseScope } from "./fuzzy.js";
import { matches, caps, loadClose, loadOpacity, loadTheme, isDark, nextTheme, loadThemeKey } from "./keys.js";

const params = new URLSearchParams(location.search);
const popup = params.has("popup"), curWin = +params.get("w");
const close = () => popup ? window.close() : parent.postMessage("tabnow:close", "*");
const msg = chrome.i18n.getMessage;
const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; e.append(...kids); return e; };

const input = document.getElementById("q"), list = document.querySelector("ul"), count = document.getElementById("count");
input.placeholder = msg("placeholder");
document.querySelectorAll("[data-m]").forEach(n => n.textContent = msg(n.dataset.m));
input.focus(); // before any await, so typing works the moment the frame has focus
addEventListener("message", e => { if (e.data === "tabnow:focus") { window.focus(); input.focus(); } });
let theme = await loadTheme();
document.documentElement.dataset.theme = params.get("t") ?? (isDark(theme) ? "dark" : "light");
const [closeKey, themeKey, opacity] = await Promise.all([loadClose(), loadThemeKey(), loadOpacity()]); // set on the options page
document.documentElement.style.setProperty("--alpha", opacity / 100);
document.getElementById("closeKeys").textContent = caps(closeKey).join(" ");

// Theme button and key cycle Auto → Light → Dark; the overlay outside the frame restyles its dim and frost to match.
const ICON = {
  auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  dark: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
};
const themeBtn = document.getElementById("themeBtn");
const NAME = { auto: "optAuto", light: "optLight", dark: "optDark" };
function showTheme() {
  themeBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ICON[theme]}</svg>`;
  themeBtn.title = msg("themeTip", [msg(NAME[theme]), caps(themeKey).join(" ")]);
}
function cycleTheme() {
  theme = nextTheme(theme);
  chrome.storage.sync.set({ theme });
  const dark = isDark(theme);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  if (!popup) parent.postMessage({ tabnow: "theme", dark }, "*");
  showTheme();
}
themeBtn.addEventListener("click", () => { cycleTheme(); input.focus(); });
showTheme();

const mk = (kind, url, title, extra) => ({ kind, title: title || url, url, disp: url.replace(/^https?:\/\/(www\.)?/, ""), ...extra });
const flat = n => n.url ? [n] : (n.children ?? []).flatMap(flat);
// Bookmarks and history only exist when the user opted in on the options page.
let granted = false;
const extra = async () => {
  if (!(granted = await chrome.permissions.contains({ permissions: ["history", "bookmarks"] }))) return [[], []];
  return Promise.all([
    chrome.bookmarks.getTree().then(t => t.flatMap(flat)),
    chrome.history.search({ text: "", startTime: Date.now() - 90 * 864e5, maxResults: 2000 }),
  ]);
};
const [tabs, [marks, hist]] = await Promise.all([chrome.tabs.query({ windowType: "normal" }), extra()]);
const tabItems = tabs.sort((a, b) => b.lastAccessed - a.lastAccessed).map(t => {
  const url = t.url || t.pendingUrl || "";
  return mk("tab", url, t.title, { id: t.id, win: t.windowId });
});
const seen = new Set(tabItems.map(t => t.url));
const bookmarks = marks.filter(b => !seen.has(b.url)).map(b => mk("bookmark", b.url, b.title));
bookmarks.forEach(b => seen.add(b.url));
const history = hist.filter(h => h.url && !seen.has(h.url)).sort((a, b) => b.lastVisitTime - a.lastVisitTime).map(h => mk("history", h.url, h.title));
const items = [...tabItems, ...bookmarks, ...history];
const CAPS = { bookmark: 20, history: 30 };
const GLYPH = {
  tab: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 11h18M8 7V4h8v3"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};

const glyph = (k, n) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${GLYPH[k]}</svg>`;
const NAMES = { tab: "scopeTab", bookmark: "scopeBookmark", history: "scopeHistory" };
const off = k => k !== "tab" && !granted;

let results = [], sel = 0, rows = [], scope = null, menu = [], msel = 0;
const chip = document.getElementById("chip"), menuEl = el("div", "menu");
function setScope(k) {
  scope = k;
  chip.innerHTML = k ? glyph(k, 14) : "";
  if (k) chip.append(msg(NAMES[k]));
  closeMenu();
  render();
}
function closeMenu() { menu = []; menuEl.remove(); }
function showMenu(opts) {
  menu = opts; msel = Math.min(msel, opts.length - 1);
  menuEl.replaceChildren(...opts.map((s, i) => {
    const d = el("div", (i === msel ? "on " : "") + (off(s.kind) ? "off" : ""), el("code", "", "/" + s.code), Object.assign(el("i"), { innerHTML: glyph(s.kind, 14) }), msg(NAMES[s.kind]),
      el("span", "", msg(off(s.kind) ? "scopeOff" : NAMES[s.kind] + "Hint")));
    d.onmousedown = e => { e.preventDefault(); input.value = ""; setScope(s.kind); input.focus(); };
    return d;
  }));
  input.parentNode.append(menuEl);
}
function row(r) {
  const { tab } = r;
  const img = el("img");
  img.src = chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`);
  // Tabs in another window get a faint card stacked behind the favicon; the words live in the tooltip.
  const fav = el("span", "fav", img);
  if (tab.kind === "tab" && tab.win !== curWin) { fav.classList.add("away"); fav.title = msg("otherWin"); img.alt = msg("otherWin"); }
  const cut = tab.disp.indexOf("/"), host = cut < 0 ? tab.disp : tab.disp.slice(0, cut);
  const kind = tab.kind === "tab" ? "" : el("span", "kind");
  if (kind) { kind.title = msg(tab.kind === "bookmark" ? "kindBookmark" : "kindHistory"); kind.innerHTML = glyph(tab.kind, 12); }
  return el("li", "", fav,
    el("div", "txt", el("div", "t trunc", kind, hl(tab.title, r.th)),
      el("div", "u trunc", el("span", "host", hl(host, r.uh)), el("span", "path", hl(tab.disp.slice(host.length), r.uh, host.length)))),
    el("span", "go", el("kbd", "", "↵")));
}
function render(keepSel) {
  const q = input.value; // unscoped, an empty query lists tabs only
  results = scope ? search(items.filter(i => i.kind === scope), q).slice(0, 200)
    : group(search(q.trim() ? items : tabItems, q), CAPS).slice(0, 200);
  if (!keepSel) sel = !input.value && !scope && results.length > 1 ? 1 : 0;
  const mixed = results.some(r => r.tab.kind !== "tab"), heads = !scope && q.trim() && mixed;
  let last, kids = [];
  rows = results.map(row);
  rows.forEach((li, i) => {
    li.onmousemove = () => { if (sel !== i) { sel = i; paint(); } };
    li.onclick = () => go(i);
  });
  rows.forEach((li, i) => {
    const k = results[i].tab.kind;
    if (heads && k !== last) kids.push(el("li", "sec", msg(k === "tab" ? "secTab" : NAMES[k])));
    last = k; kids.push(li);
  });
  const none = scope && off(scope) ? msg("scopeOffEmpty", [msg(NAMES[scope]).toLowerCase()]) : msg(scope && scope !== "tab" ? "noResults" : "noMatch");
  list.replaceChildren(...(kids.length ? kids : [el("li", "empty", none)]));
  const n = String(results.length);
  count.textContent = scope && off(scope) ? "" : results.length === 1 ? msg(mixed ? "countOneResult" : "countOne") : msg(mixed ? "countManyResults" : "countMany", [n]);
  paint();
}
function paint() {
  rows.forEach((li, i) => li.classList.toggle("on", i === sel));
  rows[sel]?.scrollIntoView({ block: "nearest" });
}
function go(i) {
  const t = results[i]?.tab;
  if (!t) return;
  if (t.kind !== "tab") chrome.tabs.create({ url: t.url, windowId: curWin });
  else {
  chrome.tabs.update(t.id, { active: true });
  chrome.windows.update(t.win, { focused: true });
  }
  close();
}
function closeTab() {
  const t = results[sel]?.tab;
  if (t?.kind !== "tab") return;
  chrome.tabs.remove(t.id);
  items.splice(items.indexOf(t), 1);
  tabItems.splice(tabItems.indexOf(t), 1);
  render(true);
  sel = Math.min(sel, results.length - 1);
  paint();
}

input.addEventListener("input", () => {
  const p = parseScope(input.value);
  if (p.kind) { input.value = p.rest; return setScope(p.kind); }
  if (p.menu?.length && !scope) { msel = 0; return showMenu(p.menu); }
  closeMenu();
  render();
});
input.addEventListener("keydown", e => {
  if (menu.length) {
    const down = e.key === "ArrowDown" || (e.ctrlKey && e.key === "j"), up = e.key === "ArrowUp" || (e.ctrlKey && e.key === "k");
    if (down || up) { msel = (msel + (down ? 1 : menu.length - 1)) % menu.length; showMenu(menu); return e.preventDefault(); }
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); input.value = ""; return setScope(menu[msel].kind); }
    if (e.key === "Escape") { e.preventDefault(); input.value = ""; closeMenu(); return render(); }
  }
  if (e.key === "Escape") return close();
  if (e.key === "Backspace" && !input.value && scope) { e.preventDefault(); return setScope(null); }
  if (e.ctrlKey && e.key === "u") { e.preventDefault(); if (!input.value) scope = null, chip.innerHTML = ""; input.value = ""; closeMenu(); return render(); }
  if (matches(e, themeKey)) { e.preventDefault(); return cycleTheme(); }
  const n = results.length;
  if (!n) return;
  if (matches(e, closeKey)) { e.preventDefault(); return closeTab(); } // first, so a custom key wins
  if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "j")) { sel = (sel + 1) % n; paint(); e.preventDefault(); }
  else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "k")) { sel = (sel - 1 + n) % n; paint(); e.preventDefault(); }
  else if (e.key === "Enter") go(sel);
});
if (popup) addEventListener("blur", close);
addEventListener("focus", () => input.focus());
render();
input.focus();
