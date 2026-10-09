// A key combo is { ctrl, alt, shift, meta, key } with key as KeyboardEvent.key (letters lowercased).
export const DEFAULT_CLOSE = { ctrl: true, alt: false, shift: false, meta: false, key: "Backspace" };
const MODS = ["ctrl", "alt", "shift", "meta"];
const NAMES = { Backspace: "⌫", Delete: "del", Enter: "↵", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", " ": "space" };

const norm = k => (k.length === 1 ? k.toLowerCase() : k);

// Combo from a keydown, or null while only modifiers are held.
export function fromEvent(e) {
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return null;
  return { ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey, meta: e.metaKey, key: norm(e.key) };
}

export const matches = (e, c) =>
  norm(e.key) === c.key && e.ctrlKey === c.ctrl && e.altKey === c.alt && e.shiftKey === c.shift && e.metaKey === c.meta;

// Key labels, lowercase, e.g. ["ctrl", "⌫"] or ["alt", "shift", "d"].
export const caps = c => [...MODS.filter(m => c[m]), NAMES[c.key] ?? c.key.toLowerCase()];

// Panel opacity in percent, set on the options page.
export const DEFAULT_OPACITY = 86;
export async function loadOpacity() {
  try { return (await chrome.storage.sync.get("opacity")).opacity ?? DEFAULT_OPACITY; }
  catch { return DEFAULT_OPACITY; }
}

export async function loadClose() {
  try { return (await chrome.storage.sync.get("closeKey")).closeKey ?? DEFAULT_CLOSE; }
  catch { return DEFAULT_CLOSE; }
}
