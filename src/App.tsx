import { Suspense, lazy, useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Scholarships from './pages/Scholarships'
import ScholarshipDetail from './pages/ScholarshipDetail'
import CompareScholarships from './pages/CompareScholarships'
import ScholarshipSubjects from './pages/ScholarshipSubjects'
import HowToApply from './pages/HowToApply'
import Requirements from './pages/Requirements'
import Contact from './pages/Contact'
import Apply from './pages/Apply'
import { ScholarshipsProvider } from './lib/ScholarshipsProvider'
import type { Scholarship } from './data/scholarships'

/* The admin panel carries the rich text editor, which no public page needs.
   Loading it only when /admin is opened keeps it out of every visitor's
   download, which matters to students opening the site on mobile data. */
const Admin = lazy(() => import('./pages/Admin'))

function ScrollToTop() {
  const { pathname } = useLocation()
  /* Only on navigation, not on the first load: a prerendered page is
     readable before the JavaScript arrives, and a student who has already
     scrolled on a slow connection should not be thrown back to the top. */
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* `initialScholarships` is the list a prerendered page was built with
   (see entry-server.tsx); main.tsx passes it back in when hydrating. */
function App({ initialScholarships }: { initialScholarships?: Scholarship[] | null }) {
  return (
    <ScholarshipsProvider initial={initialScholarships}>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/scholarships/compare" element={<CompareScholarships />} />
          <Route path="/scholarships/subjects" element={<ScholarshipSubjects />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
          <Route path="/how-to-apply" element={<HowToApply />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/apply" element={<Apply />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<div className="admin-wrap" />}>
                <Admin />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </ScholarshipsProvider>
  )
}

export default App
