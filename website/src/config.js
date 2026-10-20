// One place for facts that are not translated. Shared by the page, the JSON-LD and the build checks.
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

export const GITHUB_URL = 'https://github.com/gran-software-solutions/tabnow';
// Where the install steps are while the store listing does not exist yet.
export const GITHUB_INSTALL_URL = `${GITHUB_URL}#install`;

// Install button target and label state, one rule for every button on the site.
export function install() {
  return webStoreUrl
    ? { href: webStoreUrl, soon: false }
    : { href: GITHUB_INSTALL_URL, soon: true };
}
