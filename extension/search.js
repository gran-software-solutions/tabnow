import { search, hl } from "./fuzzy.js";

const params = new URLSearchParams(location.search);
const popup = params.has("popup"), curWin = +params.get("w");
const close = () => popup ? window.close() : parent.postMessage("tabsearch:close", "*");
const msg = chrome.i18n.getMessage;
const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; e.append(...kids); return e; };

const input = document.getElementById("q"), list = document.querySelector("ul");
input.placeholder = msg("placeholder");
document.querySelectorAll("[data-m]").forEach(n => n.textContent = msg(n.dataset.m));

const tabs = (await chrome.tabs.query({ windowType: "normal" })).sort((a, b) => b.lastAccessed - a.lastAccessed);
// Number windows 1..n in the order they were opened (window ids only grow), so a window keeps its
// number between opens; tabs in the current window get no badge.
const winNo = new Map([...new Set(tabs.map(t => t.windowId))].sort((a, b) => a - b).map((id, i) => [id, i + 1]));
const items = tabs.map(t => {
  const url = t.url || t.pendingUrl || "";
  return { id: t.id, win: t.windowId, title: t.title || url, url, disp: url.replace(/^https?:\/\/(www\.)?/, "") };
});

let results = [], sel = 0, rows = [];
function row(r) {
  const { tab } = r;
  const img = el("img", "fav");
  img.src = chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`);
  return el("li", "", img,
    el("div", "txt", el("div", "t trunc", hl(tab.title, r.th)), el("div", "u trunc", hl(tab.disp, r.uh))),
    ...(tab.win !== curWin ? [Object.assign(el("span", "w", "W" + winNo.get(tab.win)), { title: msg("winTitle", [String(winNo.get(tab.win)), String(winNo.get(curWin))]) })] : []));
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
  const n = results.length;
  if (!n) return;
  if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "j")) { sel = (sel + 1) % n; paint(); e.preventDefault(); }
  else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "k")) { sel = (sel - 1 + n) % n; paint(); e.preventDefault(); }
  else if (e.key === "Enter") go(sel);
  else if (e.ctrlKey && e.key === "Backspace") { closeTab(); e.preventDefault(); }
});
if (popup) addEventListener("blur", close);
addEventListener("focus", () => input.focus());
render();
input.focus();
