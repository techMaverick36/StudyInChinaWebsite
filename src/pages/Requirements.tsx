import { ArrowRight } from 'lucide-react'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import Button from '../components/Button'
import { photos, photoBlurs } from '../data/photos'
import { documents } from '../data/content'

export default function Requirements() {
  usePageMeta(
    'Documents Needed to Study in China | StudyInChinaNow',
    'The documents you need for a Chinese university scholarship: passport, transcripts, medical report, Interpol police clearance, recommendation letters and more, with instructions for each.',
  )

  return (
    <>
      <PageHero
        title="Documents you need to study in China"
        lede={`${documents.length} documents, with what each one needs. Some apply only to Master’s applicants or CSCA programmes.`}
        photoNote="student preparing documents"
        photo={photos.requirements}
        blur={photoBlurs.requirements}
      />
      <div className="container-860 body-pad">
        <p className="req-intro">
          Request the Interpol police clearance first. It can take several weeks.
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
                  {d.generated && <span className="docs-chip good">Filled in from your answers</span>}
                </div>
                <p className="docs-instr">{d.instr}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <Button to="/apply" size="lg" icon={ArrowRight}>
            Start your application
          </Button>
        </div>
      </div>
    </>
  )
}
