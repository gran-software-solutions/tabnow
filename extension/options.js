import { DEFAULT_CLOSE, DEFAULT_THEME_KEY, fromEvent, caps, loadClose, loadThemeKey, loadOpacity, loadBlur, loadTheme } from "./keys.js";

const msg = chrome.i18n.getMessage;
document.querySelectorAll("[data-m]").forEach(n => n.textContent = msg(n.dataset.m));
// A key recorder: click the button, press a combination, it is stored under key. Reset shows once changed.
function recorder(id, key, combo, def) {
  const btn = document.getElementById(id), reset = document.getElementById(id + "Reset");
  let recording = false;
  const show = () => {
    btn.classList.toggle("on", recording);
    btn.textContent = recording ? msg("optPress") : caps(combo).join(" ");
    reset.hidden = recording || JSON.stringify(combo) === JSON.stringify(def);
  };
  const save = async c => { combo = c; await chrome.storage.sync.set({ [key]: c }); show(); };
  btn.addEventListener("click", () => { recording = !recording; show(); });
  btn.addEventListener("keydown", e => {
    if (!recording) return;
    e.preventDefault();
    if (e.key === "Escape") { recording = false; return show(); }
    const c = fromEvent(e);
    if (!c) return;
    recording = false;
    save(c);
  });
  btn.addEventListener("blur", () => { recording = false; show(); });
  reset.addEventListener("click", () => save(def));
  show();
}
recorder("close", "closeKey", await loadClose(), DEFAULT_CLOSE);
recorder("themeKey", "themeKey", await loadThemeKey(), DEFAULT_THEME_KEY);

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
const theme = await loadTheme();
document.querySelectorAll("#theme input").forEach(r => {
  r.checked = r.value === theme;
  r.addEventListener("change", () => chrome.storage.sync.set({ theme: r.value }));
});

slider("opacity", await loadOpacity(), v => v + "%");
slider("blur", await loadBlur(), v => (v ? v + " px" : msg("optOff")));
