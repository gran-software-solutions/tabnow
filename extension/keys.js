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

// Keycap labels, e.g. ["ctrl", "⌫"].
export const caps = c => [...MODS.filter(m => c[m]), NAMES[c.key] ?? c.key.toUpperCase()];

export async function loadClose() {
  try { return (await chrome.storage.sync.get("closeKey")).closeKey ?? DEFAULT_CLOSE; }
  catch { return DEFAULT_CLOSE; }
}
