import { ArrowRight } from 'lucide-react'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import Button from '../components/Button'
import { photos, photoBlurs } from '../data/photos'
import { guideSteps, yourOwnCosts } from '../data/content'

export default function HowToApply() {
  usePageMeta(
    'How to Apply for a Scholarship in China | StudyInChinaNow',
    'How to apply for a Chinese university scholarship from Africa in 4 steps: check you qualify, prepare your documents, apply online in 15 minutes, and get a call from our Kampala office.',
  )

  return (
    <>
      <PageHero
        title="How to apply for a scholarship in China"
        lede="4 steps. The online form takes about 15 minutes once your documents are ready."
        photoNote="students being guided at the office"
        photo={photos.howToApply}
        blur={photoBlurs.howToApply}
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

        {/* What the award does not pay for. Sits with the steps so the cost of
            going is clear before anyone starts the form. */}
        <section className="costs-block" aria-labelledby="costs-h">
          <h2 className="costs-h" id="costs-h">
            What you pay for yourself
          </h2>
          <p className="costs-intro">
            The scholarship covers tuition, in full or in part. Budget for these costs with your
            family or sponsor before you apply.
          </p>
          <dl className="cost-list">
            {yourOwnCosts.map((c) => (
              <div className="cost-row" key={c.item}>
                <dt>{c.item}</dt>
                <dd>{c.note}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="prep-box">
          <h3 className="prep-title">Scan your documents before you start</h3>
          <p className="prep-body">
            The form asks you to upload scans or clear photos. The official application
            form is filled in from your answers, so there is nothing to print.
          </p>
          <Button to="/requirements" variant="secondary">
            View required documents
          </Button>
        </div>

        <div className="howto-cta-row">
          <Button to="/apply" size="lg" icon={ArrowRight}>
            Start your application
          </Button>
          <span className="howto-cta-note">Takes about 15 minutes.</span>
        </div>
      </div>
    </>
  )
}
