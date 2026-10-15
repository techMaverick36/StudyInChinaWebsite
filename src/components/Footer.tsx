import { Link } from 'react-router-dom'
import { contact } from '../data/content'

const footerLinks = [
  { label: 'Home', path: '/' },
  { label: 'Scholarships', path: '/scholarships' },
  { label: 'Requirements', path: '/requirements' },
  { label: 'How to Apply', path: '/how-to-apply' },
  { label: 'Contact', path: '/contact' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand-row">
            <span className="footer-brand-name">StudyInChinaNow</span>
          </div>
          <p className="footer-blurb">
            Scholarship placement for African students at accredited
            Chinese universities. Office in Kampala, Uganda.
          </p>
        </div>
        <div>
          <div className="footer-head">Pages</div>
          <div className="footer-links">
            {footerLinks.map((l) => (
              <Link key={l.path} className="footer-link" to={l.path}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-head">Contact</div>
          <div className="footer-contact">
            {contact.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            <br />
            <a href={`tel:${contact.phone.replace(/s+/g, '')}`}>{contact.phone}</a>
            <br />
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        {/* The year in the prerendered HTML is the build's; across New Year the
            browser's differs, which is expected rather than a hydration bug. */}
        <div className="footer-bottom-inner" suppressHydrationWarning>
          © {new Date().getFullYear()} StudyInChinaNow. A service of Enjosh Investments Limited.
        </div>
      </div>
    </footer>
  )
}
