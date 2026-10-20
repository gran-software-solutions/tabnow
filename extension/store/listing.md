# TabNow: Chrome Web Store listing

Draft for the store dashboard (version 0.1.0). Images are in this folder; build them with
`node extension/tools/store-images.mjs`. Build the zip with `node extension/tools/pack-extension.mjs`
(writes `dist/tabnow-<version>.zip`).

## Name

TabNow

The store reads the name from the manifest (`name` in `_locales/en/messages.json`). Optional: a longer
name with search words, e.g. "TabNow: Fuzzy Tab Search" (change it there, max 75 characters).

## Summary (max 132 characters)

The manifest description (`description`), so the store shows the same text. 44 characters.

Fast fuzzy search across all your open tabs.

## Description

Plain text, paste as is. No markdown.

TabNow finds any open tab in a few keystrokes. Press Ctrl+E (Cmd+E on a Mac), type a few letters, press Enter. You are on that tab.

It searches every tab in every window. The most recently used tabs come first, and the previous tab is already selected, so Ctrl+E then Enter takes you back to where you just were.

What it does
- Fuzzy search. Type words in any order: "gh pr" finds a GitHub pull request. All words must match. A match in the site name ranks above the title, and the title above the rest of the address. Matched letters are highlighted.
- Every window. Tabs from other windows get a small window badge on their icon.
- Keyboard first. Arrow keys or Ctrl+J and Ctrl+K to move, Enter to open, Esc to dismiss. The mouse works too.
- Close tabs from the list with Ctrl+Backspace (Cmd+Backspace on a Mac).
- Alt+Z jumps straight to your previous tab without opening anything. Press it again to jump back.
- Bookmarks and history, if you want them. Type / to pick what to search: /t tabs, /b bookmarks, /h history (last 90 days). This is off by default; you switch it on in the options, and the browser asks for permission then.
- Light and dark. Alt+T switches. The options page sets opacity, blur, size and the keys.

Private by design
TabNow makes no network requests. It has no account, no analytics and no ads, and it loads no code from the internet. Your tabs, bookmarks and history are read on your device to fill the list and are never sent anywhere. Only your settings are stored, with the browser's own storage. The code is open source (MIT).

Good to know
- The shortcut Ctrl+E replaces Chrome's Ctrl+E (search from the address bar) while the extension is installed. You can change it at chrome://extensions/shortcuts.
- Chrome pages (chrome://), the new tab page and the Web Store cannot show the search box on the page, so TabNow opens it in a small window there.
- Works in Chrome 121 or newer, and in other browsers that install extensions from the Chrome Web Store.

Source and help: https://github.com/gran-software-solutions/tabnow
Questions? hello@gransoftware.de

## Category

Productivity.

Why: TabNow is a navigation and workflow tool for everyone who keeps many tabs open (developers, consultants,
researchers, project managers), not only for developers. Developer Tools is for tools that help build or
debug web pages, which this does not do. If the dashboard asks for a sub-category, pick Tools
(Workflow & Planning is the alternative).

## Language

English (the manifest has `_locales/en` only).

## Single purpose

TabNow lets users quickly find and switch to any of their open browser tabs by typing a few letters.

(Searching bookmarks and history, closing tabs, and the theme and size options all serve that same
purpose: finding and reaching a page you already have open or saved.)

## Permission reasons

One justification per permission, for the "Privacy practices" tab.

| Permission | Justification |
|---|---|
| `tabs` | Reads the title, address and last-used time of the user's open tabs to build the searchable list and order it by recent use, and switches to or closes the tab the user picks. Nothing is stored or sent. |
| `activeTab` | When the user presses the shortcut or the toolbar button, lets TabNow show its search box on the page they are looking at. Only that tab, only after that action. |
| `scripting` | Used together with activeTab to run one small function in the current tab that adds (or removes) TabNow's search box. It does not read or change the page's content. |
| `favicon` | Shows each site's icon next to its title in the list, using the browser's own icon cache (the `_favicon` endpoint). No request goes to the sites. |
| `storage` | Saves the user's settings (keys, theme, size, opacity, blur) with `chrome.storage.sync`. No tab data and no search text is saved. |
| `history` (optional) | Only after the user turns on "Search history and bookmarks" on the options page and accepts the browser's prompt. Reads the last 90 days of history to list matching pages in the "/h" scope. Kept in memory while the box is open; not stored, not sent. |
| `bookmarks` (optional) | Same switch and prompt as history. Reads the bookmark tree to list matching pages in the "/b" scope. Not stored, not sent. |

### web_accessible_resources on all sites

`search.html`, `search.js`, `search.css`, `fuzzy.js` and `keys.js` are listed with `matches: ["<all_urls>"]`.
Reason: the search box is shown as an iframe of the extension's own page inside the page the user is on, and a
page can only embed an extension page that is listed here. `<all_urls>` is needed because the user can press
the shortcut on any site. The files hold only TabNow's own interface code; they contain no user data, and
`use_dynamic_url` is set so the address of the resources changes per session and sites cannot use it to detect
the extension. The overlay is created in a closed shadow root, and TabNow only accepts messages from its own frame.

### Remote code

No. All code is in the package. There is no `eval`, no remote script, no `fetch` and no other network code.
`node extension/tools/pack-extension.mjs` fails the build if any appear.

## Privacy practices form

- Data collected: none. TabNow does not collect or transmit user data.
  - Personally identifiable information: no
  - Health, financial, authentication, personal communications, location: no
  - Web history: no. History is only read on the device when the user turns it on, and never leaves it.
  - User activity: no
  - Website content: no
- Certifications (tick all three): data is not sold to third parties; not used or transferred for purposes unrelated to the single purpose; not used for creditworthiness or lending.
- "Contains in-app purchases": no. There is no Pro plan.
- Privacy policy URL: https://github.com/gran-software-solutions/tabnow/blob/main/PRIVACY.md (until the website is live; it only works once PRIVACY.md is pushed to main).

## URLs

- Homepage: https://TODO-tabnow-website (placeholder; until the site is live use https://github.com/gran-software-solutions/tabnow)
- Support: https://github.com/gran-software-solutions/tabnow/issues (or hello@gransoftware.de)
- Privacy policy: https://github.com/gran-software-solutions/tabnow/blob/main/PRIVACY.md (switch to https://TODO-tabnow-website/privacy once the site is live)

## Images (this folder)

- `icon-128.png`: store icon, 128 x 128 (copy of `extension/icons/icon-128.png`).
- `screenshot-1.png` to `screenshot-5.png`: 1280 x 800. 1 typed search, 2 bookmarks and history sections, 3 default list of every window, 4 dark theme, 5 options page. The tabs in them are made-up demo data.
- `tile-small.png`: small promo tile, 440 x 280.
- `tile-marquee.png`: marquee promo tile, 1400 x 560.

## Tester notes (Edge Add-ons asks for them; harmless for Chrome)

Open any web page, press Ctrl+E, type a few letters of an open tab's title and press Enter. Press / to see the
scopes (bookmarks and history are off until you turn them on in the options page). No account or key is needed.
