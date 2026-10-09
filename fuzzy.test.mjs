import assert from "node:assert/strict";
import { match, search } from "./extension/fuzzy.js";

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
console.log("ok");
