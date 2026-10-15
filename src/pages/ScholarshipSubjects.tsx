import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import CtaBand from '../components/CtaBand'
import { useScholarships } from '../lib/scholarshipStore'
import { photos, photoBlurs } from '../data/photos'

const SELF_FUNDED = /\s*\(self-funded\)$/

interface Offer {
  id: string
  name: string
  selfFunded: boolean
}

export default function ScholarshipSubjects() {
  const scholarships = useScholarships()
  usePageMeta(
    'Courses to Study in China on Scholarship | StudyInChinaNow',
    'Every course you can study in China on our scholarships, A to Z: engineering, medicine, business, computer science, Chinese language and more.',
  )

  /* Students look for a subject, not a scholarship name, so the majors are
     indexed the way they search. A self-funded major stays marked on the
     programme that offers it that way. */
  const bySubject = new Map<string, Offer[]>()
  for (const s of scholarships) {
    for (const m of s.majors) {
      const subject = m.replace(SELF_FUNDED, '')
      const offer = { id: s.id, name: s.title, selfFunded: SELF_FUNDED.test(m) }
      bySubject.set(subject, [...(bySubject.get(subject) ?? []), offer])
    }
  }
  const subjects = [...bySubject.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const anySelfFunded = subjects.some(([, offers]) => offers.some((o) => o.selfFunded))

  return (
    <>
      <PageHero
        back={{ to: '/scholarships', label: 'All scholarships' }}
        title="Courses you can study in China"
        lede={`${subjects.length} subjects, A to Z. Find your subject, then open the programme that offers it.`}
        photoNote="university campus in China"
        photo={photos.scholarships}
        blur={photoBlurs.scholarships}
        maxWidth={1140}
      />

      <div className="container body-pad">
        <div className="subject-grid">
          {subjects.map(([subject, offers]) => (
            <div className="subject-row" key={subject}>
              <div className="subject-name">{subject}</div>
              <div className="subject-where">
                {offers.map((o) => (
                  <Link
                    className="subject-chip"
                    key={`${o.id}-${o.selfFunded}`}
                    to={`/scholarships/${o.id}`}
                  >
                    {o.name}
                    {o.selfFunded && <span className="subject-chip-note">self-funded</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        {anySelfFunded && (
          <p className="subject-note">
            Self-funded subjects are offered at the same university, but tuition is not covered.
          </p>
        )}
      </div>

      <CtaBand text="Apply once and choose your programme on the form. It takes about 15 minutes." />
    </>
  )
}
