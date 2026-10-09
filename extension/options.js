import { DEFAULT_CLOSE, fromEvent, caps, loadClose } from "./keys.js";

const msg = chrome.i18n.getMessage;
document.querySelectorAll("[data-m]").forEach(n => n.textContent = msg(n.dataset.m));
const btn = document.getElementById("close");
let combo = await loadClose(), recording = false;

function show() {
  btn.classList.toggle("on", recording);
  btn.replaceChildren(...(recording ? [msg("optPress")] : caps(combo).map(c => Object.assign(document.createElement("kbd"), { textContent: c }))));
}
async function save(c) { combo = c; await chrome.storage.sync.set({ closeKey: c }); }

btn.addEventListener("click", () => { recording = !recording; show(); });
btn.addEventListener("keydown", async e => {
  if (!recording) return;
  e.preventDefault();
  if (e.key === "Escape") { recording = false; return show(); }
  const c = fromEvent(e);
  if (!c) return;
  recording = false;
  await save(c);
  show();
});
btn.addEventListener("blur", () => { recording = false; show(); });
document.getElementById("reset").addEventListener("click", async () => { await save(DEFAULT_CLOSE); show(); });
show();
