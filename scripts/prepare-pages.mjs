/**
 * Turns the Vite SPA build into something GitHub Pages and search engines can
 * understand.
 *
 * GitHub Pages has no SPA rewrite rule: /portfolio/work normally returns
 * 404.html. This script writes the same app shell at /work.html and
 * /work/index.html so the route answers with a 200 and a route-specific title.
 * It also emits sitemap.xml and robots.txt.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes, SITE_URL } from './routes.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const canonicalFor = (routePath) =>
  routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;

const replaceOrInsert = (html, pattern, tag) =>
  pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `    ${tag}\n  </head>`);

function withMeta(html, route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const canonical = canonicalFor(route.path);

  let out = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${title}</title>`,
  );

  out = replaceOrInsert(
    out,
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${description}" />`,
  );
  out = replaceOrInsert(
    out,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );
  out = replaceOrInsert(
    out,
    /<meta\s+property="og:title"[^>]*>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  out = replaceOrInsert(
    out,
    /<meta\s+property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${description}" />`,
  );
  out = replaceOrInsert(
    out,
    /<meta\s+property="og:url"[^>]*>/i,
    `<meta property="og:url" content="${canonical}" />`,
  );
  out = replaceOrInsert(
    out,
    /<meta\s+name="twitter:title"[^>]*>/i,
    `<meta name="twitter:title" content="${title}" />`,
  );
  out = replaceOrInsert(
    out,
    /<meta\s+name="twitter:description"[^>]*>/i,
    `<meta name="twitter:description" content="${description}" />`,
  );

  return out;
}

const baseHtml = readFileSync(indexPath, 'utf8');
const homeRoute = routes.find((route) => route.path === '/');

if (!homeRoute) {
  console.error('The route list must include "/".');
  process.exit(1);
}

// Home page and the 404 shell.
writeFileSync(indexPath, withMeta(baseHtml, homeRoute));

const notFoundHtml = withMeta(baseHtml, {
  path: '/',
  title: 'Page not found — Kalashree',
  description: 'The page you requested does not exist.',
}).replace(
  /<meta\s+name="robots"[^>]*>/i,
  '<meta name="robots" content="noindex, follow" />',
);
writeFileSync(path.join(distDir, '404.html'), notFoundHtml);

// One HTML shell per public route. Both forms are written because GitHub Pages
// may serve /route from route.html or redirect it to route/index.html.
let routeFiles = 0;
for (const route of routes) {
  if (route.path === '/') continue;

  const relative = route.path.replace(/^\//, '');
  const routeHtml = withMeta(baseHtml, route);

  const flatFile = path.join(distDir, `${relative}.html`);
  mkdirSync(path.dirname(flatFile), { recursive: true });
  writeFileSync(flatFile, routeHtml);
  routeFiles += 1;

  const indexFile = path.join(distDir, relative, 'index.html');
  mkdirSync(path.dirname(indexFile), { recursive: true });
  writeFileSync(indexFile, routeHtml);
  routeFiles += 1;
}

// Sitemap and robots.txt. The robots file lives under /portfolio/, so Google
// will not treat it as the host-level robots.txt, but the sitemap can still be
// submitted directly in Search Console and Bing Webmaster Tools.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${canonicalFor(route.path)}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync(path.join(distDir, 'robots.txt'), robots);

console.log(
  `Prepared GitHub Pages output: ${routes.length} sitemap URLs, ${routeFiles} route shells, 404.html, robots.txt.`,
);
