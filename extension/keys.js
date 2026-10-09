// A key combo is { ctrl, alt, shift, meta, key }: letters and digits from the physical key (KeyboardEvent.code, lowercase), anything else KeyboardEvent.key.
export const isMac = navigator.userAgentData?.platform === "macOS" || /Mac/.test(navigator.platform);
export const DEFAULT_CLOSE = { ctrl: !isMac, alt: false, shift: false, meta: isMac, key: "Backspace" };
const MODS = ["ctrl", "alt", "shift", "meta"];
const NAMES = { Backspace: "⌫", Delete: "del", Enter: "↵", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", " ": "space" };

// Option+D types "∂" on macOS, so letters and digits come from e.code.
const norm = e => {
  const m = /^(?:Key([A-Z])|Digit(\d))$/.exec(e.code ?? "");
  return m ? (m[1] ?? m[2]).toLowerCase() : e.key.length === 1 ? e.key.toLowerCase() : e.key;
};

// Combo from a keydown, or null while only modifiers are held.
export function fromEvent(e) {
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return null;
  return { ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey, meta: e.metaKey, key: norm(e) };
}

export const matches = (e, c) =>
  norm(e) === c.key && e.ctrlKey === c.ctrl && e.altKey === c.alt && e.shiftKey === c.shift && e.metaKey === c.meta;

// Key labels, lowercase, e.g. ["ctrl", "⌫"] or ["alt", "shift", "d"].
const MAC = { meta: "cmd", alt: "opt" };
export const caps = c => [...MODS.filter(m => c[m]).map(m => (isMac && MAC[m]) || m), NAMES[c.key] ?? c.key.toLowerCase()];

// Panel opacity in percent, set on the options page.
export const DEFAULT_OPACITY = 86;
export async function loadOpacity() {
  try { return (await chrome.storage.sync.get("opacity")).opacity ?? DEFAULT_OPACITY; }
  catch { return DEFAULT_OPACITY; }
}

// Blur of the page behind the panel in px (the dimmed page gets an eighth of it), set on the options page.
export const DEFAULT_BLUR = 24;
export async function loadBlur() {
  try { return (await chrome.storage.sync.get("blur")).blur ?? DEFAULT_BLUR; }
  catch { return DEFAULT_BLUR; }
}

// Theme: "auto" (follow the system), "light" or "dark", set on the options page.
export async function loadTheme() {
  try { return (await chrome.storage.sync.get("theme")).theme ?? "auto"; }
  catch { return "auto"; }
}
export const isDark = theme => theme === "dark" || (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);

export const nextTheme = t => ({ auto: "light", light: "dark", dark: "auto" })[t] ?? "auto";

// Stored key combos, set on the options page.
export const DEFAULT_THEME_KEY = { ctrl: false, alt: true, shift: false, meta: false, key: "t" };
async function loadKey(name, def) {
  try { return (await chrome.storage.sync.get(name))[name] ?? def; }
  catch { return def; }
}
export const loadClose = () => loadKey("closeKey", DEFAULT_CLOSE);
export const loadThemeKey = () => loadKey("themeKey", DEFAULT_THEME_KEY);
