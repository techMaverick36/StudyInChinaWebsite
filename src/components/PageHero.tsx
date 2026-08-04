import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow: string
  title: string
  lede?: string
  photoNote: string
  /* URL of the real photograph. When empty the striped placeholder shows. */
  photo?: string
  maxWidth?: number
  applyPad?: boolean
  titleNoMargin?: boolean
  applyTitleSize?: boolean
  deepShade?: boolean
  children?: ReactNode
}

/* Interior-page hero. Without a photo it shows a clearly marked placeholder
   naming the shot still needed. The stripes stay underneath the photo, so a
   missing or slow image degrades to the placeholder rather than a blank band. */
export default function PageHero({
  eyebrow,
  title,
  lede,
  photoNote,
  photo,
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
      {photo && (
        <div className="page-hero-photo" style={{ backgroundImage: `url(${photo})` }} />
      )}
      <div className={`page-hero-shade${deepShade ? ' deep' : ''}`} />
      {!photo && <span className="photo-badge">PHOTO — {photoNote}</span>}
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
