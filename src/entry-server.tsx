import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { HeadContext } from './lib/meta'
import type { HeadCollector } from './lib/meta'
import { seedScholarships } from './data/scholarships'
import type { Scholarship } from './data/scholarships'
import { supabase } from './lib/supabase'

/* Server entry for the build-time prerender. `npm run build` bundles this file
   for Node (vite build --ssr) and scripts/prerender.mjs calls it once per
   public route, writing the result into dist/ as static HTML. */

export { fetchPublishedScholarships } from './lib/scholarshipStore'
export { setSanitizerWindow } from './lib/richText'
export { SITE_URL, canonicalUrl } from './lib/site'

export const supabaseConfigured = !!supabase

/* Every address that gets its own HTML file and a sitemap entry. /admin is
   left out on purpose: it stays a browser-only page behind the SPA shell. */
export function publicRoutes(live: Scholarship[] | null): string[] {
  const list = live ?? seedScholarships
  /* The admin panel only accepts lowercase letters, numbers and hyphens for a
     programme's address. Anything else (say, an id typed straight into the
     database) is skipped rather than turned into a file path; that page still
     works in the browser through the SPA shell. */
  const ids = list.map((s) => s.id).filter((id) => /^[a-z0-9-]+$/.test(id))
  /* A Set, because a programme whose id is "compare" or "subjects" would
     otherwise repeat a fixed page (the fixed route wins in the router). */
  return [
    ...new Set([
      '/',
      '/scholarships',
      '/scholarships/compare',
      '/scholarships/subjects',
      ...ids.map((id) => `/scholarships/${id}`),
      '/requirements',
      '/how-to-apply',
      '/contact',
      '/apply',
    ]),
  ]
}

export interface RenderedPage {
  html: string
  title: string
  description: string
  jsonLd: { id: string; json: string }[]
}

/* `live` is the published list from Supabase, or null to use the built-in
   programmes, exactly as the browser store treats it. */
export function render(url: string, live: Scholarship[] | null): RenderedPage {
  const page: RenderedPage = { html: '', title: '', description: '', jsonLd: [] }
  const collector: HeadCollector = {
    setMeta: (title, description) => {
      page.title = title
      page.description = description
    },
    addJsonLd: (id, json) => {
      if (!page.jsonLd.some((b) => b.id === id)) page.jsonLd.push({ id, json })
    },
  }
  page.html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App initialScholarships={live} />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  )
  return page
}
