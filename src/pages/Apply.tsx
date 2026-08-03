import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import { getScholarship, scholarships } from '../data/scholarships'
import { documents } from '../data/content'
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_MB,
  SubmitError,
  submitApplication,
} from '../lib/submit'
import type { UploadEntry } from '../lib/submit'

const stepTitles = [
  'Personal details',
  'Study choice',
  'Academic background',
  'Documents',
  'Review & submit',
]

const levelLabels: Record<string, string> = {
  bachelor: "Bachelor's",
  masters: "Master's",
  phd: 'PhD',
}

type FormState = {
  fullName: string
  dob: string
  idnum: string
  phone: string
  email: string
  address: string
  guardian: string
  course: string
  university: string
  school: string
  year: string
  grades: string
}

const emptyForm: FormState = {
  fullName: '',
  dob: '',
  idnum: '',
  phone: '',
  email: '',
  address: '',
  guardian: '',
  course: '',
  university: '',
  school: '',
  year: '',
  grades: '',
}

export default function Apply() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const initial = getScholarship(params.get('scholarship') ?? undefined)
  const [selectedId, setSelectedId] = useState(initial?.id ?? scholarships[0].id)
  const [step, setStep] = useState(1)
  const [level, setLevel] = useState('bachelor')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [uploads, setUploads] = useState<Record<string, UploadEntry>>({})
  const [videoEditing, setVideoEditing] = useState(false)
  const [videoLink, setVideoLink] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [stepError, setStepError] = useState('')
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const sel = getScholarship(selectedId) ?? scholarships[0]

  usePageMeta(
    'Apply for a Scholarship | StudyInChinaNow',
    'Apply online for a fully funded scholarship in China. Five short steps: your details, study choice, academic background, documents and review. Takes about 10 to 15 minutes.',
  )

  /* The study level is constrained to what the selected scholarship offers. */
  const effLevel = sel.levelKeys.includes(level as (typeof sel.levelKeys)[number])
    ? level
    : sel.levelKeys[0]

  const isAdvLevel = effLevel === 'masters' || effLevel === 'phd'
  const uploadDocs = documents.filter(
    (d) => (!d.adv || isAdvLevel) && (!d.cscaOnly || sel.cscaRequired),
  )

  const setField = (name: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [name]: e.target.value }))
    setErrors((errs) => errs.filter((k) => k !== name))
  }

  /* Required fields per step. Step 4 (documents) is deliberately not gated:
     the copy promises applicants can submit and send missing documents later. */
  const requiredByStep: Record<number, (keyof FormState)[]> = {
    1: ['fullName', 'dob', 'idnum', 'phone', 'email', 'guardian', 'address'],
    2: ['course'],
    3: ['school', 'year', 'grades'],
    4: [],
  }

  const missingForStep = (n: number): (keyof FormState)[] => {
    const missing = (requiredByStep[n] ?? []).filter((k) => !form[k].trim())
    if (n === 1 && form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      missing.push('email')
    }
    return missing
  }

  /* Returns the first incomplete step before `target`, or null if the path is clear. */
  const firstBlockingStep = (target: number): number | null => {
    for (let n = 1; n < target; n++) {
      if (missingForStep(n).length > 0) return n
    }
    return null
  }

  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  const onFilePicked = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileErrors((f) => ({
        ...f,
        [key]: 'That file type will not work. Upload a PDF, JPG or PNG.',
      }))
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1)
      setFileErrors((f) => ({
        ...f,
        [key]: `That file is ${mb} MB and the limit is ${MAX_FILE_MB} MB. Scan it again at a lower quality, or compress it, then upload the smaller file.`,
      }))
      return
    }
    setFileErrors((f) => {
      const next = { ...f }
      delete next[key]
      return next
    })
    setUploads((u) => ({ ...u, [key]: { label: file.name, file } }))
  }

  const goStep = (n: number) => {
    if (n > step) {
      const blocking = firstBlockingStep(n)
      if (blocking !== null) {
        setStep(blocking)
        setErrors(missingForStep(blocking))
        setStepError('Please fill in the highlighted fields before continuing.')
        window.scrollTo(0, 0)
        return
      }
    }
    setErrors([])
    setStepError('')
    setStep(n)
    window.scrollTo(0, 0)
  }

  const onSelectScholarship = (id: string) => {
    setSelectedId(id)
    setParams({ scholarship: id }, { replace: true })
  }

  const [submitError, setSubmitError] = useState('')

  const onSubmit = async () => {
    if (!consent || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitApplication({
        scholarshipId: sel.id,
        scholarshipTitle: sel.title,
        level: effLevel,
        form,
        uploads,
      })
      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch (err) {
      console.error(err)
      setSubmitError(
        err instanceof SubmitError
          ? err.message
          : 'Something went wrong while sending your application. Please try again. If it keeps failing, call the office on +256 700 000 000 and we will take your application by phone.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const dash = (v: string) => (v && v.trim() ? v : '—')
  const fmtDob = (v: string) => {
    const [y, m, d] = v.split('-')
    return y && m && d ? `${d}/${m}/${y}` : dash(v)
  }
  const reviewRows = [
    { label: 'Full name', value: dash(form.fullName) },
    { label: 'Date of birth', value: fmtDob(form.dob) },
    { label: 'ID / passport no.', value: dash(form.idnum) },
    { label: 'Phone', value: dash(form.phone) },
    { label: 'Email', value: dash(form.email) },
    { label: 'Home address', value: dash(form.address) },
    { label: 'Guardian', value: dash(form.guardian) },
    { label: 'Study level', value: levelLabels[effLevel] },
    { label: 'Intended course', value: dash(form.course) },
    { label: 'Preferred university', value: dash(form.university) },
    { label: 'School', value: dash(form.school) },
    { label: 'Year', value: dash(form.year) },
    { label: 'Grades', value: dash(form.grades) },
    {
      label: 'Documents uploaded',
      value: `${uploadDocs.filter((d) => uploads[d.key]).length} of ${uploadDocs.length}`,
    },
  ]

  const textField = (
    name: keyof FormState,
    label: string,
    placeholder: string,
    full = false,
  ) => (
    <div className={full ? 'field-full' : undefined}>
      <label className="field-label" htmlFor={`f-${name}`}>
        {label}
      </label>
      <input
        id={`f-${name}`}
        className={`field-input${errors.includes(name) ? ' error' : ''}`}
        name={name}
        value={form[name]}
        onChange={setField(name)}
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-stripes" />
        <div className="page-hero-shade deep" />
        <span className="photo-badge">PHOTO — student applying online</span>
        <div className="page-hero-inner apply-pad" style={{ maxWidth: 780 }}>
          <p className="eyebrow-hero">Application</p>
          <h1 className="page-title no-mb apply-size">Apply for a scholarship</h1>
        </div>
      </section>

      <div className="apply-wrap">
        {!submitted ? (
          <div>
            <div className="apply-banner">
              <div className="apply-banner-main">
                <div className="apply-banner-label">You are applying for</div>
                <div className="apply-banner-title">{sel.title}</div>
              </div>
              <label className="apply-banner-change">
                Change
                <select
                  className="apply-banner-select"
                  value={sel.id}
                  onChange={(e) => onSelectScholarship(e.target.value)}
                >
                  {scholarships.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="apply-step-line">
              Step {step} of 5 — {stepTitles[step - 1]}
            </p>

            <div className="apply-progress">
              <div
                className="apply-progress-fill"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
            <div className="apply-steps-nav">
              {stepTitles.map((label, i) => {
                const n = i + 1
                const state = n < step ? 'done' : n === step ? 'current' : 'todo'
                const dotBg =
                  state === 'todo' ? '#fff' : state === 'current' ? '#c8102e' : '#16395c'
                const dotFg = state === 'todo' ? '#8a96a1' : '#fff'
                const dotBd =
                  state === 'todo' ? '#cdd5dc' : state === 'current' ? '#c8102e' : '#16395c'
                return (
                  <button
                    key={label}
                    className="apply-step-btn"
                    onClick={() => goStep(n)}
                  >
                    <span
                      className="apply-step-dot"
                      style={{ background: dotBg, color: dotFg, borderColor: dotBd }}
                    >
                      {state === 'done' ? '✓' : n}
                    </span>
                    <span
                      className="apply-step-label"
                      style={{
                        color: state === 'current' ? '#c8102e' : '#8794a0',
                        fontWeight: state === 'current' ? 600 : 500,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>

            {step === 1 && (
              <div className="field-grid">
                {textField('fullName', 'Full name (as on passport)', 'e.g. Namono Sarah Achieng')}
                <div>
                  <label className="field-label" htmlFor="f-dob">
                    Date of birth
                  </label>
                  <input
                    id="f-dob"
                    className={`field-input${errors.includes('dob') ? ' error' : ''}`}
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={setField('dob')}
                    min="1950-01-01"
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                {textField('idnum', 'National ID or passport number', 'e.g. CM90000001ABCD')}
                {textField('phone', 'Phone number', '+256 7XX XXX XXX')}
                {textField('email', 'Email address', 'you@example.com')}
                {textField('guardian', 'Guardian / next of kin name', 'Full name')}
                {textField('address', 'Home address', 'Village / division, district', true)}
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="field-label" style={{ marginBottom: 10 }}>
                  Study level
                </label>
                <div className="level-row">
                  {sel.levelKeys.map((k) => (
                    <button
                      key={k}
                      className={`level-btn${effLevel === k ? ' selected' : ''}`}
                      onClick={() => setLevel(k)}
                    >
                      {levelLabels[k]}
                    </button>
                  ))}
                </div>
                <div className="field-grid">
                  <div>
                    <label className="field-label" htmlFor="f-course">
                      Intended course
                    </label>
                    <input
                      id="f-course"
                      className={`field-input${errors.includes('course') ? ' error' : ''}`}
                      name="course"
                      value={form.course}
                      onChange={setField('course')}
                      placeholder="e.g. Civil Engineering"
                      list="majors-list"
                    />
                    <datalist id="majors-list">
                      {sel.majors.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>
                  {textField('university', 'Preferred university (optional)', 'Leave blank if unsure')}
                </div>
                <p className="step-note">
                  Majors open on the {sel.title}: {sel.majors.join(', ')}. Pick
                  one of these, or write another course and we will advise you
                  on where it is available. Leave the university blank if you
                  have no preference and we will match you with a suitable one.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="field-grid">
                {textField('school', 'Current or previous school', 'Name of school or university', true)}
                {textField('year', 'Year completed (or expected)', 'e.g. 2025')}
                {textField('grades', 'Grades / points', 'e.g. 18 points / 3.6 GPA')}
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="upload-intro">
                  Upload clear scans or photos of your documents. PDF, JPG and
                  PNG files all work. If a document is not ready yet, you can
                  still submit your application and send it to us afterwards.
                </p>
                <p className="upload-count">
                  Showing {uploadDocs.length} document slots for a{' '}
                  {levelLabels[effLevel].toLowerCase()} application.
                </p>
                <div className="upload-list">
                  {uploadDocs.map((d) => {
                    const done = !!uploads[d.key]
                    const isVideo = d.key === 'video'
                    return (
                      <div className={`upload-row${done ? ' done' : ''}`} key={d.key}>
                        <div className="upload-row-main">
                          <div className="upload-name">{d.name}</div>
                          <div className="upload-instr">{d.instr}</div>
                          {fileErrors[d.key] && (
                            <div className="upload-row-error" role="alert">
                              {fileErrors[d.key]}
                            </div>
                          )}
                        </div>
                        {done ? (
                          <div className="upload-done-group">
                            <span className="upload-filename">
                              <span className="upload-tick">✓</span>
                              {uploads[d.key].label}
                            </span>
                            <button
                              className="upload-replace"
                              onClick={() => {
                                if (isVideo) {
                                  setVideoEditing(true)
                                  setVideoLink(uploads[d.key].link ?? '')
                                } else {
                                  fileInputs.current[d.key]?.click()
                                }
                              }}
                            >
                              Replace
                            </button>
                          </div>
                        ) : isVideo && videoEditing ? (
                          <div className="link-input-row">
                            <input
                              className="link-input"
                              value={videoLink}
                              onChange={(e) => setVideoLink(e.target.value)}
                              placeholder="Paste your video link"
                              autoFocus
                            />
                            <button
                              className="upload-btn"
                              onClick={() => {
                                if (videoLink.trim()) {
                                  const link = videoLink.trim()
                                  setUploads((u) => ({ ...u, video: { label: link, link } }))
                                  setVideoEditing(false)
                                }
                              }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            className="upload-btn"
                            onClick={() =>
                              isVideo
                                ? setVideoEditing(true)
                                : fileInputs.current[d.key]?.click()
                            }
                          >
                            {isVideo ? 'Add link' : 'Upload file'}
                          </button>
                        )}
                        {!isVideo && (
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            ref={(el) => {
                              fileInputs.current[d.key] = el
                            }}
                            onChange={onFilePicked(d.key)}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="review-h">Review your application</h2>
                <div className="review-table">
                  {reviewRows.map((r) => (
                    <div className="review-row" key={r.label}>
                      <div className="review-label">{r.label}</div>
                      <div className="review-value">{r.value}</div>
                    </div>
                  ))}
                </div>
                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span className="consent-text">
                    I confirm the information is true and consent to my data
                    being used to process this application.
                  </span>
                </label>
                <button
                  className="submit-btn"
                  disabled={!consent || submitting}
                  onClick={onSubmit}
                >
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
                {submitError && (
                  <p className="form-error" role="alert">
                    {submitError}
                  </p>
                )}
              </div>
            )}

            {stepError && (
              <p className="form-error" role="alert">
                {stepError}
              </p>
            )}

            <div className="apply-nav-row">
              {step > 1 ? (
                <button className="btn-outline-navy" onClick={() => goStep(step - 1)}>
                  Back
                </button>
              ) : (
                <span />
              )}
              {step < 5 && (
                <button className="btn-continue" onClick={() => goStep(step + 1)}>
                  Continue
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="confirm-wrap">
            <div className="confirm-tick">✓</div>
            <h1 className="confirm-title">Application received</h1>
            <p className="confirm-p1">
              Thank you. Your application for the {sel.title} has arrived safely,
              and a member of our team will review it personally. We will call or
              email you within three working days to confirm the next steps.
            </p>
            <p className="confirm-p2">
              If you do not hear from us within a week, call the office on
              +256 700 000 000 or email admissions@studyinchinanow.com.
            </p>
            <button className="btn-red-md" onClick={() => navigate('/')}>
              Back to home
            </button>
          </div>
        )}
      </div>
    </>
  )
}
