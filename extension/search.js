import { search, hl } from "./fuzzy.js";
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

const tabs = (await chrome.tabs.query({ windowType: "normal" })).sort((a, b) => b.lastAccessed - a.lastAccessed);
const items = tabs.map(t => {
  const url = t.url || t.pendingUrl || "";
  return { id: t.id, win: t.windowId, title: t.title || url, url, disp: url.replace(/^https?:\/\/(www\.)?/, "") };
});

let results = [], sel = 0, rows = [];
function row(r) {
  const { tab } = r;
  const img = el("img");
  img.src = chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`);
  // Tabs in another window get a faint card stacked behind the favicon; the words live in the tooltip.
  const fav = el("span", "fav", img);
  if (tab.win !== curWin) { fav.classList.add("away"); fav.title = msg("otherWin"); img.alt = msg("otherWin"); }
  const cut = tab.disp.indexOf("/"), host = cut < 0 ? tab.disp : tab.disp.slice(0, cut);
  return el("li", "", fav,
    el("div", "txt", el("div", "t trunc", hl(tab.title, r.th)),
      el("div", "u trunc", el("span", "host", hl(host, r.uh)), el("span", "path", hl(tab.disp.slice(host.length), r.uh, host.length)))),
    el("span", "go", el("kbd", "", "↵")));
}
function render(keepSel) {
  results = search(items, input.value).slice(0, 200);
  if (!keepSel) sel = !input.value && results.length > 1 ? 1 : 0;
  rows = results.map(row);
  rows.forEach((li, i) => {
    li.onmousemove = () => { if (sel !== i) { sel = i; paint(); } };
    li.onclick = () => go(i);
  });
  list.replaceChildren(...(rows.length ? rows : [el("li", "empty", msg("noMatch"))]));
  count.textContent = results.length === 1 ? msg("countOne") : msg("countMany", [String(results.length)]);
  paint();
}
function paint() {
  rows.forEach((li, i) => li.classList.toggle("on", i === sel));
  rows[sel]?.scrollIntoView({ block: "nearest" });
}
function go(i) {
  const t = results[i]?.tab;
  if (!t) return;
  chrome.tabs.update(t.id, { active: true });
  chrome.windows.update(t.win, { focused: true });
  close();
}
function closeTab() {
  const t = results[sel]?.tab;
  if (!t) return;
  chrome.tabs.remove(t.id);
  items.splice(items.indexOf(t), 1);
  render(true);
  sel = Math.min(sel, results.length - 1);
  paint();
}

input.addEventListener("input", () => render());
input.addEventListener("keydown", e => {
  if (e.key === "Escape") return close();
  if (e.ctrlKey && e.key === "u") { e.preventDefault(); input.value = ""; return render(); }
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
