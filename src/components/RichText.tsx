import { useMemo } from 'react'
import { escapeHtml, toSafeHtml } from '../lib/richText'

interface RichTextProps {
  html: string
  className?: string
  /* Bold lead-in placed at the start of the first paragraph, the way the
     Details panel opens each block with "Timeline." or "Fees." */
  lead?: string
}

/* Renders text written in the admin panel's editor. Always sanitised, and
   plain text from before the editor existed comes out as ordinary
   paragraphs, so old and new programmes look the same. */
export default function RichText({ html, className, lead }: RichTextProps) {
  const safe = useMemo(() => {
    const body = toSafeHtml(html)
    if (!lead) return body
    const strong = `<strong>${escapeHtml(lead)}</strong> `
    return body.startsWith('<p>')
      ? body.replace('<p>', `<p>${strong}`)
      : `<p>${strong.trim()}</p>${body}`
  }, [html, lead])

  if (!safe) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
}
