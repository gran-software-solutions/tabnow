import { DEFAULT_CLOSE, fromEvent, caps, loadClose, loadOpacity, loadBlur } from "./keys.js";

const msg = chrome.i18n.getMessage;
document.querySelectorAll("[data-m]").forEach(n => n.textContent = msg(n.dataset.m));
const btn = document.getElementById("close");
let combo = await loadClose(), recording = false;

const reset = document.getElementById("reset");
function show() {
  btn.classList.toggle("on", recording);
  btn.textContent = recording ? msg("optPress") : caps(combo).join(" ");
  reset.hidden = recording || JSON.stringify(combo) === JSON.stringify(DEFAULT_CLOSE); // only once changed
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
reset.addEventListener("click", async () => { await save(DEFAULT_CLOSE); show(); });
show();

// A slider bound to one stored number; fmt turns the value into the label next to it.
function slider(key, value, fmt) {
  const range = document.getElementById(key), out = document.getElementById(key + "Val");
  range.value = value;
  const label = () => {
    out.textContent = fmt(+range.value);
    range.style.setProperty("--p", ((range.value - range.min) / (range.max - range.min)) * 100 + "%");
  };
  label();
  range.addEventListener("input", label);
  range.addEventListener("change", () => chrome.storage.sync.set({ [key]: +range.value }));
}
slider("opacity", await loadOpacity(), v => v + "%");
slider("blur", await loadBlur(), v => (v ? v + " px" : msg("optOff")));
