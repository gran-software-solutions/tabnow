# TabNow

Fuzzy search across every open tab in every window. Press `Alt+F`, type, hit Enter.

![TabNow demo](docs/demo.gif)

## Features

- Searches all windows. Most recently used first, with the previous tab preselected, so `Alt+F` then `Enter` flips back.
- Fuzzy matching ranks domain over title over the rest of the URL.
- Tabs from other windows show a faint second card behind their favicon (hover it for "In another window").
- Close tabs straight from the list.
- No network requests. Nothing leaves your browser.
- Light and dark.

## Install

Not in the Web Store yet.

1. Clone this repo.
2. Open `brave://extensions` (or `chrome://extensions`) and turn on Developer mode.
3. Load unpacked, pick the `extension/` folder.

## Keyboard shortcuts

Open TabNow with `Alt+F` or the toolbar button. It shows as a centered overlay on the current page. Pressing `Alt+F` again while it is open closes it.

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
| <kbd>Ctrl</kbd>+<kbd>Backspace</kbd> | Close the selected tab and stay in the list. Change the key on the options page. |
| <kbd>Esc</kbd> | Dismiss. Clicking the dimmed background does the same. |

**Search**

| Key | What it does |
| --- | --- |
| Type | Space-separated words must all match. Matches in the domain rank above the title, the title above the rest of the URL. |
| <kbd>Ctrl</kbd>+<kbd>U</kbd> | Clear the query and return to the full list. |

Tips:

- `Alt+F`, `Enter` jumps back to your previous tab, like `Alt+Tab`.
- `Ctrl+N` is not used for moving down: the browser reserves it for "new window" and pages cannot intercept it. Use `Ctrl+J` / `Ctrl+K` instead.

Change the opening shortcut at `brave://extensions/shortcuts` (or `chrome://extensions/shortcuts`): TabNow, "Activate the extension".

## Configure

The close-tab key (default `Ctrl+Backspace`) is set on the TabNow options page: right-click the toolbar icon → Options, click the key and press the new combination. It syncs with your browser profile.

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
