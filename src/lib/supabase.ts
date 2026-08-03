import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/* Reads the Supabase project keys from .env.local (see .env.example).
   When the keys are absent the site still runs: forms simulate success and
   /admin shows a setup notice. */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const FILES_BUCKET = 'application-files'
