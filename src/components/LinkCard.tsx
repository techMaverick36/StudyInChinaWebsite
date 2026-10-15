import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface LinkCardProps {
  to: string
  title: string
  text: string
}

/* A tile that is one link: a short heading with an arrow, and a line saying
   where it leads. Used for "which programme is for me" shortcuts and for the
   routes from the scholarships listing to its inner pages. */
export default function LinkCard({ to, title, text }: LinkCardProps) {
  return (
    <Link className="link-card" to={to}>
      <span className="link-card-title">
        {title}
        <ArrowRight className="link-card-arrow" size={18} aria-hidden="true" />
      </span>
      <span className="link-card-text">{text}</span>
    </Link>
  )
}
