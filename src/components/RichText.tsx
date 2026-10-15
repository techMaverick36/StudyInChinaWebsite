import { useMemo } from 'react'
import { toSafeHtml } from '../lib/richText'

interface RichTextProps {
  html: string
  className?: string
}

/* Renders text written in the admin panel's editor. Always sanitised, and
   plain text from before the editor existed comes out as ordinary
   paragraphs, so old and new programmes look the same. */
export default function RichText({ html, className }: RichTextProps) {
  const safe = useMemo(() => toSafeHtml(html), [html])

  if (!safe) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
}
