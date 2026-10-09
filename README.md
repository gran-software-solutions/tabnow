# TabNow

Fast fuzzy search over all open tabs, Spotlight style. `Alt+F` or the toolbar button opens it as an
overlay on the page (or a small popup window on pages where scripts can't run: `chrome://`, Web Store, new tab).
No network, no build, no dependencies.

Keys: `↑/↓`, `Ctrl+J/K` move, `Ctrl+U` clear, `Enter` switch, `Ctrl+Backspace` close tab, `Esc` dismiss.

Load: `chrome://extensions` -> Developer mode -> Load unpacked -> `extension/`.
Check: `node fuzzy.test.mjs`.
