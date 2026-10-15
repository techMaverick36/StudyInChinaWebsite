import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: ReactNode
  /* Small label above the title. Optional: most sections read fine without one. */
  eyebrow?: string
  /* Short paragraph under the title. */
  intro?: ReactNode
  /* Set on navy bands so the text turns light. */
  onDark?: boolean
  /* Content aligned to the right of the title on wide screens, e.g. a link. */
  aside?: ReactNode
}

/* Heading block at the top of a page section. */
export default function SectionHeader({
  title,
  eyebrow,
  intro,
  onDark = false,
  aside,
}: SectionHeaderProps) {
  return (
    <div className={`section-header${onDark ? ' on-dark' : ''}`}>
      <div className="section-header-text">
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {intro && <p className="section-intro">{intro}</p>}
      </div>
      {aside && <div className="section-header-aside">{aside}</div>}
    </div>
  )
}
