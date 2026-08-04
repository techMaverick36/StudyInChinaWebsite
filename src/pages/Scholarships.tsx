import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import { scholarships, statusColor } from '../data/scholarships'
import { photos, photoBlurs } from '../data/photos'
import { yourOwnCosts } from '../data/content'

/* Short answer to "which one is for me", keyed off the CSCA exam and the
   award, which are the two things that actually decide it. */
const chooseBy = [
  {
    id: 'hubei-english-taught',
    when: 'You have not sat the CSCA exam',
    then: 'Start with the Hubei programme. No exam is required and every course is taught in English.',
  },
  {
    id: 'top-ranking-bachelor',
    when: 'You have strong CSCA results',
    then: 'The top-ranking university award turns a first-class result into free tuition.',
  },
  {
    id: 'tuition-free-bachelor',
    when: 'You want tuition covered whatever your result',
    then: 'The tuition-free programme covers every admitted student. Places close first.',
  },
]

export default function Scholarships() {
  const navigate = useNavigate()
  usePageMeta(
    'Available Scholarships | StudyInChinaNow',
    'Scholarships for Ugandan students at Chinese universities for the September 2026 intake, with tuition covered in full or in part. Compare what each one covers and who can apply.',
  )

  /* Students look for a subject, not a scholarship name, so the majors are
     indexed the way they search. */
  const bySubject = new Map<string, string[]>()
  for (const s of scholarships) {
    for (const m of s.majors) {
      const key = m.replace(/\s*\(self-funded\)$/, '')
      bySubject.set(key, [...(bySubject.get(key) ?? []), s.title])
    }
  }
  const subjects = [...bySubject.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  const shortName = (title: string) => title.replace(/ Bachelor Scholarship$/, '')

  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title="Available scholarships"
        lede="The programmes we are placing students on now. Open one to see what it covers and who can apply."
        photoNote="university campus in China"
        photo={photos.scholarships}
        blur={photoBlurs.scholarships}
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

      {/* Side by side comparison */}
      <section className="section-tint">
        <div className="container section-pad">
          <p className="eyebrow-red">Side by side</p>
          <h2 className="sec-title">Compare the three</h2>
          <div className="compare-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">&nbsp;</th>
                  {scholarships.map((s) => (
                    <th scope="col" key={s.id}>
                      {shortName(s.title)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Tuition</th>
                  <td>Free with a first-class CSCA result, half with a second-class result</td>
                  <td>Free for every admitted student</td>
                  <td>7,000 RMB per year, reduced from 20,000</td>
                </tr>
                <tr>
                  <th scope="row">Accommodation</th>
                  <td>Paid by you</td>
                  <td>Hostel fee 1,800 RMB per year</td>
                  <td>3,000 RMB per year</td>
                </tr>
                <tr>
                  <th scope="row">CSCA exam</th>
                  {scholarships.map((s) => (
                    <td key={s.id}>
                      <span className={s.cscaRequired ? 'flag-need' : 'flag-no'}>
                        {s.cscaRequired ? 'Required' : 'Not needed'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Taught in</th>
                  <td>English</td>
                  <td>English</td>
                  <td>English</td>
                </tr>
                <tr>
                  <th scope="row">Majors</th>
                  {scholarships.map((s) => (
                    <td key={s.id}>{s.majors.length} to choose from</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Extra award</th>
                  <td>None</td>
                  <td>None</td>
                  <td>Hubei provincial award of 20,000 RMB a year for strong students</td>
                </tr>
                <tr>
                  <th scope="row">Intake</th>
                  {scholarships.map((s) => (
                    <td key={s.id}>{s.closingLabel}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">&nbsp;</th>
                  {scholarships.map((s) => (
                    <td key={s.id}>
                      <button
                        className="scard-view"
                        onClick={() => navigate(`/scholarships/${s.id}`)}
                      >
                        View details →
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="choose-h">Choosing between them</h3>
          <div className="choose-grid">
            {chooseBy.map((c) => (
              <button
                className="choose-card"
                key={c.id}
                onClick={() => navigate(`/scholarships/${c.id}`)}
              >
                <span className="choose-when">{c.when}</span>
                <span className="choose-then">{c.then}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Majors indexed by subject */}
      <section>
        <div className="container section-pad">
          <p className="eyebrow-red">Courses</p>
          <h2 className="sec-title">Study by subject</h2>
          <div className="subject-grid">
            {subjects.map(([subject, offered]) => (
              <div className="subject-row" key={subject}>
                <div className="subject-name">{subject}</div>
                <div className="subject-where">
                  {offered.map((title) => (
                    <span className="subject-chip" key={title}>
                      {shortName(title)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="subject-note">
            Clinical Medicine is offered at the top-ranking university but is self-funded, so
            tuition is not covered.
          </p>
        </div>
      </section>

      {/* What the award does not pay for */}
      <section className="section-navy">
        <div className="container section-pad">
          <p className="eyebrow-gold">Be prepared</p>
          <h2 className="sec-title-ondark">What you pay for yourself</h2>
          <p className="costs-intro">
            The scholarship covers tuition, in full or in part. These costs stay with you and
            your family, and knowing them now saves a hard surprise later.
          </p>
          <div className="costs-grid">
            {yourOwnCosts.map((c) => (
              <div className="cost-item" key={c.item}>
                <div className="cost-name">{c.item}</div>
                <div className="cost-note">{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band light">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to study in China?</h2>
          <p className="cta-p">
            One application covers whichever programme you choose. It takes about 15 minutes.
          </p>
          <button className="btn-cta-red" onClick={() => navigate('/apply')}>
            Begin Your Application
          </button>
        </div>
      </section>
    </>
  )
}
