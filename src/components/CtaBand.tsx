import { ArrowRight } from 'lucide-react'
import Button from './Button'

interface CtaBandProps {
  title?: string
  text: string
  buttonLabel?: string
  to?: string
}

/* Closing call to action at the foot of a page. */
export default function CtaBand({
  title = 'Apply for a scholarship in China',
  text,
  buttonLabel = 'Start your application',
  to = '/apply',
}: CtaBandProps) {
  return (
    <section className="cta-band">
      <div className="cta-inner">
        <h2 className="cta-title">{title}</h2>
        <p className="cta-p">{text}</p>
        <Button to={to} size="lg" icon={ArrowRight}>
          {buttonLabel}
        </Button>
      </div>
    </section>
  )
}
