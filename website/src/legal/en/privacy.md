Last updated: 20.10.2026

TabNow is a browser extension that searches your open tabs. It collects no data. It has no server, no account and no analytics, and it makes no network requests.

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

## Open source

The code is public under the MIT licence: [https://github.com/gran-software-solutions/tabnow](https://github.com/gran-software-solutions/tabnow)

## Contact

GRAN Software Solutions GmbH  
c/o Glazewski  
Am Hamburger Bahnhof 3  
10557 Berlin, Germany  
[hello@gransoftware.de](mailto:hello@gransoftware.de)

Changes to this policy will be published in this file, with a new date.
