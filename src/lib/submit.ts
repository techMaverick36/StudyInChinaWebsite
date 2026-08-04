import { FILES_BUCKET, supabase } from './supabase'
import { buildApplicationPdf } from './applicationPdf'
import type { EducationRow, EmploymentRow } from '../data/applicationForm'

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
  education: EducationRow[]
  employment: EmploymentRow[]
  uploads: Record<string, UploadEntry>
}

export interface ApplicationResult {
  /* Local blob URL of the generated form (PDF), offered to the applicant. */
  formDocUrl: string
  /* Documents that could not be stored. The application is still saved; the
     applicant is told which files to send another way. */
  failedUploads: string[]
}

/* Short human-friendly reference, e.g. SICN-8F3K2Q. */
function makeReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `SICN-${out}`
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


export async function submitApplication(
  payload: ApplicationPayload,
): Promise<ApplicationResult> {
  const reference = makeReference()

  /* The completed official form as a PDF, following the university template's
     bilingual layout so the office can forward it without retyping anything. */
  const formDoc = buildApplicationPdf({
    reference,
    scholarshipTitle: payload.scholarshipTitle,
    levelLabel: payload.level,
    form: payload.form,
    education: payload.education,
    employment: payload.employment,
    documents: Object.values(payload.uploads).map((u) => u.label),
  })
  const formDocUrl = URL.createObjectURL(formDoc)

  if (!supabase) {
    console.info('Application submitted (stub, Supabase not configured):', payload)
    await simulate()
    return { formDocUrl, failedUploads: [] }
  }

  const appId = crypto.randomUUID()
  const uploadsMeta: Record<string, { name: string; path?: string; link?: string }> = {}
  const failedUploads: string[] = []

  /* A document that will not upload must never cost the applicant their whole
     application: record the failure, keep going, and report it afterwards. */
  for (const [key, u] of Object.entries(payload.uploads)) {
    if (u.file) {
      const safeName = u.file.name.replace(/[^\w.-]+/g, '_')
      const path = `${appId}/${key}-${safeName}`
      const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, u.file)
      if (error) {
        console.error(`Upload failed for ${path}:`, error)
        failedUploads.push(u.file.name)
        uploadsMeta[key] = { name: `${u.file.name} (not received)` }
      } else {
        uploadsMeta[key] = { name: u.file.name, path }
      }
    } else if (u.link) {
      uploadsMeta[key] = { name: u.link, link: u.link }
    }
  }

  /* Store the generated form alongside the applicant's own documents so the
     office can download and forward it from the admin panel. */
  const formPath = `${appId}/Application-Form-for-Foreign-Students.pdf`
  const formUpload = await supabase.storage.from(FILES_BUCKET).upload(formPath, formDoc)
  if (!formUpload.error) {
    uploadsMeta.generatedForm = {
      name: 'Application Form for Foreign Students (completed).pdf',
      path: formPath,
    }
  } else {
    console.error('Generated form upload failed:', formUpload.error)
  }

  const { error } = await supabase.from('applications').insert({
    id: appId,
    scholarship_id: payload.scholarshipId,
    scholarship_title: payload.scholarshipTitle,
    level: payload.level,
    form: {
      ...payload.form,
      reference,
      education: JSON.stringify(payload.education),
      employment: JSON.stringify(payload.employment),
      ...(failedUploads.length > 0
        ? { documentsNotReceived: failedUploads.join(', ') }
        : {}),
    },
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

  return { formDocUrl, failedUploads }
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
