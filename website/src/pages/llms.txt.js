import { useT } from '../i18n/index.js';
import { SUPPORT_EMAIL, GITHUB_URL, webStoreUrl, EDGE_STORE_URL } from '../config.js';

// llms.txt (llmstxt.org): the site in plain Markdown for AI assistants. Built from the same
// English strings as the page, so it cannot say something the page does not.
const plain = (html) => html.replace(/<[^>]+>/g, '');

export function GET({ site }) {
  const { t, list } = useT('en');
  const abs = (path) => new URL(path, site).href;
  const lines = [
    '# TabNow',
    '',
    `> ${t('meta.homeDescription')}`,
    '',
    t('llms.tagline'),
    '',
    '## Features',
    '',
    ...['fuzzy', 'windows', 'back', 'themes'].map((k) => `- **${t(`moments.${k}.titleA`)} ${t(`moments.${k}.titleB`)}** ${plain(t(`moments.${k}.text`))}`),
    '',
    '## Privacy',
    '',
    `${t('privacy.big')} ${t('privacy.bigEm')} ${t('privacy.lead')}`,
    '',
    ...list('privacy.perms').map((perm) => `- **${perm.name}**${perm.optional ? ` (${t('privacy.optional')})` : ''}: ${plain(perm.text)}`),
    '',
    '## Install',
    '',
    webStoreUrl ? `- Chrome Web Store: ${webStoreUrl}` : `- ${t('install.soon')}`,
    `- Microsoft Edge Add-ons: ${EDGE_STORE_URL}`,
    ...list('installSection.steps').map((step, i) => `${i + 1}. ${plain(step)}`),
    '',
    '## Links',
    '',
    `- [Home](${abs('/')})`,
    `- [${t('legal.privacy')}](${abs('/privacy/')})`,
    `- [${t('legal.imprint')}](${abs('/imprint/')})`,
    `- [${t('footer.github')}](${GITHUB_URL})`,
    `- ${SUPPORT_EMAIL}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
