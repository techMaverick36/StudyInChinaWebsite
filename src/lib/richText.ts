import DOMPurify from 'dompurify'

/* Rich text written in the admin panel is stored as a short list of HTML
   tags. Programmes saved before the editor existed hold plain text, so every
   helper here accepts either and renders both the same way. */

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a']
const ALLOWED_ATTR = ['href', 'target', 'rel']

export const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const looksLikeHtml = (v: string): boolean =>
  /<\/?(p|br|strong|b|em|i|u|s|ul|ol|li|a)\b[^>]*>/i.test(v)

/* A blank line starts a new paragraph; a single line break stays a break. */
export function plainToHtml(v: string): string {
  return v
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/* What the editor loads: stored HTML as it is, older plain text converted. */
export const toEditorHtml = (v: string): string =>
  !v?.trim() ? '' : looksLikeHtml(v) ? v : plainToHtml(v)

let linkHookAdded = false

/* HTML that is safe to put on a public page. Anything outside the allow-list
   is dropped, script links are removed, and every link opens in a new tab
   without handing that tab a reference back to this site. */
export function toSafeHtml(v: string): string {
  if (!v?.trim()) return ''
  if (!looksLikeHtml(v)) return plainToHtml(v)
  if (!linkHookAdded) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    })
    linkHookAdded = true
  }
  return DOMPurify.sanitize(v, { ALLOWED_TAGS, ALLOWED_ATTR })
}
