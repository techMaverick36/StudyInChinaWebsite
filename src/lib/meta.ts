import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { canonicalUrl } from './site'

/* What a page asks to have in <head>. In the browser the hooks below write it
   into the document; during the build-time prerender (scripts/prerender.mjs)
   they report it to a collector instead, so each route's static HTML ships
   with its own title, description and structured data. */
export interface HeadCollector {
  setMeta: (title: string, description: string) => void
  addJsonLd: (id: string, json: string) => void
}

export const HeadContext = createContext<HeadCollector | null>(null)

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

function setCanonical(href: string) {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = 'canonical'
    document.head.appendChild(tag)
  }
  tag.href = href
}

/* Sets the document title and meta description for the current page, plus the
   Open Graph tags that WhatsApp and Facebook read when a link is shared and the
   canonical address search engines should index. */
export function usePageMeta(title: string, description: string) {
  const collector = useContext(HeadContext)
  const { pathname } = useLocation()
  collector?.setMeta(title, description)

  useEffect(() => {
    const url = canonicalUrl(pathname)
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setCanonical(url)
  }, [title, description, pathname])
}

/* Adds a schema.org JSON-LD block for the current page and removes it on the
   way out, so search engines read structured data for that page only. A block
   already in the prerendered HTML is taken over rather than duplicated. */
export function useJsonLd(id: string, data: object | null) {
  const collector = useContext(HeadContext)
  const json = data ? JSON.stringify(data) : ''
  if (json) collector?.addJsonLd(id, json)

  useEffect(() => {
    if (!json) return
    const existing = document.getElementById(`ld-${id}`)
    const tag =
      existing instanceof HTMLScriptElement ? existing : document.createElement('script')
    tag.type = 'application/ld+json'
    tag.id = `ld-${id}`
    tag.text = json
    if (!existing) document.head.appendChild(tag)
    return () => tag.remove()
  }, [id, json])
}
