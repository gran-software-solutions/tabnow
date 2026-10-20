// One place for facts that are not translated. Shared by the page, the JSON-LD and the build checks.
export const BRAND = 'TabNow';
export const COMPANY = 'GRAN Software Solutions GmbH';
export const COMPANY_URL = 'https://www.gransoftware.de';
export const SUPPORT_EMAIL = 'hello@gransoftware.de';
export const IMPRINT_URL = 'https://gransoftware.de/impressum';
// TODO: the production domain is not decided; tabnow.app is a placeholder. SITE_URL overrides it for a build.
export const DOMAIN = 'tabnow.app';

// The Chrome Web Store listing. null until it is live. While null, every Install button says
// "Coming soon to the Chrome Web Store" and opens the install steps on GitHub. Set the URL and
// every Install button links to the store instead.
export const webStoreUrl = null;

export const GITHUB_URL = 'https://github.com/gran-software-solutions/tabnow';
// Where the install steps are while the store listing does not exist yet.
export const GITHUB_INSTALL_URL = `${GITHUB_URL}#install`;

// TODO: placeholders. GRAN's real profile URLs are not in the repo yet. Replace before launch.
export const SOCIAL = [
  { id: 'linkedin', url: 'https://www.linkedin.com/company/PLACEHOLDER-gran-software-solutions' },
  { id: 'x', url: 'https://x.com/PLACEHOLDER-gran' },
  { id: 'reddit', url: 'https://www.reddit.com/user/PLACEHOLDER-gran' },
];

// Install button target and label state, one rule for every button on the site.
export function install() {
  return webStoreUrl
    ? { href: webStoreUrl, soon: false }
    : { href: GITHUB_INSTALL_URL, soon: true };
}
