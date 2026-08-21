import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import { seedScholarships } from '../data/scholarships'
import type { LevelKey, Scholarship, ScholarshipStatus } from '../data/scholarships'

/* Scholarships live in Supabase so the office can edit them at /admin without a
   developer. The built-in list in data/scholarships.ts is the fallback: it is
   used when Supabase is not configured, the query fails, or nothing has been
   saved yet, so the public pages never render an empty scholarships list.

   ScholarshipsProvider.tsx holds the provider component; everything else about
   the store lives here. */

export const SCHOLARSHIPS_TABLE = 'scholarships'

/* ---------- Database row ---------- */

/* Columns are snake_case as Postgres writes them; the app works in the camelCase
   Scholarship shape, and the two mappers below are the only place that knows
   about the difference. */
export interface ScholarshipRow {
  id: string
  sort_order: number
  published: boolean
  title: string
  short_title: string | null
  levels: string
  level_keys: string[]
  location: string
  status: string
  closing_label: string
  closing_kv: string
  csca_required: boolean
  majors: string[]
  compare: Partial<Scholarship['compare']> | null
  blurb: string
  about1: string
  about2: string
  facts: { label: string; value: string }[] | null
  eligibility: string[]
  funding: string
  timeline: string
  fees: string
}

/* A scholarship as the admin panel handles it: the public shape plus the two
   fields that only decide where and whether it is shown. */
export interface AdminScholarship extends Scholarship {
  sortOrder: number
  published: boolean
}

const asArray = <T,>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : [])

export function fromRow(row: ScholarshipRow): AdminScholarship {
  return {
    id: row.id,
    title: row.title,
    shortTitle: row.short_title ?? undefined,
    levels: row.levels,
    levelKeys: asArray(row.level_keys) as LevelKey[],
    location: row.location,
    /* Guard against a status typed straight into the database that the colour
       helpers would not recognise. */
    status: (row.status === 'Closing soon' ? 'Closing soon' : 'Open') as ScholarshipStatus,
    closingLabel: row.closing_label,
    closingKV: row.closing_kv,
    cscaRequired: !!row.csca_required,
    majors: asArray(row.majors),
    compare: {
      tuition: row.compare?.tuition ?? '',
      accommodation: row.compare?.accommodation ?? '',
      taughtIn: row.compare?.taughtIn ?? '',
      openTo: row.compare?.openTo ?? '',
      extraAward: row.compare?.extraAward ?? '',
    },
    blurb: row.blurb,
    about1: row.about1,
    about2: row.about2,
    facts: asArray(row.facts).filter((f) => f?.label || f?.value),
    eligibility: asArray(row.eligibility),
    funding: row.funding,
    timeline: row.timeline,
    fees: row.fees,
    sortOrder: row.sort_order,
    published: !!row.published,
  }
}

export function toRow(s: AdminScholarship): ScholarshipRow {
  return {
    id: s.id,
    sort_order: s.sortOrder,
    published: s.published,
    title: s.title,
    short_title: s.shortTitle?.trim() ? s.shortTitle.trim() : null,
    levels: s.levels,
    level_keys: s.levelKeys,
    location: s.location,
    status: s.status,
    closing_label: s.closingLabel,
    closing_kv: s.closingKV,
    csca_required: s.cscaRequired,
    majors: s.majors,
    compare: s.compare,
    blurb: s.blurb,
    about1: s.about1,
    about2: s.about2,
    facts: s.facts,
    eligibility: s.eligibility,
    funding: s.funding,
    timeline: s.timeline,
    fees: s.fees,
  }
}

/* The built-in programmes as admin records, used as the "copy the built-in
   programmes in" starting point in the panel. */
export const seedAsAdminRecords = (): AdminScholarship[] =>
  seedScholarships.map((s, i) => ({ ...s, sortOrder: (i + 1) * 10, published: true }))

/* ---------- Store ---------- */

export interface ScholarshipStore {
  scholarships: Scholarship[]
  /* True until the first load settles. Pages keep rendering the fallback
     meanwhile, so this is only needed where an empty state would flash. */
  loading: boolean
  /* Where the programmes on screen came from, so the admin panel can say so. */
  source: 'database' | 'built-in'
  reload: () => Promise<void>
}

export const ScholarshipsContext = createContext<ScholarshipStore | null>(null)

/* Builds the value the provider hands down. Kept here so the provider file is
   nothing but the component. */
export function useScholarshipsValue(): ScholarshipStore {
  const [rows, setRows] = useState<Scholarship[] | null>(null)
  const [loading, setLoading] = useState(!!supabase)

  const load = useCallback(async () => {
    if (!supabase) {
      setRows(null)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from(SCHOLARSHIPS_TABLE)
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    /* Any failure here (table not created yet, network down, RLS) falls back to
       the built-in programmes rather than showing the visitor nothing. */
    if (error) console.error('Could not load scholarships:', error.message)
    const list = error ? null : ((data as ScholarshipRow[] | null) ?? []).map(fromRow)
    setRows(list && list.length > 0 ? list : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  return useMemo(
    () => ({
      scholarships: rows ?? seedScholarships,
      loading,
      source: rows ? 'database' : 'built-in',
      reload: load,
    }),
    [rows, loading, load],
  )
}

export function useScholarshipStore(): ScholarshipStore {
  const ctx = useContext(ScholarshipsContext)
  /* Rendering outside the provider is a programming error, but falling back to
     the built-in list keeps a page up rather than crashing it. */
  if (!ctx) {
    return {
      scholarships: seedScholarships,
      loading: false,
      source: 'built-in',
      reload: async () => {},
    }
  }
  return ctx
}

export const useScholarships = (): Scholarship[] => useScholarshipStore().scholarships

export function useScholarship(id: string | undefined): Scholarship | undefined {
  return useScholarships().find((s) => s.id === id)
}
