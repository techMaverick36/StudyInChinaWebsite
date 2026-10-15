import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import CompareTable from '../components/CompareTable'
import SectionHeader from '../components/SectionHeader'
import LinkCard from '../components/LinkCard'
import CtaBand from '../components/CtaBand'
import { useScholarships } from '../lib/scholarshipStore'
import { photos, photoBlurs } from '../data/photos'

/* Short answer to "which one is for me", keyed off study level, the CSCA exam
   and the award, which are the things that actually decide it. */
const chooseBy = [
  {
    id: 'henan-masters',
    when: "If you hold a Bachelor's degree",
    then: 'Apply to the Henan Master’s programme: 15 subjects and no entrance exam.',
  },
  {
    id: 'hubei-english-taught',
    when: 'If you have not sat the CSCA exam',
    then: 'Start with the Hubei programme. It needs no exam, and every course is taught in English.',
  },
  {
    id: 'top-ranking-bachelor',
    when: 'If you have strong CSCA results',
    then: 'Apply for the top-ranking university award. A first-class result earns free tuition.',
  },
  {
    id: 'tuition-free-bachelor',
    when: 'If you want tuition covered whatever your result',
    then: 'Apply to the tuition-free programme. It covers every admitted student, and its places close first.',
  },
  {
    id: 'beijing-chinese-language',
    when: 'If you want to learn Chinese first',
    then: 'Take the 1-year Beijing language course. It costs 5,000 RMB after the scholarship.',
  },
  {
    id: 'shijiazhuang-language-csca',
    when: 'If you want to prepare for the CSCA in China',
    then: 'Choose Shijiazhuang. It pairs Chinese language with CSCA preparation, or with Traditional Chinese Medicine.',
  },
]

export default function CompareScholarships() {
  const scholarships = useScholarships()
  usePageMeta(
    'Compare China Scholarships Side by Side | StudyInChinaNow',
    'Compare tuition, accommodation, the CSCA exam, teaching language and eligibility for every Chinese university scholarship open to African students.',
  )

  /* The shortcuts are written against particular programmes. Once the office
     edits the list at /admin one of them may no longer exist, so only the ones
     that still point somewhere are shown. */
  const shortcuts = chooseBy.filter((c) => scholarships.some((s) => s.id === c.id))

  return (
    <>
      <PageHero
        back={{ to: '/scholarships', label: 'All scholarships' }}
        title="Compare the scholarship programmes"
        lede="Check tuition, accommodation, the CSCA exam and eligibility for every programme, then open the one that fits."
        photoNote="university campus in China"
        photo={photos.scholarships}
        blur={photoBlurs.scholarships}
        maxWidth={1140}
      />

      <div className="container body-pad">
        <CompareTable scholarships={scholarships} />
      </div>

      {shortcuts.length > 0 && (
        <section className="section-ruled">
          <div className="container section-pad">
            <SectionHeader title="Choose by your situation" />
            <div className="link-card-grid">
              {shortcuts.map((c) => (
                <LinkCard key={c.id} to={`/scholarships/${c.id}`} title={c.when} text={c.then} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand text="One application covers whichever programme you choose. The form takes about 15 minutes." />
    </>
  )
}
