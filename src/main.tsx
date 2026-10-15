import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import type { Scholarship } from './data/scholarships'

/* Public pages arrive prerendered (scripts/prerender.mjs) with the scholarship
   list they were built from; React takes over that HTML instead of redrawing
   it. /admin and unknown addresses get the empty shell and render from
   scratch. */
const container = document.getElementById('root')!
const data = document.getElementById('prerender-data')?.textContent
const initialScholarships = data
  ? (JSON.parse(data) as { scholarships: Scholarship[] | null }).scholarships
  : null

const app = (
  <StrictMode>
    <BrowserRouter>
      <App initialScholarships={initialScholarships} />
    </BrowserRouter>
  </StrictMode>
)

if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
