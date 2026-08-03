import { FILES_BUCKET, supabase } from './supabase'

/* Form submissions. With Supabase configured (see .env.example) these save
   applications, uploaded documents and contact messages for the admin panel
   at /admin. Without it they simulate success so the UI can be reviewed. */

export interface UploadEntry {
  /* What the applicant sees next to the tick: a filename or a link. */
  label: string
  file?: File
  link?: string
}

export interface ApplicationPayload {
  scholarshipId: string
  scholarshipTitle: string
  level: string
  form: Record<string, string>
  uploads: Record<string, UploadEntry>
}

export interface ContactPayload {
  name: string
  contact: string
  message: string
}

const simulate = () => new Promise<void>((resolve) => setTimeout(resolve, 400))

export const MAX_FILE_MB = 10
export const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

/* An error whose `message` is safe and useful to show to the applicant. */
export class SubmitError extends Error {}

function friendlyUploadError(fileName: string, raw: string): string {
  if (/row-level security|not authorized|policy|permission/i.test(raw)) {
    return `Our system refused the upload of "${fileName}". This is a problem on our side, not with your file. Please try again later, or send your documents to the office on WhatsApp.`
  }
  if (/too large|exceeded|payload/i.test(raw)) {
    return `"${fileName}" is too large. Please upload a file under ${MAX_FILE_MB} MB.`
  }
  if (/network|fetch|failed to fetch|timeout/i.test(raw)) {
    return `The connection dropped while uploading "${fileName}". Check your internet connection and try again.`
  }
  return `"${fileName}" could not be uploaded. Please try again, or replace it with a fresh scan.`
}

export async function submitApplication(payload: ApplicationPayload): Promise<void> {
  if (!supabase) {
    console.info('Application submitted (stub, Supabase not configured):', payload)
    await simulate()
    return
  }

  const appId = crypto.randomUUID()
  const uploadsMeta: Record<string, { name: string; path?: string; link?: string }> = {}

  for (const [key, u] of Object.entries(payload.uploads)) {
    if (u.file) {
      const safeName = u.file.name.replace(/[^\w.-]+/g, '_')
      const path = `${appId}/${key}-${safeName}`
      const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, u.file)
      if (error) {
        console.error(`Upload failed for ${path}:`, error)
        throw new SubmitError(friendlyUploadError(u.file.name, error.message))
      }
      uploadsMeta[key] = { name: u.file.name, path }
    } else if (u.link) {
      uploadsMeta[key] = { name: u.link, link: u.link }
    }
  }

  const { error } = await supabase.from('applications').insert({
    id: appId,
    scholarship_id: payload.scholarshipId,
    scholarship_title: payload.scholarshipTitle,
    level: payload.level,
    form: payload.form,
    uploads: uploadsMeta,
  })
  if (error) {
    console.error('Application insert failed:', error)
    if (/row-level security|policy|permission/i.test(error.message)) {
      throw new SubmitError(
        'Our system could not save your application. This is a problem on our side. Please try again later, or call the office on +256 700 000 000 and we will take your application by phone.',
      )
    }
    throw new SubmitError(
      'Your application could not be saved. Check your internet connection and try again.',
    )
  }
}

export async function submitContactMessage(payload: ContactPayload): Promise<void> {
  if (!supabase) {
    console.info('Contact message submitted (stub, Supabase not configured):', payload)
    await simulate()
    return
  }
  const { error } = await supabase.from('contact_messages').insert(payload)
  if (error) throw new Error(error.message)
}
