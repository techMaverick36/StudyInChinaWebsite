import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../lib/meta'
import { getScholarship, scholarships } from '../data/scholarships'
import { documents } from '../data/content'
import { photos } from '../data/photos'
import {
  MAX_EDUCATION_ROWS,
  MAX_EMPLOYMENT_ROWS,
  STEP_LABELS,
  TOTAL_STEPS,
  emptyEducationRow,
  emptyEmploymentRow,
  fieldLabels,
  formDefaults,
  sectionFields,
  steps as formSteps,
} from '../data/applicationForm'
import type { EducationRow, EmploymentRow, FieldDef } from '../data/applicationForm'
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_MB,
  SubmitError,
  submitApplication,
} from '../lib/submit'
import type { UploadEntry } from '../lib/submit'

const levelLabels: Record<string, string> = {
  bachelor: "Bachelor's",
  masters: "Master's",
  phd: 'PhD',
}

const DOC_STEP = formSteps.length + 1
const REVIEW_STEP = TOTAL_STEPS
/* The academic step carries the repeatable education and employment records. */
const EDU_STEP = formSteps.findIndex((s) => s.label === 'Academic & referees') + 1
const STUDY_STEP = formSteps.findIndex((s) => s.label === 'Study choice') + 1

export default function Apply() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const initial = getScholarship(params.get('scholarship') ?? undefined)
  const [selectedId, setSelectedId] = useState(initial?.id ?? scholarships[0].id)
  const [step, setStep] = useState(1)
  const [level, setLevel] = useState('bachelor')
  const [form, setForm] = useState<Record<string, string>>({ ...formDefaults })
  const [education, setEducation] = useState<EducationRow[]>([{ ...emptyEducationRow }])
  const [employment, setEmployment] = useState<EmploymentRow[]>([{ ...emptyEmploymentRow }])
  const [signature, setSignature] = useState('')
  const [uploads, setUploads] = useState<Record<string, UploadEntry>>({})
  const [videoEditing, setVideoEditing] = useState(false)
  const [videoLink, setVideoLink] = useState('')
  const [consent, setConsent] = useState(false)
  const [declareHealth, setDeclareHealth] = useState(false)
  const [declareConduct, setDeclareConduct] = useState(false)
  const [declareLaws, setDeclareLaws] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [stepError, setStepError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})
  const [formDocUrl, setFormDocUrl] = useState<string | null>(null)
  const [failedUploads, setFailedUploads] = useState<string[]>([])
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const sel = getScholarship(selectedId) ?? scholarships[0]

  usePageMeta(
    'Apply for a Scholarship | StudyInChinaNow',
    'Apply online for a scholarship in China. We fill in the official Foreign Student Application Form for you from your answers, so there is nothing to print or scan.',
  )

  const effLevel = sel.levelKeys.includes(level as (typeof sel.levelKeys)[number])
    ? level
    : sel.levelKeys[0]
  const isAdvLevel = effLevel === 'masters' || effLevel === 'phd'
  const uploadDocs = documents.filter(
    (d) => (!d.adv || isAdvLevel) && (!d.cscaOnly || sel.cscaRequired) && !d.generated,
  )

  const setField = (name: string) => (value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((errs) => errs.filter((k) => k !== name))
  }

  /* ---------- validation ---------- */
  const missingForStep = (n: number): string[] => {
    const def = formSteps[n - 1]
    if (!def) return []
    const missing = def.sections
      .flatMap((s) => sectionFields(s))
      .filter((f) => !f.optional && !(form[f.name] ?? '').trim())
      .map((f) => f.name)
    if (def.sections.some((s) => sectionFields(s).some((f) => f.name === 'email'))) {
      const email = (form.email ?? '').trim()
      if (email && !/^\S+@\S+\.\S+$/.test(email) && !missing.includes('email')) {
        missing.push('email')
      }
    }
    /* Education history sits with the academic step and needs at least one school. */
    if (n === EDU_STEP && !education.some((r) => r.school.trim())) missing.push('education')
    return missing
  }

  const firstBlockingStep = (target: number): number | null => {
    for (let n = 1; n < target && n <= formSteps.length; n++) {
      if (missingForStep(n).length > 0) return n
    }
    return null
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

  /* Passport rule from the scholarship flyers: at least three years to expiry. */
  const passportWarning = (() => {
    const v = (form.passportExpiry ?? '').trim()
    if (!v) return ''
    const expiry = new Date(v)
    if (Number.isNaN(expiry.getTime())) return ''
    const threeYears = new Date()
    threeYears.setFullYear(threeYears.getFullYear() + 3)
    if (expiry < new Date()) {
      return 'This passport has already expired. You will need to renew it before you can travel.'
    }
    if (expiry < threeYears) {
      return 'Most of these scholarships ask for at least three years left on your passport. You can still apply, but start renewing it now.'
    }
    return ''
  })()

  /* ---------- uploads ---------- */
  const onFilePicked = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileErrors((f) => ({ ...f, [key]: 'That file type will not work. Upload a PDF, JPG or PNG.' }))
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

  /* ---------- education rows ---------- */
  const setEduField = (i: number, key: keyof EducationRow, value: string) => {
    setEducation((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
    setErrors((errs) => errs.filter((k) => k !== 'education'))
  }
  const addEduRow = () =>
    setEducation((rows) =>
      rows.length < MAX_EDUCATION_ROWS ? [...rows, { ...emptyEducationRow }] : rows,
    )
  const removeEduRow = (i: number) =>
    setEducation((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows))

  const setEmpField = (i: number, key: keyof EmploymentRow, value: string) =>
    setEmployment((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  const addEmpRow = () =>
    setEmployment((rows) =>
      rows.length < MAX_EMPLOYMENT_ROWS ? [...rows, { ...emptyEmploymentRow }] : rows,
    )
  const removeEmpRow = (i: number) =>
    setEmployment((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows))

  /* ---------- submit ---------- */
  const onSubmit = async () => {
    if (!consent || !declareHealth || !declareConduct || !declareLaws || submitting) return
    if (!signature.trim()) {
      setErrors(['signature'])
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await submitApplication({
        scholarshipId: sel.id,
        scholarshipTitle: sel.title,
        level: levelLabels[effLevel],
        form: { ...form, signature: signature.trim() },
        education,
        employment,
        uploads,
      })
      setFormDocUrl(result.formDocUrl)
      setFailedUploads(result.failedUploads)
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

  /* ---------- review rows ---------- */
  const dash = (v: string) => (v && v.trim() ? v : '—')
  const dmy = (iso: string) => {
    const [y, m, d] = (iso ?? '').split('-')
    return y && m && d ? `${d}/${m}/${y}` : dash(iso)
  }
  const DATE_FIELDS = new Set(['dob', 'passportIssueDate', 'passportExpiry'])

  /* ---------- field rendering ---------- */
  const renderField = (f: FieldDef) => {
    const hasError = errors.includes(f.name)
    const id = `f-${f.name}`
    const common = {
      id,
      name: f.name,
      className: `field-input${hasError ? ' error' : ''}`,
      value: form[f.name] ?? '',
    }
    return (
      <div className={f.full ? 'field-full' : undefined} key={f.name}>
        <label className="field-label" htmlFor={id}>
          {f.label}
        </label>
        {f.type === 'select' ? (
          <select {...common} onChange={(e) => setField(f.name)(e.target.value)}>
            <option value="">Select…</option>
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : f.type === 'textarea' ? (
          <textarea
            {...common}
            rows={4}
            placeholder={f.placeholder}
            style={{ resize: 'vertical' }}
            onChange={(e) => setField(f.name)(e.target.value)}
          />
        ) : (
          <input
            {...common}
            type={f.type === 'date' ? 'date' : f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}
            placeholder={f.placeholder}
            list={f.name === 'course' ? 'majors-list' : undefined}
            max={f.name === 'dob' ? new Date().toISOString().slice(0, 10) : undefined}
            onChange={(e) => setField(f.name)(e.target.value)}
          />
        )}
        {f.name === 'course' && (
          <datalist id="majors-list">
            {sel.majors.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        )}
        {f.help && <p className="field-help">{f.help}</p>}
        {f.name === 'passportExpiry' && passportWarning && (
          <p className="field-warning">{passportWarning}</p>
        )}
      </div>
    )
  }

  const currentStepDef = formSteps[step - 1]

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-stripes" />
        {photos.apply && (
          <div className="page-hero-photo" style={{ backgroundImage: `url(${photos.apply})` }} />
        )}
        <div className="page-hero-shade deep" />
        {!photos.apply && <span className="photo-badge">PHOTO — student applying online</span>}
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
                  onChange={(e) => {
                    setSelectedId(e.target.value)
                    setParams({ scholarship: e.target.value }, { replace: true })
                  }}
                >
                  {scholarships.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {step <= formSteps.length && (
              <div className="official-note">
                <strong>This is your official Foreign Student Application Form.</strong> We
                fill it in from these answers, so there is nothing to print or scan. You get
                a copy when you submit.
              </div>
            )}

            <p className="apply-step-line">
              Step {step} of {TOTAL_STEPS} — <strong>{STEP_LABELS[step - 1]}</strong>
            </p>

            <div className="apply-progress">
              <div
                className="apply-progress-fill"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <div className="apply-steps-nav">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1
                const state = n < step ? 'done' : n === step ? 'current' : 'todo'
                const dotBg = state === 'todo' ? '#fff' : state === 'current' ? '#c8102e' : '#16395c'
                const dotFg = state === 'todo' ? '#8a96a1' : '#fff'
                const dotBd = state === 'todo' ? '#cdd5dc' : state === 'current' ? '#c8102e' : '#16395c'
                return (
                  <button
                    key={label}
                    className={`apply-step-btn${n <= step ? ' filled' : ''}`}
                    onClick={() => goStep(n)}
                    title={label}
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

            {/* ---- Definition-driven steps ---- */}
            {currentStepDef && (
              <div>
                {/* Study level sits with the study choice step. */}
                {step === STUDY_STEP && (
                  <div className="form-section">
                    <h2 className="form-section-title">Study level</h2>
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
                  </div>
                )}

                {currentStepDef.sections.map((section) => (
                  <div className="form-section" key={section.title}>
                    <h2 className="form-section-title">{section.title}</h2>
                    {section.intro && <p className="form-section-intro">{section.intro}</p>}
                    {section.fields.length > 0 && (
                      <div className="field-grid">{section.fields.map(renderField)}</div>
                    )}
                    {section.groups?.map((group) => (
                      <div className="field-group" key={group.title}>
                        <div className="field-group-title">{group.title}</div>
                        <div className="field-grid">{group.fields.map(renderField)}</div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Education history is repeatable, so it is not definition-driven. */}
                {step === EDU_STEP && (
                  <div className="form-section">
                    <h2 className="form-section-title">Education history</h2>
                    <p className="form-section-intro">
                      Start with the school you attended most recently. Add earlier schools
                      if the scholarship asks for your full record.
                    </p>
                    {errors.includes('education') && (
                      <p className="form-error" role="alert">
                        Enter at least the school you attended most recently.
                      </p>
                    )}
                    {education.map((row, i) => (
                      <div className="edu-row" key={i}>
                        <div className="edu-row-head">
                          <span className="edu-row-title">
                            {i === 0 ? 'Most recent school' : `Previous school ${i}`}
                          </span>
                          {education.length > 1 && (
                            <button className="edu-remove" onClick={() => removeEduRow(i)}>
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="field-grid">
                          <div className="field-full">
                            <label className="field-label" htmlFor={`edu-school-${i}`}>
                              School or university name
                            </label>
                            <input
                              id={`edu-school-${i}`}
                              className={`field-input${errors.includes('education') && i === 0 ? ' error' : ''}`}
                              value={row.school}
                              placeholder="Name of school or university"
                              onChange={(e) => setEduField(i, 'school', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor={`edu-from-${i}`}>
                              From (year)
                            </label>
                            <input
                              id={`edu-from-${i}`}
                              className="field-input"
                              value={row.from}
                              placeholder="e.g. 2021"
                              onChange={(e) => setEduField(i, 'from', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor={`edu-to-${i}`}>
                              To (year, or expected)
                            </label>
                            <input
                              id={`edu-to-${i}`}
                              className="field-input"
                              value={row.to}
                              placeholder="e.g. 2025"
                              onChange={(e) => setEduField(i, 'to', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor={`edu-qual-${i}`}>
                              Certificate obtained
                            </label>
                            <input
                              id={`edu-qual-${i}`}
                              className="field-input"
                              value={row.qualification}
                              placeholder="e.g. UACE, Bachelor of Science"
                              onChange={(e) => setEduField(i, 'qualification', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor={`edu-grades-${i}`}>
                              Grades or points
                            </label>
                            <input
                              id={`edu-grades-${i}`}
                              className="field-input"
                              value={row.grades}
                              placeholder="e.g. 18 points / 3.6 GPA"
                              onChange={(e) => setEduField(i, 'grades', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {education.length < MAX_EDUCATION_ROWS && (
                      <button className="btn-outline-navy" onClick={addEduRow}>
                        Add another school
                      </button>
                    )}
                  </div>
                )}

                {/* Employment record, as required by the official form. */}
                {step === EDU_STEP && (
                  <div className="form-section">
                    <h2 className="form-section-title">Employment record</h2>
                    <p className="form-section-intro">
                      Only if you have worked. Leave this blank if you have come straight from
                      school. Master’s and PhD applicants should fill it in.
                    </p>
                    {employment.map((row, i) => (
                      <div className="edu-row" key={i}>
                        <div className="edu-row-head">
                          <span className="edu-row-title">
                            {i === 0 ? 'Most recent job' : `Previous job ${i}`}
                          </span>
                          {employment.length > 1 && (
                            <button className="edu-remove" onClick={() => removeEmpRow(i)}>
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="field-grid">
                          <div className="field-full">
                            <label className="field-label" htmlFor={`emp-employer-${i}`}>
                              Employer
                            </label>
                            <input
                              id={`emp-employer-${i}`}
                              className="field-input"
                              value={row.employer}
                              placeholder="Name of the organisation"
                              onChange={(e) => setEmpField(i, 'employer', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor={`emp-from-${i}`}>
                              From (year)
                            </label>
                            <input
                              id={`emp-from-${i}`}
                              className="field-input"
                              value={row.from}
                              placeholder="e.g. 2023"
                              onChange={(e) => setEmpField(i, 'from', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor={`emp-to-${i}`}>
                              To (year, or "present")
                            </label>
                            <input
                              id={`emp-to-${i}`}
                              className="field-input"
                              value={row.to}
                              placeholder="e.g. 2025"
                              onChange={(e) => setEmpField(i, 'to', e.target.value)}
                            />
                          </div>
                          <div className="field-full">
                            <label className="field-label" htmlFor={`emp-post-${i}`}>
                              Post held
                            </label>
                            <input
                              id={`emp-post-${i}`}
                              className="field-input"
                              value={row.post}
                              placeholder="e.g. Laboratory assistant"
                              onChange={(e) => setEmpField(i, 'post', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {employment.length < MAX_EMPLOYMENT_ROWS && (
                      <button className="btn-outline-navy" onClick={addEmpRow}>
                        Add another job
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---- Documents ---- */}
            {step === DOC_STEP && (
              <div>
                <p className="upload-intro">
                  Upload clear scans or photos. PDF, JPG and PNG all work. If something is
                  not ready, submit anyway and send it to us afterwards.
                </p>
                <p className="upload-count">
                  Showing {uploadDocs.length} document slots for a{' '}
                  {levelLabels[effLevel].toLowerCase()} application.
                </p>
                <div className="official-note good">
                  <strong>You do not need the foreign student application form.</strong> We
                  generate it from your answers and attach it to your file.
                </div>
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
                              isVideo ? setVideoEditing(true) : fileInputs.current[d.key]?.click()
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

            {/* ---- Review ---- */}
            {step === REVIEW_STEP && (
              <div>
                <h2 className="review-h">Review your application</h2>
                <p className="form-section-intro">
                  Check everything below. This is exactly what goes onto your form. Use the
                  step numbers above to change anything.
                </p>

                <div className="review-table">
                  <div className="review-row">
                    <div className="review-label">Scholarship</div>
                    <div className="review-value">{sel.title}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Study level</div>
                    <div className="review-value">{levelLabels[effLevel]}</div>
                  </div>
                </div>

                {formSteps.map((s) =>
                  s.sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="review-section-h">{section.title}</h3>
                      <div className="review-table">
                        {sectionFields(section).map((f) => (
                          <div className="review-row" key={f.name}>
                            <div className="review-label">{fieldLabels[f.name]}</div>
                            <div className="review-value">
                              {DATE_FIELDS.has(f.name)
                                ? dmy(form[f.name])
                                : dash(form[f.name])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )),
                )}

                <h3 className="review-section-h">Education history</h3>
                <div className="review-table">
                  {education
                    .filter((r) => r.school.trim())
                    .map((r, i) => (
                      <div className="review-row" key={i}>
                        <div className="review-label">{i === 0 ? 'Most recent' : `Previous ${i}`}</div>
                        <div className="review-value">
                          {r.school}
                          {r.from || r.to ? `, ${[r.from, r.to].filter(Boolean).join(' to ')}` : ''}
                          {r.qualification ? `, ${r.qualification}` : ''}
                          {r.grades ? `, ${r.grades}` : ''}
                        </div>
                      </div>
                    ))}
                </div>

                {employment.some((r) => r.employer.trim()) && (
                  <>
                    <h3 className="review-section-h">Employment record</h3>
                    <div className="review-table">
                      {employment
                        .filter((r) => r.employer.trim())
                        .map((r, i) => (
                          <div className="review-row" key={i}>
                            <div className="review-label">{i === 0 ? 'Most recent' : `Previous ${i}`}</div>
                            <div className="review-value">
                              {[r.employer, [r.from, r.to].filter(Boolean).join(' to '), r.post]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                <h3 className="review-section-h">Documents</h3>
                <div className="review-table">
                  <div className="review-row">
                    <div className="review-label">Uploaded</div>
                    <div className="review-value">
                      {uploadDocs.filter((d) => uploads[d.key]).length} of {uploadDocs.length}
                    </div>
                  </div>
                </div>

                <h3 className="review-section-h">Declarations</h3>
                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={declareHealth}
                    onChange={(e) => setDeclareHealth(e.target.checked)}
                  />
                  <span className="consent-text">
                    I am in good health and know of no condition that would stop me studying
                    full time in China.
                  </span>
                </label>
                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={declareConduct}
                    onChange={(e) => setDeclareConduct(e.target.checked)}
                  />
                  <span className="consent-text">
                    I have no criminal record, and I will provide a police clearance
                    certificate.
                  </span>
                </label>
                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={declareLaws}
                    onChange={(e) => setDeclareLaws(e.target.checked)}
                  />
                  <span className="consent-text">
                    While studying I will obey the laws of the Chinese government and the
                    regulations of the university.
                  </span>
                </label>
                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span className="consent-text">
                    All the information I have given above is true and correct, and I consent
                    to it being used to process this application.
                  </span>
                </label>

                <div className="signature-box">
                  <label className="field-label" htmlFor="f-signature">
                    Sign by typing your full name
                  </label>
                  <input
                    id="f-signature"
                    className={`field-input signature-input${errors.includes('signature') ? ' error' : ''}`}
                    value={signature}
                    onChange={(e) => {
                      setSignature(e.target.value)
                      setErrors((errs) => errs.filter((k) => k !== 'signature'))
                    }}
                    placeholder="Type your full name exactly as above"
                  />
                  <p className="field-help">
                    The official form is signed by typing your name. Today’s date is added
                    automatically.
                  </p>
                </div>

                <button
                  className="submit-btn"
                  disabled={
                    !consent ||
                    !declareHealth ||
                    !declareConduct ||
                    !declareLaws ||
                    !signature.trim() ||
                    submitting
                  }
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
              {step < TOTAL_STEPS && (
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
              Thank you. Your application for the {sel.title} has arrived safely, and a member
              of our team will review it personally. We will call or email you within three
              working days to confirm the next steps.
            </p>
            {failedUploads.length > 0 && (
              <div className="confirm-warning" role="alert">
                <strong>
                  {failedUploads.length === 1
                    ? 'One document did not reach us.'
                    : `${failedUploads.length} documents did not reach us.`}
                </strong>{' '}
                Your application is saved and safe, but{' '}
                {failedUploads.map((f, i) => (
                  <span key={f}>
                    {i > 0 && (i === failedUploads.length - 1 ? ' and ' : ', ')}
                    <em>{f}</em>
                  </span>
                ))}{' '}
                did not upload. Send {failedUploads.length === 1 ? 'it' : 'them'} to us on
                WhatsApp and we will add {failedUploads.length === 1 ? 'it' : 'them'} to your
                file. Quote your name when you write.
              </div>
            )}
            <p className="confirm-p2">
              If you do not hear from us within a week, call the office on +256 700 000 000 or
              email admissions@studyinchinanow.com.
            </p>
            {formDocUrl && (
              <p className="confirm-download">
                <a
                  className="btn-outline-navy"
                  href={formDocUrl}
                  download="Application-Form-for-Foreign-Students.pdf"
                >
                  Download your completed application form
                </a>
              </p>
            )}
            <button className="btn-red-md" onClick={() => navigate('/')}>
              Back to home
            </button>
          </div>
        )}
      </div>
    </>
  )
}
