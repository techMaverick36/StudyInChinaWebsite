/* Build-time prerender: the last step of `npm run build`.

   Vite has already built the browser app into dist/ and the server entry
   (src/entry-server.tsx) into dist-ssr/. This script:

   1. reads the published scholarships from Supabase (the same query the
      browser runs), falling back to the built-in list when Supabase is not
      configured or the table is empty, exactly as the site does;
   2. renders every public route to static HTML with its own <title>, meta
      description, Open Graph tags, canonical link and JSON-LD, so link
      previews (WhatsApp, Facebook) and crawlers see the real page;
   3. keeps an empty copy of the app as dist/spa-fallback.html, which
      netlify.toml serves for /admin and any address without its own file;
   4. writes dist/sitemap.xml.

   If Supabase is configured but the query fails, the build fails, so Netlify
   keeps the last good deploy instead of publishing stale programmes.
   Scholarships edited in /admin reach these files on the next build; see
   "Publishing changes to the static pages" in README.md. */

import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'

const root = process.cwd()
const dist = path.join(root, 'dist')
const server = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href)

server.setSanitizerWindow(new JSDOM('').window)

/* ---------- Scholarships ---------- */

let live = null
if (server.supabaseConfigured) {
  try {
    const rows = await server.fetchPublishedScholarships()
    live = rows.length > 0 ? rows : null
    console.log(
      live
        ? `prerender: ${rows.length} published scholarships from Supabase`
        : 'prerender: no published scholarships in Supabase, using the built-in list',
    )
  } catch (err) {
    console.error(`prerender: could not read scholarships from Supabase: ${err.message}`)
    process.exit(1)
  }
} else {
  console.warn('prerender: Supabase is not configured, using the built-in scholarships')
}

/* ---------- HTML ---------- */

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/* JSON inside a <script> must not be able to close the tag early. */
const escapeScriptJson = (s) => s.replace(/</g, '\\u003c')

/* The template is the app shell Vite built. A fresh vite build has emptied
   dist/; when this script is run again on its own, index.html is already the
   prerendered home page, so the shell saved last time is used instead. */
const shellFile = path.join(dist, 'spa-fallback.html')
const template = await fs
  .readFile(shellFile, 'utf8')
  .catch(() => fs.readFile(path.join(dist, 'index.html'), 'utf8'))

/* Replaces exactly one tag in the template, so a change to index.html that
   breaks the pattern fails the build instead of shipping the wrong meta. */
function replaceOnce(html, pattern, replacement, label) {
  const matches = html.match(new RegExp(pattern.source, 'g')) ?? []
  if (matches.length !== 1) {
    throw new Error(`prerender: expected one ${label} in index.html, found ${matches.length}`)
  }
  return html.replace(pattern, () => replacement)
}

function buildPage(url, page) {
  if (!page.title || !page.description) {
    throw new Error(`prerender: ${url} rendered without a title or description (usePageMeta)`)
  }
  const canonical = server.canonicalUrl(url)
  const title = escapeAttr(page.title)
  const description = escapeAttr(page.description)

  let html = template
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeText(page.title)}</title>`, '<title>')
  html = replaceOnce(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`,
    'meta description',
  )
  html = replaceOnce(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
    'og:title',
  )
  html = replaceOnce(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    [
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
      `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
      ...page.jsonLd.map(
        (b) => `<script type="application/ld+json" id="ld-${b.id}">${escapeScriptJson(b.json)}</script>`,
      ),
    ].join('\n    '),
    'og:description',
  )
  html = replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${page.html}</div>\n    <script type="application/json" id="prerender-data">${escapeScriptJson(
      JSON.stringify({ scholarships: live }),
    )}</script>`,
    '<div id="root">',
  )
  return html
}

/* "/" becomes index.html and "/scholarships/compare" becomes
   scholarships/compare.html. Netlify serves /scholarships/compare from that
   file without a trailing-slash redirect, so the address students share is
   the canonical one. */
const fileFor = (url) => (url === '/' ? 'index.html' : `${url.slice(1)}.html`)

/* The empty shell must be saved before index.html is overwritten by the
   prerendered home page. */
await fs.writeFile(shellFile, template)

const routes = server.publicRoutes(live)
for (const url of routes) {
  const file = path.join(dist, fileFor(url))
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, buildPage(url, server.render(url, live)))
}
console.log(`prerender: wrote ${routes.length} pages`)

/* ---------- Sitemap ---------- */

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((url) => `  <url><loc>${escapeText(server.canonicalUrl(url))}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap)
console.log(`prerender: wrote sitemap.xml (${routes.length} URLs)`)
