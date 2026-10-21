// One place for facts that are not translated. Shared by the page, the JSON-LD and the build checks.
const env = import.meta.env ?? process.env;
export const BRAND = 'TabNow';
export const COMPANY = 'GRAN Software Solutions GmbH';
export const COMPANY_URL = 'https://www.gransoftware.de';
export const SUPPORT_EMAIL = 'hello@gransoftware.de';
export const IMPRINT_URL = 'https://gransoftware.de/impressum';
// SITE_URL overrides it for a build.
export const DOMAIN = 'tabnow.app';

// The Chrome Web Store listing (draft created 20.10.2026; the link works once Google approves it).
// storeLive is the single switch. While false, every Install button says "Coming soon to the Chrome
// Web Store" (the header says "Coming soon") and opens the install section on GitHub. On approval
// day set storeLive to true: every button, the install section, JSON-LD and llms.txt switch to the store.
export const storeLive = false;
const STORE_URL = 'https://chromewebstore.google.com/detail/tabnow-fuzzy-tab-search/mepimfhgphlbfopbenbiojhbgekineih';
export const webStoreUrl = storeLive ? STORE_URL : null;

// The Microsoft Edge Add-ons listing, live since 21.10.2026. Visitors on Edge get it as their
// Install button (swapped in the browser, see Base.astro); everyone else sees a small extra link,
// because Chrome, Brave, Opera, Vivaldi and Arc install from the Chrome Web Store only.
export const EDGE_STORE_URL = 'https://microsoftedge.microsoft.com/addons/detail/eicellnpfeaoedbigkbdghlgdnkcpkcp';

export const GITHUB_URL = 'https://github.com/gran-software-solutions/tabnow';
// Where the install steps are while the store listing does not exist yet.
export const GITHUB_INSTALL_URL = `${GITHUB_URL}#install`;

// Install button target and label state, one rule for every button on the site.
export function install() {
  return webStoreUrl
    ? { href: webStoreUrl, soon: false }
    : { href: GITHUB_INSTALL_URL, soon: true };
}

// Every store TabNow is in today: JSON-LD and llms.txt list them.
export const storeUrls = [webStoreUrl, EDGE_STORE_URL].filter(Boolean);

// Visit counts: our own umami, the instance pigmo and stepkeep use. The tracker is a file on
// this site (public/a.js, written by tools/fetch-tracker.mjs), so no third party serves code
// to a visitor. The website id is public (it is in every page).
// PUBLIC_ANALYTICS_ID='' turns the counter off for a build.
// The host is this site's own address for the shared umami (same server).
export const ANALYTICS = {
  host: env.PUBLIC_ANALYTICS_URL || 'https://stats.tabnow.app',
  websiteId: env.PUBLIC_ANALYTICS_ID ?? '725b321e-c543-4fb0-8581-3d7a1cc95cc9',
};
