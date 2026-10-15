import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Scholarship } from '../data/scholarships'
import StatusBadge from './StatusBadge'
import Button from './Button'

interface ScholarshipCardProps {
  scholarship: Scholarship
  /* Leave out the blurb, for the shorter preview cards on the home page. */
  compact?: boolean
  /* Heading level, so the card fits the outline of the page it sits on. */
  headingLevel?: 'h2' | 'h3'
}

/* One programme in a grid. The home page and the scholarships listing both use
   this, so a programme looks the same wherever it appears.

   The whole card is clickable, but the real link is the "View details" button:
   that is what keyboards, screen readers and "open in new tab" use. */
export default function ScholarshipCard({
  scholarship: s,
  compact = false,
  headingLevel: Heading = 'h2',
}: ScholarshipCardProps) {
  const navigate = useNavigate()
  const path = `/scholarships/${s.id}`

  return (
    <article
      className="scholarship-card"
      onClick={(e) => {
        /* Let clicks on the link itself, or text being selected, behave normally. */
        if ((e.target as HTMLElement).closest('a')) return
        if (window.getSelection()?.toString()) return
        navigate(path)
      }}
    >
      <StatusBadge status={s.status} />
      <Heading className="scholarship-card-title">{s.title}</Heading>
      <p className="scholarship-card-meta">
        <span>{s.levels}</span>
        <span>{s.location}</span>
      </p>
      {!compact && <p className="scholarship-card-blurb">{s.blurb}</p>}
      {/* The deadline appears once, here, rather than in a corner label, a
          "Closes" row and the blurb. */}
      <div className="scholarship-card-foot">
        <span className="scholarship-card-intake">{s.closingLabel}</span>
        <Button to={path} variant="text" icon={ArrowRight} aria-label={`View details: ${s.title}`}>
          View details
        </Button>
      </div>
    </article>
  )
}
