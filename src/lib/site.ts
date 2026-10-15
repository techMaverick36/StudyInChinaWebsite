/* The production address. Canonical links, og:url and sitemap.xml are built
   from it; public/robots.txt names the sitemap at the same address, so change
   both together. No trailing slash. */
export const SITE_URL = 'https://studyinchinanow.com'

/* The one address a page should be indexed under: the router path on the
   production domain, without a trailing slash (except the home page). */
export function canonicalUrl(pathname: string): string {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  return `${SITE_URL}${path}`
}
