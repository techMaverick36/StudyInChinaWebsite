import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import { guideSteps } from '../data/content'

export default function HowToApply() {
  const navigate = useNavigate()
  usePageMeta(
    'How to Apply | StudyInChinaNow',
    'How to apply for a fully funded scholarship in China from Uganda: check you qualify, prepare your documents, complete one online application, and we handle the rest.',
  )

  return (
    <>
      <PageHero
        eyebrow="How to apply"
        title="A simple, step-by-step guide"
        lede="The whole application happens on this website and takes about 10 to 15 minutes once your documents are ready. Here is what happens at each stage, and what we do for you."
        photoNote="students being guided at the office"
      />
      <div className="container-860 body-pad">
        <div>
          {guideSteps.map((g) => (
            <div className="guide-row" key={g.num}>
              <div className="guide-num">{g.num}</div>
              <div>
                <h2 className="guide-title">{g.title}</h2>
                <p className="guide-body">{g.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="prep-box">
          <h3 className="prep-title">Before you begin, prepare your documents</h3>
          <p className="prep-body">
            You will need scanned copies of your documents to finish the
            application. The full list is on the Requirements page, together
            with blank copies of the application form, recommendation letter
            and study plan templates you can download.
          </p>
          <button className="btn-outline-navy" onClick={() => navigate('/requirements')}>
            View required documents
          </button>
        </div>

        <div className="howto-cta-row">
          <button className="btn-red-md" onClick={() => navigate('/apply')}>
            Start your application
          </button>
          <span className="howto-cta-note">Takes about 10–15 minutes.</span>
        </div>
      </div>
    </>
  )
}
