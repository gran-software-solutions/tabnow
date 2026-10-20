# <img src="extension/icons/icon-128.png" width="40" align="center" alt=""> TabNow

Fuzzy search across every open tab in every window. Press `Alt+E` (`Cmd+E` on a Mac), type, hit Enter.

![TabNow demo: fuzzy match a tab, scope to bookmarks with /, switch to dark with Alt+T](docs/demo.gif)

## Features

- Searches all windows. Most recently used first, with the previous tab preselected, so `Alt+E` then `Enter` flips back.
- Fuzzy matching ranks domain over title over the rest of the URL.
- Tabs from other windows show a faint second card behind their favicon (hover it for "In another window").
- Optionally searches history and bookmarks too (off by default), listed below the open tabs.
- Close tabs straight from the list.
- No network requests. Nothing leaves your browser.
- Light and dark.

## Install

**Coming soon to the Chrome Web Store.** The listing is under review; this section gets the link once it is approved.

Works in Chrome 121+ and other Chromium browsers (Edge, Brave, Opera, Vivaldi, Arc). After installing, press `Alt+E` (`Cmd+E` on a Mac) on any page. To change the shortcut, open `chrome://extensions/shortcuts`.

## Keyboard shortcuts

Open TabNow with `Alt+E` (`Cmd+E` on a Mac) or the toolbar button. It shows as a centered overlay on the current page. Pressing `Alt+E` again while it is open closes it.

On open, tabs are listed most recently used first and the previous tab is preselected.

**Navigate**

| Key | What it does |
| --- | --- |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Move the selection. Wraps around at both ends. |
| <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> | Same, vim-style (down / up). |
| Mouse | Hover selects a row, click switches to it. |

**Act**

| Key | What it does |
| --- | --- |
| <kbd>Enter</kbd> | Switch to the selected tab. Focuses its window if it is in another one. |
| <kbd>Ctrl</kbd>+<kbd>Backspace</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> on macOS) | Close the selected tab and stay in the list. Change the key on the options page. |
| <kbd>Esc</kbd> | Dismiss. Clicking the dimmed background does the same. |

**Search**

| Key | What it does |
| --- | --- |
| Type | Space-separated words must all match. Matches in the domain rank above the title, the title above the rest of the URL. |
| <kbd>/</kbd> | Pick what to search. A menu lists `/t` Tabs, `/b` Bookmarks, `/h` History (type letters to filter, <kbd>↑</kbd> <kbd>↓</kbd> then <kbd>Enter</kbd> or <kbd>Tab</kbd> to pick). `/b ` with a space locks it directly. The scope shows as a chip before the field; <kbd>Backspace</kbd> on an empty field removes it. Bookmarks and history need the option on the options page. |
| <kbd>Ctrl</kbd>+<kbd>U</kbd> | Clear the query and keep the scope. Press again on an empty query to clear the scope. |
| <kbd>Alt</kbd>+<kbd>T</kbd> | Switch between light and dark (also the button next to the tab count). Change the key on the options page. |

Tips:

- `Alt+Z` switches straight to your previous tab without opening TabNow, in any window. Press it again to flip back. (`Alt+E`, `Enter` does the same through the list.)
- `Ctrl+N` is not used for moving down: the browser reserves it for "new window" and pages cannot intercept it. Use `Ctrl+J` / `Ctrl+K` instead.

Change the opening shortcut and the `Alt+Z` previous-tab shortcut at `brave://extensions/shortcuts` (or `chrome://extensions/shortcuts`): TabNow, "Activate the extension" and "Switch to previous tab".

## Configure

The close-tab key (default `Ctrl+Backspace`, `Cmd+Backspace` on macOS) is set on the TabNow options page: right-click the toolbar icon → Options, click the key and press the new combination. It syncs with your browser profile.

The same page has an **Opacity** slider (60–100 %, default 86 %): lower lets the page show through the search panel.

A **Blur** slider (off to 40 px, default 24 px) sets how strongly the page behind is blurred.

**Search history and bookmarks** is off by default. Turning it on shows the browser's permission prompt (history and bookmarks); matches then follow the open tabs, bookmarks first, then history of the last 90 days, and open in a new tab.

**Theme** picks Light or Dark.

Restricted pages (`brave://`, new tab, Web Store) can't host the overlay, so a small popup window opens instead.
On tiling window managers, add a float rule for it. Hyprland example (classic `hyprland.conf` syntax, which varies by Hyprland version):

```
windowrule = float, center, size 640 480, title:^(TabNow.*)$
```

## Development

Plain JS, no build, no dependencies. Run the matcher tests with:

```
node fuzzy.test.mjs
```

## License

MIT, see [LICENSE](LICENSE). Made by [GRAN Software Solutions](https://www.gransoftware.de).
