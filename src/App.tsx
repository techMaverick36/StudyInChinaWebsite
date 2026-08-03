import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Scholarships from './pages/Scholarships'
import ScholarshipDetail from './pages/ScholarshipDetail'
import HowToApply from './pages/HowToApply'
import Requirements from './pages/Requirements'
import Contact from './pages/Contact'
import Apply from './pages/Apply'
import Admin from './pages/Admin'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
          <Route path="/how-to-apply" element={<HowToApply />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
