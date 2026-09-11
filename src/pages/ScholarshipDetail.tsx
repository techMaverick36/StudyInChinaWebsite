import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import { statusColorLight } from '../data/scholarships'
import { useScholarship, useScholarshipStore } from '../lib/scholarshipStore'
import { photos, photoBlurs } from '../data/photos'
import HeroBackdrop from '../components/HeroBackdrop'
import RichText from '../components/RichText'

export default function ScholarshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detailsOpen, setDetailsOpen] = useState(false)
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

  const dotColor = statusColorLight(sel.status)

  return (
    <>
      <section className="page-hero detail">
        <HeroBackdrop
          src={photos.scholarshipDetail}
          blur={photoBlurs.scholarshipDetail}
        />
        <div className="page-hero-shade deep" />
        <div className="page-hero-back-row">
          <button className="hero-back" onClick={() => navigate('/scholarships')}>
            ← All scholarships
          </button>
        </div>
        <div className="page-hero-inner detail-pad" style={{ maxWidth: 860 }}>
          <div className="hero-status-row">
            <span className="hero-status-dot" style={{ background: dotColor }} />
            <span className="hero-status-label" style={{ color: dotColor }}>
              {sel.status}
            </span>
            <span className="hero-status-sep">·</span>
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
          <h2 className="detail-h mb16">Requirements</h2>
          <ul className="req-list">
            {sel.eligibility.map((e) => (
              <li className="req-item" key={e}>
                <span className="req-bullet">·</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="acc-box">
          <button
            className="acc-toggle"
            onClick={() => setDetailsOpen((o) => !o)}
            aria-expanded={detailsOpen}
          >
            <span>Details</span>
            <span className="acc-sign">{detailsOpen ? '–' : '+'}</span>
          </button>
          {detailsOpen && (
            <div className="acc-panel">
              <RichText html={sel.funding} lead="What the award covers." className="acc-rich" />
              <RichText html={sel.timeline} lead="Timeline." className="acc-rich" />
              <RichText html={sel.fees} lead="Fees." className="acc-rich" />
            </div>
          )}
        </div>

        <button
          className="btn-red-md"
          onClick={() => navigate(`/apply?scholarship=${sel.id}`)}
        >
          Apply Now
        </button>
      </div>
    </>
  )
}
