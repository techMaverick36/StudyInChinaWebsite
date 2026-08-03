import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
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
        lede="Every application needs the same core set of documents. This page lists all of them, what each one is for, and where to get it."
        photoNote="student preparing documents"
      />
      <div className="container-860 body-pad">
        <p className="req-intro">
          Start early. Some of these take weeks to obtain, and missing documents
          are the most common cause of delay.
        </p>

        <div className="download-box">
          <span>
            Blank forms and templates — the foreign student application form,
            recommendation letter and study plan templates.
          </span>
          <a href="/forms/StudyInChinaNow-blank-forms.zip" download>
            Download forms →
          </a>
        </div>

        <div className="docs-table">
          {documents.map((d, i) => (
            <div className="docs-row" key={d.key}>
              <span className="docs-num">{i + 1}</span>
              <div>
                <div className="docs-name-row">
                  <span className="docs-name">{d.name}</span>
                  {d.adv && <span className="docs-chip">Master's &amp; PhD only</span>}
                  {d.cscaOnly && <span className="docs-chip">CSCA scholarships only</span>}
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
