import type { ReactNode } from 'react'
import type { Scholarship } from '../data/scholarships'
import { ScholarshipsContext, useScholarshipsValue } from './scholarshipStore'

/* Makes the saved scholarships available to every page. The loading and
   fallback behaviour lives in scholarshipStore.ts. `initial` is the list the
   page was prerendered with, when there is one. */
export function ScholarshipsProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: Scholarship[] | null
}) {
  return (
    <ScholarshipsContext.Provider value={useScholarshipsValue(initial)}>
      {children}
    </ScholarshipsContext.Provider>
  )
}
