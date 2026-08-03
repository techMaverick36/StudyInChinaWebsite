import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow: string
  title: string
  lede?: string
  photoNote: string
  maxWidth?: number
  applyPad?: boolean
  titleNoMargin?: boolean
  applyTitleSize?: boolean
  deepShade?: boolean
  children?: ReactNode
}

/* Interior-page hero. The striped background is a clearly marked placeholder
   for the real photo named in `photoNote` (to be supplied by the client). */
export default function PageHero({
  eyebrow,
  title,
  lede,
  photoNote,
  maxWidth = 860,
  applyPad = false,
  titleNoMargin = false,
  applyTitleSize = false,
  deepShade = false,
  children,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-stripes" />
      <div className={`page-hero-shade${deepShade ? ' deep' : ''}`} />
      <span className="photo-badge">PHOTO — {photoNote}</span>
      <div
        className={`page-hero-inner${applyPad ? ' apply-pad' : ''}`}
        style={{ maxWidth }}
      >
        <p className="eyebrow-hero">{eyebrow}</p>
        <h1
          className={`page-title${titleNoMargin ? ' no-mb' : ''}${applyTitleSize ? ' apply-size' : ''}`}
        >
          {title}
        </h1>
        {lede && <p className="page-lede">{lede}</p>}
        {children}
      </div>
    </section>
  )
}
