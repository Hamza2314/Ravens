#!/usr/bin/env node
/**
 * OPTIONAL helper: copies values from config.js into the static files that
 * cannot read JavaScript:
 *   • the SEO block in index.html (<title>, description, canonical, Open Graph, Twitter)
 *   • robots.txt and sitemap.xml (they need your real domain)
 *
 * Why: Google runs JavaScript, so it already sees what config.js sets. But link
 * previews on WhatsApp, Instagram, Facebook, X, Discord… do NOT run JavaScript:
 * they only read the static HTML. Run this once before going live and again
 * whenever you change site.url, site.title, site.description or the OG image.
 *
 * Usage (needs Node.js 18+, no installation):   node tools/sync-head.mjs
 * The site works without ever running this. It is not a build step.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const write = (f, s) => { writeFileSync(join(ROOT, f), s); console.log(`  ✓ ${f}`); };

const sandbox = { window: {} };
try {
  vm.runInNewContext(read('config.js'), sandbox, { filename: 'config.js' });
} catch (err) {
  console.error('✗ config.js has an error. Fix it first:\n', err.message);
  process.exit(1);
}
const C = sandbox.window.RAVENS_CONFIG;
if (!C) { console.error('✗ config.js did not define window.RAVENS_CONFIG'); process.exit(1); }

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const base = String(C.site?.url || '').replace(/\/+$/, '');
const discount = Number(C.wishlist?.offer?.discount);
const vars = { productName: C.product?.name || '', brand: C.brand?.name || '', wishlistDiscount: discount > 0 ? `${discount}%` : '' };
const tpl = (s) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
const abs = (p) => (/^https?:\/\//i.test(p) ? p : `${base}/${String(p).replace(/^\/+/, '')}`);

// Wishlist mode uses its own "coming soon" title/description (wishlist.seo)
const seo = C.mode === 'wishlist' ? (C.wishlist?.seo || {}) : {};
const title = tpl(seo.title || C.site?.title || vars.brand);
const desc = tpl(seo.description || C.site?.description || '');
const image = C.site?.ogImage ? abs(C.site.ogImage) : '';
const alt = C.site?.ogImageAlt || '';

const head = [
  `<title>${esc(title)}</title>`,
  `<meta name="description" content="${esc(desc)}">`,
  `<link rel="canonical" href="${esc(base)}/">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="${esc(vars.brand)}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(desc)}">`,
  `<meta property="og:url" content="${esc(base)}/">`,
  image && `<meta property="og:image" content="${esc(image)}">`,
  image && `<meta property="og:image:width" content="1200">`,
  image && `<meta property="og:image:height" content="630">`,
  alt && `<meta property="og:image:alt" content="${esc(alt)}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="${esc(title)}">`,
  `<meta name="twitter:description" content="${esc(desc)}">`,
  image && `<meta name="twitter:image" content="${esc(image)}">`,
  alt && `<meta name="twitter:image:alt" content="${esc(alt)}">`,
  C.site?.twitterHandle && `<meta name="twitter:site" content="${esc(C.site.twitterHandle)}">`
].filter(Boolean).map((l) => `  ${l}`).join('\n');

console.log(`Syncing config.js → static files (mode: ${C.mode === 'wishlist' ? 'wishlist' : 'shop'})`);

const html = read('index.html');
const re = /(<!-- SEO:START[\s\S]*?-->\n)[\s\S]*?(\n\s*<!-- SEO:END -->)/;
if (!re.test(html)) { console.error('✗ Could not find the <!-- SEO:START --> … <!-- SEO:END --> markers in index.html'); process.exit(1); }
write('index.html', html.replace(re, (_, start, end) => `${start}${head}${end}`));

write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);

const today = new Date().toISOString().slice(0, 10);
const pages = [['', '1.0'], ['shipping.html', '0.5'], ['returns.html', '0.5'], ['terms.html', '0.3'], ['privacy.html', '0.3'], ['legal-notice.html', '0.3']];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, prio]) => `  <url>\n    <loc>${esc(`${base}/${p}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${prio}</priority>\n  </url>`).join('\n')}
</urlset>
`);

const todos = [...new Set(JSON.stringify(C).match(/TODO_[A-Z0-9_]+/g) || [])];
if (/TODO_/.test(base)) console.warn('\n⚠ site.url is still a placeholder. Run this again after setting your domain.');
if (todos.length) console.warn(`\n⚠ ${todos.length} placeholder(s) left in config.js:\n  ${todos.join('\n  ')}`);
else console.log('\nNo TODO_ placeholders left in config.js.');
