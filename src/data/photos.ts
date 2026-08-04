import heroImg from '../assets/hero.jpg'
import pekingGraduates from '../assets/grad4.jpg'
import capToss from '../assets/grad3.jpg'
import campusCeremony from '../assets/landdscape.jpg'

/* Page photography.

   Imported so Vite fingerprints and serves them efficiently. Several pages
   reuse an image until more photographs arrive; swap a value here and the
   page picks it up. Set a value to '' to fall back to the striped placeholder
   with its "PHOTO ..." label. */

export const photos = {
  home: heroImg,
  scholarships: pekingGraduates,
  scholarshipDetail: campusCeremony,
  requirements: capToss,
  howToApply: pekingGraduates,
  apply: capToss,
  contact: campusCeremony,
} as const

/* 24px-wide previews of the same photographs, inlined so a banner shows the
   right colours the moment the page paints instead of flashing navy while the
   full image downloads. Regenerate if a photo changes. */
const HERO_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAJABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAUDBAb/xAApEAACAAUCAgsAAAAAAAAAAAABAgADBCExERITcQUGFDIzNXOBssHw/8QAFgEBAQEAAAAAAAAAAAAAAAAABAAB/8QAGhEBAQACAwAAAAAAAAAAAAAAAQACAxIxUf/aAAwDAQACEQMRAD8ApUy7NzuX3NLBGQCPfOIkk9YOxz1BqWHDO0rpjNzpDSm76chGH6Q8yrPVb5QXSGajXU1qK6VPlacQFmGgRiXubi4/XAghKngty+1ghXDyxb//2Q=='

const CAP_TOSS_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAJABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAYCAwT/xAAqEAACAQICBwkAAAAAAAAAAAABAgMAEQRRBQYSEyFBkRQiMjRhcXOB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAED/8QAGREAAgMBAAAAAAAAAAAAAAAAAAECAxFB/9oADAMBAAIRAxEAPwDLh9adzEiTxxTMou7bXFsgOQPX8vxOsWKke8c0axKbBUcIGI4n1t7HLMUk5fVSHg61Nw3o6NuG1g0lCu67QshYbADyA2uCR3gbC1uZopUwfmYvkWio2NQYo//Z'

const PEKING_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAJABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAYBAwX/xAAmEAACAQMCBAcAAAAAAAAAAAABAgMABBESIQUGNHIiMTVBUXGy/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAL/xAAXEQADAQAAAAAAAAAAAAAAAAAAAREh/9oADAMBAAIRAxEAPwCmXmWYwAM8KKx0sYg+pc5Gd9sVnDi7a0Q30yhxuxmbwH4NRd+it2r+hS43m33UJVFWDXBzXdWzPb9QASqtICTt7ZzvRS7YddH3mijwLT//2Q=='

const CAMPUS_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAJABgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQBAgMF/8QAKBAAAQMDAgMJAAAAAAAAAAAAAgEDIQAEERIxFBUzNEFxcoGRwtHh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8Agbdp5kAcRD0jrQZznEe8z90ny67K9Q2EaFjKYQiLIzvHf6/nRsPjTi9FzyrUGVwI8KWpUEkhSOE23oqt/wBnc8KKQf/Z'

export const photoBlurs = {
  home: HERO_BLUR,
  scholarships: PEKING_BLUR,
  scholarshipDetail: CAMPUS_BLUR,
  requirements: CAP_TOSS_BLUR,
  howToApply: PEKING_BLUR,
  apply: CAP_TOSS_BLUR,
  contact: CAMPUS_BLUR,
} as const

export type PhotoKey = keyof typeof photos
