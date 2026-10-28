/**
 * Prerenderizado estático.
 *
 * Una SPA entrega un <div id="root"></div> vacío: Google termina indexándola,
 * pero tarda más y los crawlers que NO ejecutan JavaScript (WhatsApp, Facebook,
 * X, LinkedIn) no ven ni el título ni la imagen de la vista previa.
 *
 * Este script renderiza cada ruta a HTML en el build y escribe un archivo por
 * página con su <head> correcto. El sitio sigue siendo una SPA: React hidrata
 * ese HTML y la navegación interna sigue siendo instantánea.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const { site, SITE_URL, pages } = await import(
  pathToFileURL(join(root, 'src/seo/siteConfig.js')).href
);
const { render } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);

const escape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function buildHead({ title, description, path, noindex = false }) {
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
  const robots = noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';

  return [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escape(site.name)}" />`,
    `<meta property="og:locale" content="${site.locale}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${site.ogImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
    `<meta name="twitter:image" content="${site.ogImage}" />`,
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

const template = await readFile(join(distDir, 'index.html'), 'utf-8');

if (!template.includes('<!--SEO-HEAD-->') || !template.includes('<div id="root"></div>')) {
  throw new Error(
    'La plantilla dist/index.html no tiene los marcadores esperados (<!--SEO-HEAD--> y #root).'
  );
}

async function writePage({ path, title, description, noindex = false, fileName }) {
  const appHtml = render(path);
  const head = buildHead({ title, description, path, noindex });

  const html = template
    .replace(
      /<!--SEO-HEAD-->[\s\S]*?<!--\/SEO-HEAD-->/,
      `<!--SEO-HEAD-->\n${head}\n    <!--/SEO-HEAD-->`
    )
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  const outFile = fileName
    ? join(distDir, fileName)
    : join(distDir, path === '/' ? 'index.html' : `${path.replace(/^\//, '')}/index.html`);

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, html, 'utf-8');
  return outFile.replace(distDir, 'dist');
}

function buildSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(({ path, priority, changefreq }) =>
      [
        '  <url>',
        `    <loc>${SITE_URL}${path === '/' ? '/' : path}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const routes = Object.values(pages);
const generados = [];

for (const route of routes) {
  generados.push(await writePage(route));
}

// Página de error para los hosts que sirven 404.html (Netlify, GitHub Pages, S3)
generados.push(
  await writePage({
    path: '/404',
    fileName: '404.html',
    title: 'Página no encontrada | Shinka Studio',
    description: 'La página que buscás no existe o cambió de dirección.',
    noindex: true,
  })
);

await writeFile(join(distDir, 'sitemap.xml'), buildSitemap(routes), 'utf-8');
generados.push('dist/sitemap.xml');

await rm(ssrDir, { recursive: true, force: true });

console.log(`\nPrerenderizado listo (${generados.length} archivos):`);
generados.forEach((file) => console.log(`  ✓ ${file}`));
console.log('');
