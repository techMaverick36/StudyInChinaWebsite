import pekingGraduates from '../assets/grad4.jpg'
import capToss from '../assets/grad3.jpg'
import campusCeremony from '../assets/landdscape.jpg'

/* Page photography.

   Imported so Vite fingerprints and serves them efficiently. Several pages
   reuse an image until more photographs arrive; swap a value here and the
   page picks it up. Set a value to '' to fall back to the striped placeholder
   with its "PHOTO — ..." label. */

export const photos = {
  /* Home keeps the approved prototype photograph (src/assets/hero.jpg). */
  scholarships: pekingGraduates,
  scholarshipDetail: campusCeremony,
  requirements: capToss,
  howToApply: pekingGraduates,
  apply: capToss,
  contact: campusCeremony,
} as const

export type PhotoKey = keyof typeof photos
