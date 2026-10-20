// Fake chrome.* API for the playground on the home page. Copied next to the extension's real
// search.html / search.js by tools/sync-playground.mjs; never part of the shipped extension.
// The panel runs in an iframe inside the fake browser. The fake browser (src/playground/playground.js)
// owns the tabs, bookmarks and history and offers them as window.parent.__tn; this file only answers
// the chrome.* calls search.js makes and forwards the global shortcuts that the real extension
// receives from Chrome itself (open/close and previous tab).
(() => {
  const P = parent.__tn;
  const msgs = window.__tnMsgs;
  const stored = { theme: new URLSearchParams(location.search).get("t") || "light" };

  window.chrome = {
    i18n: { getMessage: (k, subs) => {
      let m = msgs[k]?.message ?? k;
      [].concat(subs ?? []).forEach((s, i) => { m = m.replace("$" + (i + 1), s); });
      return m;
    } },
    runtime: {
      getURL: p => {
        const m = /pageUrl=([^&]+)/.exec(p);
        return m ? P.favicon(decodeURIComponent(m[1])) : p;
      },
      openOptionsPage() {},
    },
    storage: { sync: {
      get: async name => (typeof name === "string" && name in stored ? { [name]: stored[name] } : {}),
      set: async o => Object.assign(stored, o),
    } },
    tabs: {
      query: async () => P.tabs(),
      update: async (id) => P.activate(id),
      remove: async (id) => P.closeTab(id),
      create: async ({ url }) => P.openUrl(url),
    },
    windows: { update: async () => {} },
    permissions: { contains: async () => true, request: async () => true, remove: async () => true },
    bookmarks: { getTree: async () => [{ children: P.bookmarks() }] },
    history: { search: async () => P.history() },
  };

  // Alt+E / Cmd+E and Alt+Z are Chrome commands in the real extension, so they work from inside the panel too.
  addEventListener("keydown", e => {
    if (P.isToggle(e)) { e.preventDefault(); P.toggle(); }
    else if (P.isPrevious(e)) { e.preventDefault(); P.previous(); }
  }, true);
})();
