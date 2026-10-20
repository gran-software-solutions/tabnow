# TabNow landing page: brief

## Product (facts, from `extension/` and README)
- Chrome/Chromium extension (Chrome 121+, Edge, Brave, Opera, Vivaldi, Arc). Version 0.1.0. MIT. Made by GRAN Software Solutions.
- `Ctrl+E` (`Cmd+E` on macOS) opens a frosted, centered overlay on the current page. Type, `Enter`, you are on the tab.
- Searches all open tabs in all windows. Most recently used first; previous tab preselected, so `Ctrl+E` `Enter` flips back.
- `Alt+Z` jumps to the previous tab without opening anything.
- Fuzzy matching: space-separated words must all match. Domain ranks above title, title above rest of URL. Matched letters highlighted.
- Tabs from other windows get a small window badge on their favicon.
- `/` scopes: `/t` Tabs, `/b` Bookmarks, `/h` History (last 90 days). Off by default; opt-in on the options page (browser asks permission).
- Close tabs from the list: `Ctrl+Backspace`. Navigate with arrows or `Ctrl+J`/`Ctrl+K`. `Ctrl+U` clears. `Esc` dismisses.
- Light and dark (`Alt+T`). Options: opacity (60–100 %), blur (0–40 px), size (70–150 %), keys.
- Privacy: no network requests, no account, no analytics, nothing leaves the browser. Plain JS, no dependencies, ~600 lines, open source.
- Install today: not in the Web Store yet. Clone repo → `chrome://extensions` → Developer mode → Load unpacked → pick `extension/`.

## Audience
People who live in the browser with 30–200 tabs: developers, consultants, researchers, PMs. Keyboard-heavy, used to command palettes (VS Code `Ctrl+P`, Raycast, Spotlight). They lose time hunting tabs.

## Key selling points (in order)
1. **Find any tab in a keystroke.** `Ctrl+E`, a few letters, `Enter`.
2. **Fast and fuzzy.** "gh pr" finds the GitHub pull request. Domain-first ranking.
3. **Keyboard-only**, but mouse works too.
4. **Private by design.** Zero network requests. Open source. Nothing to sign up for.
5. **Every window, plus bookmarks and history** when you want them.
6. **Fits your browser**: light/dark, glass panel, adjustable.

## Tone
Short, plain, confident. No hype words ("revolutionary", "supercharge"). Developer-friendly, a little dry. Show, don't tell: the demo carries the page.

## Headline ideas
- "Every tab, one keystroke away."
- "Stop hunting for tabs."
- Sub: "TabNow is a fuzzy finder for your open tabs. Press Ctrl+E, type a few letters, hit Enter."

## Page structure
1. Hero: headline, sub, Install button (GitHub repo), secondary "See how it works". Keycap `Ctrl+E` visible.
2. Live demo: a fake TabNow overlay with ~15 realistic tabs (GitHub PR, Linear, Figma, Gmail, Google Docs, Stack Overflow, MDN, YouTube, Notion, Jira, AWS console, localhost:3000, Reddit, X, LinkedIn). User types, results filter with highlighted letters, arrows move, Enter "switches" (show a toast/fake tab bar switch). `/` opens scope menu. Must work with keyboard and mouse. Pressing Ctrl+E on the page focuses the demo.
3. Features (6 above).
4. Keyboard cheat sheet (short).
5. Privacy: "No network requests. Ever." Permissions explained in plain words (tabs, activeTab, scripting, favicon, storage; history/bookmarks optional).
6. Install steps (4 steps, link to GitHub). Note "Web Store coming soon".
7. Footer: GitHub, LinkedIn, X, Reddit links only. "Made by GRAN Software Solutions" → https://www.gransoftware.de. MIT.

## Links
- GitHub: https://github.com/gran-software-solutions/tabnow
- Social: LinkedIn, X, Reddit only (placeholders `#` are fine). Never Hacker News.

## Brand
- Extension accent blue `#1f5fd6` (dark mode `#9cbcff`). System fonts in the extension. Icon: `extension/icons/icon-128.png`.
- Real UI to imitate in the demo: `extension/search.css` (frosted panel, 16 px radius, rows with favicon + title + host/path, `<mark>` highlights, keycap footer: ↑↓ navigate, ↵ open, ⌃⌫ close tab, / scopes, esc dismiss).
- Ranking logic to port into the demo: `extension/fuzzy.js` (`match`, `search`) — copy it, it is plain JS.
