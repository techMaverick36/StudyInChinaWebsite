import type { ScholarshipStatus } from '../data/scholarships'
import { statusColor, statusColorLight } from '../data/scholarships'

interface StatusBadgeProps {
  status: ScholarshipStatus
  /* `onDark` uses the paler colours that stay readable on the navy heroes. */
  onDark?: boolean
}

/* Dot and label showing whether a scholarship is open. Used on every card and
   on the scholarship hero, so the same status always looks the same. */
export default function StatusBadge({ status, onDark = false }: StatusBadgeProps) {
  const color = onDark ? statusColorLight(status) : statusColor(status)
  return (
    <span className="status-badge" style={{ color }}>
      <span className="status-dot" style={{ background: color }} aria-hidden="true" />
      {status}
    </span>
  )
}
