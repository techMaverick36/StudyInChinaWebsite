import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Scholarships', path: '/scholarships' },
  { label: 'Requirements', path: '/requirements' },
  { label: 'How to Apply', path: '/how-to-apply' },
  { label: 'Contact', path: '/contact' },
]

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (path: string) =>
    pathname === path || (path === '/scholarships' && pathname.startsWith('/scholarships/'))

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="brand" onClick={() => navigate('/')} aria-label="StudyInChinaNow home">
          <span className="brand-text">
            <span className="brand-name">StudyInChinaNow</span>
            <span className="brand-sub">Study in China · Uganda</span>
          </span>
        </button>
        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link${isActive(item.path) ? ' active' : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-apply" onClick={() => navigate('/apply')}>
            Apply Now
          </button>
        </nav>
      </div>
    </header>
  )
}
