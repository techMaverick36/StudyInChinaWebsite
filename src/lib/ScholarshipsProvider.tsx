import type { ReactNode } from 'react'
import { ScholarshipsContext, useScholarshipsValue } from './scholarshipStore'

/* Makes the saved scholarships available to every page. The loading and
   fallback behaviour lives in scholarshipStore.ts. */
export function ScholarshipsProvider({ children }: { children: ReactNode }) {
  return (
    <ScholarshipsContext.Provider value={useScholarshipsValue()}>
      {children}
    </ScholarshipsContext.Provider>
  )
}
