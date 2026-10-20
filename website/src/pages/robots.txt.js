export function GET({ site }) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
