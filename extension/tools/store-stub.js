// Fake chrome.* API so search.html and options.html run in a plain page, for the store images only.
// Injected by store-images.mjs; never part of the shipped extension. Scenario: ?s=<json>
//   { q: typed text, down: arrow-down presses, perms: bookmarks+history granted, settings: stored options }
(() => {
  const S = JSON.parse(new URLSearchParams(location.search).get("s") || "{}");
  const FAV = { gh: ["#24292f", "#fff", "G"], li: ["#5e6ad2", "#fff", "L"], fg: ["#f24e1e", "#fff", "F"], gm: ["#d93025", "#fff", "M"], gd: ["#1a73e8", "#fff", "D"], gs: ["#188038", "#fff", "S"], so: ["#f48024", "#fff", "S"], md: ["#1b1b1b", "#fff", "M"], ch: ["#1f5fd6", "#fff", "C"], yt: ["#e62117", "#fff", "Y"], no: ["#1b1b1b", "#fff", "N"], ji: ["#0052cc", "#fff", "J"], aw: ["#232f3e", "#ff9900", "A"], lo: ["#6b7280", "#fff", "L"], rd: ["#ff4500", "#fff", "R"], xx: ["#000", "#fff", "X"], in: ["#0a66c2", "#fff", "in"], vc: ["#000", "#fff", "V"], cl: ["#c4724a", "#fff", "C"], pg: ["#336791", "#fff", "P"], sl: ["#4a154b", "#fff", "S"], sp: ["#1db954", "#fff", "S"], zm: ["#0b5cff", "#fff", "Z"], wi: ["#636466", "#fff", "W"], dr: ["#188038", "#fff", "D"] };
  // [favicon, url without scheme, title, window]; most recently used first. Window 2 is the "other window".
  const TABS = [
    ["gh", "github.com/gran-software-solutions/tabnow/pull/38", "feat: scope prefixes for bookmarks and history · Pull Request #38 · gran-software-solutions/tabnow", 1],
    ["li", "linear.app/gran/issue/GRAN-82/release-checklist", "GRAN-82 Release checklist for the Web Store listing", 1],
    ["fg", "figma.com/design/Kq3x/Tabnow-landing", "TabNow landing – Figma", 2],
    ["gm", "mail.google.com/mail/u/0/#inbox", "Inbox (14) - alex@example.com - Gmail", 1],
    ["gd", "docs.google.com/document/d/1xK/edit", "Q3 planning notes - Google Docs", 1],
    ["so", "stackoverflow.com/questions/5767325", "How can I remove a specific item from an array in JavaScript? - Stack Overflow", 1],
    ["gh", "github.com/gran-software-solutions/tabnow/pull/41", "fix: keep the previous tab preselected after closing a tab · Pull Request #41", 1],
    ["gh", "github.com/gran-software-solutions/consultingcockpit/pull/812", "Add month-close checklist to the timesheet view · Pull Request #812", 2],
    ["gh", "github.com/gran-software-solutions/pigmo/pull/57", "Debounce the pin sync on slow connections · Pull Request #57", 1],
    ["gh", "github.com/pulls", "Pull requests · GitHub", 1],
    ["gh", "github.com/gran-software-solutions/tabnow/issues/29", "Window badge overlaps favicon in dark mode · Issue #29", 1],
    ["md", "developer.mozilla.org/en-US/docs/Web/CSS/color-mix", "color-mix() - CSS: Cascading Style Sheets | MDN", 1],
    ["ch", "developer.chrome.com/docs/extensions/reference/api/tabs", "chrome.tabs | API | Chrome for Developers", 1],
    ["yt", "youtube.com/watch?v=Kx3jQ9", "How Chrome extensions work, in 20 minutes - YouTube", 2],
    ["no", "notion.so/gran/Roadmap-2026-7c1", "Roadmap 2026 | Notion", 1],
    ["ji", "gran.atlassian.net/browse/CC-1042", "[CC-1042] Leave balance wrong after year switch - Jira", 2],
    ["aw", "eu-central-1.console.aws.amazon.com/ec2/home", "EC2 Management Console", 1],
    ["lo", "localhost:3000/dashboard", "Dashboard – Consulting Cockpit (dev)", 1],
    ["rd", "reddit.com/r/chrome_extensions/comments/1abc", "How do you manage 100+ tabs? : r/chrome_extensions", 1],
    ["xx", "x.com/gransoftware", "GRAN Software (@gransoftware) / X", 1],
    ["in", "linkedin.com/company/gran-software-solutions", "GRAN Software Solutions | LinkedIn", 1],
    ["gs", "docs.google.com/spreadsheets/d/9aB/edit", "Invoice tracker 2026 - Google Sheets", 1],
    ["vc", "vercel.com/gran/tabnow-site", "tabnow-site – Overview – Vercel", 1],
    ["cl", "claude.ai/chat/7f2e", "Tab search ranking ideas - Claude", 1],
    ["pg", "postgresql.org/docs/16/indexes.html", "PostgreSQL: Documentation: 16: Chapter 11. Indexes", 1],
    ["sl", "app.slack.com/client/T01/C02", "# design-reviews - GRAN - Slack", 1],
    ["zm", "gran.zoom.us/j/84213", "Weekly sync - Zoom", 1],
    ["wi", "en.wikipedia.org/wiki/Levenshtein_distance", "Levenshtein distance - Wikipedia", 1],
    ["dr", "drive.google.com/drive/folders/1Qa", "Brand assets - Google Drive", 1],
  ];
  const MARKS = [
    ["no", "notion.so/gran/Design-system-4f2", "Design system | Notion"],
    ["gd", "docs.google.com/document/d/2yL/edit", "Design review checklist - Google Docs"],
    ["md", "developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter", "backdrop-filter - CSS: Cascading Style Sheets | MDN"],
    ["ch", "developer.chrome.com/docs/webstore/publish", "Publish in the Chrome Web Store | Chrome for Developers"],
    ["fg", "figma.com/design/Ab1c/Design-tokens", "Design tokens – Figma"],
  ];
  const HIST = [
    ["so", "stackoverflow.com/questions/2417113", "Design pattern for undo history in a web app - Stack Overflow"],
    ["rd", "reddit.com/r/webdev/comments/9xz", "What does your design review process look like? : r/webdev"],
    ["gh", "github.com/gran-software-solutions/pigmo/issues/12", "Design the options page · Issue #12 · gran-software-solutions/pigmo"],
    ["yt", "youtube.com/watch?v=Lm40a", "Design systems in 2026 - YouTube"],
  ];
  const full = u => "https://" + u;
  const now = Date.now();
  const tabs = TABS.map(([k, u, title, w], i) => ({ id: i + 1, windowId: w, url: full(u), title, lastAccessed: now - i * 61000 }));
  const kindOf = new Map([...TABS, ...MARKS, ...HIST].map(([k, u]) => [full(u), k]));

  const msgs = (() => {
    const x = new XMLHttpRequest();
    x.open("GET", "/ext/_locales/en/messages.json", false); x.send();
    return JSON.parse(x.responseText);
  })();
  const stored = Object.assign({ theme: "light" }, S.settings);
  const asyncOf = v => Promise.resolve(v);

  const favicon = url => {
    const [bg, fg, ch] = FAV[kindOf.get(url)] || ["#6b7280", "#fff", "?"];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="7" fill="${bg}"/><text x="16" y="22.5" font-family="Helvetica,Arial,sans-serif" font-size="${ch.length > 1 ? 15 : 18}" font-weight="700" text-anchor="middle" fill="${fg}">${ch}</text></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  };

  window.chrome = {
    i18n: { getMessage: (k, subs) => {
      let m = msgs[k]?.message ?? k;
      [].concat(subs ?? []).forEach((s, i) => { m = m.replace("$" + (i + 1), s); });
      return m;
    } },
    runtime: {
      getURL: p => {
        const m = /pageUrl=([^&]+)/.exec(p);
        return m ? favicon(decodeURIComponent(m[1])) : "/ext/" + p.replace(/^\//, "");
      },
      openOptionsPage() {},
    },
    storage: { sync: {
      get: async name => (typeof name === "string" && name in stored ? { [name]: stored[name] } : {}),
      set: async o => Object.assign(stored, o),
    } },
    tabs: { query: () => asyncOf(tabs.map(t => ({ ...t }))), update() {}, remove() {}, create() {} },
    windows: { update() {} },
    commands: { getAll: async () => [{ name: "_execute_action", shortcut: "Alt+E" }, { name: "previous-tab", shortcut: "Alt+Z" }] },
    permissions: {
      contains: async () => !!S.perms,
      request: async () => true,
      remove: async () => true,
    },
    bookmarks: { getTree: async () => [{ children: MARKS.map(([, u, title]) => ({ url: full(u), title })) }] },
    history: { search: async () => HIST.map(([, u, title], i) => ({ url: full(u), title, lastVisitTime: now - (i + 1) * 3600e3 })) },
  };

  // Type into the real search box once search.js has set itself up.
  if (S.q !== undefined || S.down) {
    setTimeout(() => {
      const input = document.getElementById("q");
      if (!input) return;
      input.value = S.q ?? "";
      if (S.q) input.dispatchEvent(new Event("input", { bubbles: true }));
      for (let i = 0; i < (S.down || 0); i++) input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    }, 600);
  }
})();
