import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import ScholarshipCard from '../components/ScholarshipCard'
import SectionHeader from '../components/SectionHeader'
import LinkCard from '../components/LinkCard'
import CtaBand from '../components/CtaBand'
import { useScholarships } from '../lib/scholarshipStore'
import { photos, photoBlurs } from '../data/photos'

/* The listing stays short: the programmes themselves, then the way into the
   detail. The side-by-side comparison and the subject index each have their
   own page under /scholarships. */
export default function Scholarships() {
  const scholarships = useScholarships()
  const subjectCount = new Set(
    scholarships.flatMap((s) => s.majors.map((m) => m.replace(/\s*\(self-funded\)$/, ''))),
  ).size
  usePageMeta(
    'Scholarships in China Open to African Students | StudyInChinaNow',
    `${scholarships.length} scholarships at Chinese universities open to African students: Bachelor's, Master's and Chinese language. See what each one covers, who can apply and when it closes.`,
  )

  return (
    <>
      <PageHero
        title="Scholarships open to African students"
        lede={`${scholarships.length} programmes at Chinese universities. Open a programme to see its intake, what it covers and who can apply.`}
        photoNote="university campus in China"
        photo={photos.scholarships}
        blur={photoBlurs.scholarships}
        maxWidth={1140}
      />

      <div className="container body-pad">
        <div className="card-grid">
          {scholarships.map((c) => (
            <ScholarshipCard key={c.id} scholarship={c} />
          ))}
        </div>
      </div>

      <section className="section-ruled">
        <div className="container section-pad">
          <SectionHeader
            title="Compare and choose"
            intro="Put the programmes side by side, or start from the subject you want to study."
          />
          <div className="link-card-grid two">
            <LinkCard
              to="/scholarships/compare"
              title="Compare the programmes"
              text="Tuition, accommodation, the CSCA exam and who can apply, side by side, with a quick guide to choosing."
            />
            <LinkCard
              to="/scholarships/subjects"
              title="Find a course by subject"
              text={`All ${subjectCount} subjects, A to Z, and the programmes that offer each one.`}
            />
          </div>
        </div>
      </section>

      <CtaBand text="One application covers whichever programme you choose. The form takes about 15 minutes." />
    </>
  )
}
