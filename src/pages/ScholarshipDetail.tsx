import { Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../lib/meta'
import { useScholarship, useScholarshipStore } from '../lib/scholarshipStore'
import { photos, photoBlurs } from '../data/photos'
import HeroBackdrop from '../components/HeroBackdrop'
import RichText from '../components/RichText'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'

export default function ScholarshipDetail() {
  const { id } = useParams()
  const { loading } = useScholarshipStore()
  const sel = useScholarship(id)

  usePageMeta(
    sel ? `${sel.title} | StudyInChinaNow` : 'Scholarship | StudyInChinaNow',
    sel
      ? `${sel.title} for African students: ${sel.levels}. ${sel.location}. ${sel.closingLabel}. See what the award covers and how to apply.`
      : 'Scholarship details.',
  )

  /* On a cold load of a deep link the saved programmes have not arrived yet, so
     an unknown id is only really unknown once the load has settled. */
  if (!sel) return loading ? <div className="body-pad" /> : <Navigate to="/scholarships" replace />

  return (
    <>
      <section className="page-hero detail">
        <HeroBackdrop
          src={photos.scholarshipDetail}
          blur={photoBlurs.scholarshipDetail}
        />
        <div className="page-hero-shade deep" />
        <div className="page-hero-back-row">
          <Button to="/scholarships" variant="text-light" icon={ArrowLeft} iconPosition="start">
            All scholarships
          </Button>
        </div>
        <div className="page-hero-inner detail-pad" style={{ maxWidth: 860 }}>
          <div className="hero-status-row">
            <StatusBadge status={sel.status} onDark />
            <span className="hero-status-close">{sel.closingLabel}</span>
          </div>
          <h1 className="page-title no-mb">{sel.title}</h1>
        </div>
      </section>

      <div className="container-860 body-pad">
        <div className="detail-block">
          <h2 className="detail-h">About this scholarship</h2>
          <RichText html={sel.about1} className="detail-rich" />
          <RichText html={sel.about2} className="detail-rich" />
        </div>

        <div className="detail-block">
          <h2 className="detail-h mb16">Key facts</h2>
          <div className="facts-table">
            {sel.facts.map((f) => (
              <div className="facts-row" key={f.label}>
                <div className="facts-label">{f.label}</div>
                <div className="facts-value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-block">
          <h2 className="detail-h mb16">Who can apply</h2>
          <ul className="req-list">
            {sel.eligibility.map((e) => (
              <li className="req-item" key={e}>
                <span className="req-bullet" aria-hidden="true" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Funding, timeline and fees stay on the page rather than behind a
            toggle: they are what students and sponsors come to check, and
            search engines read only what the page shows. */}
        {[
          { title: 'What the award covers', html: sel.funding },
          { title: 'Timeline', html: sel.timeline },
          { title: 'Fees', html: sel.fees },
        ]
          .filter((b) => b.html.trim())
          .map((b) => (
            <div className="detail-block" key={b.title}>
              <h2 className="detail-h">{b.title}</h2>
              <RichText html={b.html} className="detail-rich" />
            </div>
          ))}

        <Button to={`/apply?scholarship=${sel.id}`} size="lg" icon={ArrowRight}>
          Apply for this scholarship
        </Button>
      </div>
    </>
  )
}
