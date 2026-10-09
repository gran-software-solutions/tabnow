import assert from "node:assert/strict";
import { match, search } from "./extension/fuzzy.js";
import { isMac, DEFAULT_CLOSE, fromEvent, matches, caps, nextTheme } from "./extension/keys.js";

assert.equal(match("zz", "gmail"), null);
assert.deepEqual(match("mai", "gmail").hits, [1, 2, 3]);
assert.ok(match("gm", "gmail").score > match("gl", "gmail").score); // substring beats scattered
assert.deepEqual(match("gl", "gmail").hits, [0, 4]);

const t = (title, disp) => ({ title, disp });
const items = [t("Gmail inbox", "mail.google.com"), t("arXiv paper", "arxiv.org/pdf/1"), t("X list", "x.com/i/lists/1")];
assert.equal(search(items, "").length, 3);
assert.equal(search(items, "arx")[0].tab, items[1]);
assert.equal(search(items, "x list")[0].tab, items[2]);
assert.equal(search(items, "nope").length, 0);
assert.deepEqual(search(items, "mail.google")[0].uh.length, 11); // url match -> url hits
// The "google" case: domain beats a mid-title word, scattered letters don't match at all.
const g = [
  t("Catching Developers in the Flow: Program Repair at Google Scale", "arxiv.org/pdf/2610.07289"),
  t("Search results - someone@example.com - Gmail", "mail.google.com/mail/u/1/#search"),
  t("Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents", "arxiv.org/pdf/2609.00006"),
  t("XA · Kartik on X: \"if you are paying for a coding plan\"", "x.com/code_kartik/status/1"),
];
const r = search(g, "google");
assert.equal(r[0].tab, g[1]);
assert.equal(r.length, 2);
// Close-tab key combos.
const ev = (key, mods = {}) => ({ key, code: /^[a-z]$/i.test(key) ? "Key" + key.toUpperCase() : key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });
assert.ok(matches(ev("Backspace", { [isMac ? "metaKey" : "ctrlKey"]: true }), DEFAULT_CLOSE));
assert.ok(!matches(ev("Backspace"), DEFAULT_CLOSE));
assert.ok(!matches(ev("Backspace", { [isMac ? "metaKey" : "ctrlKey"]: true, shiftKey: true }), DEFAULT_CLOSE));
assert.equal(fromEvent(ev("Control", { ctrlKey: true })), null);
const altD = fromEvent(ev("D", { altKey: true, shiftKey: true }));
assert.ok(matches(ev("d", { altKey: true, shiftKey: true }), altD)); // letter case doesn't matter
assert.deepEqual(caps(DEFAULT_CLOSE), [isMac ? "cmd" : "ctrl", "⌫"]);
const macD = { key: "∂", code: "KeyD", ctrlKey: false, altKey: true, shiftKey: false, metaKey: false }; // Option+D on macOS
assert.ok(matches(macD, { ctrl: false, alt: true, shift: false, meta: false, key: "d" }));
assert.deepEqual(caps(fromEvent(macD)).slice(1), ["d"]);
assert.deepEqual(caps(altD), [isMac ? "opt" : "alt", "shift", "d"]);
assert.deepEqual(["auto", "light", "dark"].map(nextTheme), ["light", "dark", "auto"]);
console.log("ok");
