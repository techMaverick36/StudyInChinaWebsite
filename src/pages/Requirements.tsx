import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import { photos, photoBlurs } from '../data/photos'
import { documents } from '../data/content'

export default function Requirements() {
  const navigate = useNavigate()
  usePageMeta(
    'Required Documents | StudyInChinaNow',
    'Every document you need to apply for a Chinese university scholarship from Uganda: passport, transcripts, medical report, Interpol clearance and more, with instructions for each.',
  )

  return (
    <>
      <PageHero
        eyebrow="Documents"
        title="Required documents"
        lede="Everything you need to send, and where to get it."
        photoNote="student preparing documents"
        photo={photos.requirements}
        blur={photoBlurs.requirements}
      />
      <div className="container-860 body-pad">
        <p className="req-intro">
          Start early. Some of these take weeks to obtain.
        </p>

        <div className="docs-table">
          {documents.map((d, i) => (
            <div className="docs-row" key={d.key}>
              <span className="docs-num">{i + 1}</span>
              <div>
                <div className="docs-name-row">
                  <span className="docs-name">{d.name}</span>
                  {d.adv && <span className="docs-chip">Master's &amp; PhD only</span>}
                  {d.cscaOnly && <span className="docs-chip">CSCA scholarships only</span>}
                  {d.generated && <span className="docs-chip good">We complete this for you</span>}
                </div>
                <p className="docs-instr">{d.instr}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <button className="btn-red-md" onClick={() => navigate('/apply')}>
            Apply Now
          </button>
        </div>
      </div>
    </>
  )
}
