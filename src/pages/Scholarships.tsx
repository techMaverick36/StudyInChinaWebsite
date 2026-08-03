import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import { scholarships, statusColor } from '../data/scholarships'

export default function Scholarships() {
  const navigate = useNavigate()
  usePageMeta(
    'Available Scholarships | StudyInChinaNow',
    'Fully funded scholarships for Ugandan students at Chinese universities: China Government (CSC), University President’s, Confucius Institute and Provincial Government awards.',
  )

  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title="Available scholarships"
        lede="These are the programmes we currently place students on. Each one is fully funded or close to it, and each has its own deadline and entry rules. Open the one you are interested in to see what it covers and what you need to apply."
        photoNote="university campus in China"
        maxWidth={1140}
      />
      <div className="container body-pad">
        <div className="sgrid">
          {scholarships.map((c) => (
            <div className="scard" key={c.id}>
              <div className="scard-status">
                <span className="scard-dot" style={{ background: statusColor(c.status) }} />
                <span className="scard-status-label" style={{ color: statusColor(c.status) }}>
                  {c.status}
                </span>
              </div>
              <h2 className="scard-title">{c.title}</h2>
              <div className="scard-levels">{c.levels}</div>
              <div className="scard-loc">{c.location}</div>
              <p className="scard-blurb">{c.blurb}</p>
              <div className="scard-foot">
                <span className="scard-close">{c.closingLabel}</span>
                <button
                  className="scard-view"
                  onClick={() => navigate(`/scholarships/${c.id}`)}
                >
                  View details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
