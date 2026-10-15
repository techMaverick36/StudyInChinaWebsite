import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from './Button'

const navItems = [
  { label: 'Scholarships', path: '/scholarships' },
  { label: 'Requirements', path: '/requirements' },
  { label: 'How to Apply', path: '/how-to-apply' },
  { label: 'Contact', path: '/contact' },
]

export default function Header() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) =>
    pathname === path || (path === '/scholarships' && pathname.startsWith('/scholarships/'))

  return (
    <header className={`site-header${menuOpen ? ' menu-open' : ''}`}>
      <div className="site-header-inner">
        <Link
          className="brand"
          to="/"
          aria-label="StudyInChinaNow home"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-name">StudyInChinaNow</span>
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
        {/* Any link tapped in the phone menu closes it. */}
        <nav
          id="site-nav"
          className="site-nav"
          aria-label="Main navigation"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) setMenuOpen(false)
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link${isActive(item.path) ? ' active' : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Button to="/apply" size="sm" className="nav-apply">
            Apply now
          </Button>
        </nav>
      </div>
    </header>
  )
}
