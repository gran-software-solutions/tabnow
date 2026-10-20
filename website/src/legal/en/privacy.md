Last updated: 20.10.2026

TabNow is a browser extension that searches your open tabs. The extension collects no data. It has no server, no account and no analytics, and it makes no network requests.

## What stays on your device

- The titles and addresses of your open tabs are read to build the search list. The list is built when you open TabNow, kept in memory while it is open, and dropped when you close it.
- If you turn on "Search history and bookmarks" in the options, your bookmarks and your history of the last 90 days are read the same way. This is off by default.
- Nothing you search for is saved. Nothing is sent anywhere.

## What is stored

Only your settings: the close-tab and theme keys, theme, size, opacity and blur. They are saved with the browser's own storage (`chrome.storage.sync`). If you are signed in to your browser and sync is on, the browser itself may sync these settings between your devices. We never see them.

## Why each permission is needed

- tabs: read the title and address of your open tabs, switch to a tab, close a tab, and know which tab you used last.
- activeTab and scripting: when you press the shortcut or the toolbar button, show the search box on the current page. TabNow does not read the page.
- favicon: show each site's icon in the list, from the browser's own icon cache.
- storage: save your settings (see above).
- history and bookmarks (optional): asked for only when you turn on "Search history and bookmarks". Used to list matching pages. Removing the option gives the permission back.

TabNow loads no code from the internet. All code ships inside the extension.

## Sharing

We do not sell, share or transfer any data, because we do not have any.

## This website

The extension is one thing and this website (tabnow.app) is another. The statements above are about the extension. Here is what the website does.

This site counts its visits with umami, an open-source counter we run ourselves on our own server at Hetzner in Germany. The counting script is a file on this site, not one fetched from somewhere else. The only request it makes off this site is its own count, sent to our own analytics server.

Each visit records the page address, the page you came from, the page title, the language and screen size your browser reports, and the browser, system and rough region worked out from your IP address. It also counts clicks on the Install button. The IP address itself is not stored: it is turned into a one-way value with a secret that changes every day, so a visit today cannot be linked to one yesterday. No personal profile is built. If your browser sends a Do Not Track signal, nothing is counted.

No cookie is set and nothing is written to your device by the counter, which is why there is no consent banner. The counting rests on our legitimate interest in knowing whether these pages are read (Art. 6(1)(f) GDPR). Once the day's secret is gone, the counts lead back to nobody.

If you switch between the light and dark theme, your browser remembers that choice in its own local storage. It is only the word "light" or "dark", it is never sent to us, and clearing your browser data removes it.

Our web server also keeps technical access logs (IP address, time, page requested, browser type) to run and protect the site. They are kept for 30 days, then deleted (Art. 6(1)(f) GDPR). The site sets no cookies, shows no advertising and loads no third-party scripts or fonts.

## Open source

The code is public under the MIT licence: [https://github.com/gran-software-solutions/tabnow](https://github.com/gran-software-solutions/tabnow)

## Contact

GRAN Software Solutions GmbH  
c/o Glazewski  
Am Hamburger Bahnhof 3  
10557 Berlin, Germany  
[hello@gransoftware.de](mailto:hello@gransoftware.de)

Changes to this policy will be published in this file, with a new date.
