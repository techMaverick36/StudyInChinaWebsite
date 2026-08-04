import { useNavigate } from 'react-router-dom'
import { contact } from '../data/content'

const footerLinks = [
  { label: 'Home', path: '/' },
  { label: 'Scholarships', path: '/scholarships' },
  { label: 'Requirements', path: '/requirements' },
  { label: 'How to Apply', path: '/how-to-apply' },
  { label: 'Contact', path: '/contact' },
]

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand-row">
            <span className="footer-brand-name">StudyInChinaNow</span>
          </div>
          <p className="footer-blurb">
            A Kampala-based placement service helping Ugandan students study at
            Chinese universities on scholarship.
          </p>
        </div>
        <div>
          <div className="footer-head">Pages</div>
          <div className="footer-links">
            {footerLinks.map((l) => (
              <button key={l.path} className="footer-link" onClick={() => navigate(l.path)}>
                {l.label}
              </button>
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
            {contact.phone}
            <br />
            {contact.email}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          © 2026 StudyInChinaNow. A service of Enjosh Investments Limited, registered in Uganda.
        </div>
      </div>
    </footer>
  )
}
