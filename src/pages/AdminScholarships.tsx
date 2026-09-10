import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { serviceFees } from '../data/scholarships'
import type { LevelKey, ScholarshipStatus } from '../data/scholarships'
import {
  SCHOLARSHIPS_TABLE,
  fromRow,
  seedAsAdminRecords,
  toRow,
  useScholarshipStore,
} from '../lib/scholarshipStore'
import type { AdminScholarship, ScholarshipRow } from '../lib/scholarshipStore'

/* Scholarships tab of the admin panel: the office adds, edits, reorders and
   removes the programmes shown on the public site. Everything here writes to
   the `scholarships` table; the built-in list in the code is only a fallback
   and can be copied in once with the button on the empty state. */

const LEVEL_OPTIONS: { key: LevelKey; label: string }[] = [
  { key: 'bachelor', label: "Bachelor's" },
  { key: 'masters', label: "Master's" },
  { key: 'phd', label: 'PhD' },
  { key: 'language', label: 'Chinese language' },
]

const STATUS_OPTIONS: ScholarshipStatus[] = ['Open', 'Closing soon']

/* One item per line is how the office already writes these lists, so the long
   fields are edited as text and split on save. */
const linesToList = (v: string) =>
  v
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const listToLines = (v: string[]) => v.join('\n')

/* URL slug for a new programme: /scholarships/<id>. */
const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const MISSING_TABLE =
  'The scholarships table has not been created yet. Run supabase/add-scholarships.sql in the Supabase SQL editor, then refresh.'

/* Every failure here has the same likely cause on a fresh project, and Postgres
   words it as a schema cache miss, which means nothing to the office. */
const friendlyError = (err: { code?: string; message: string }, what: string) =>
  /^(42P01|PGRST205)/.test(err.code ?? '') || /does not exist|schema cache/i.test(err.message)
    ? MISSING_TABLE
    : `${what}: ${err.message}`

const blankScholarship = (sortOrder: number): AdminScholarship => ({
  id: '',
  title: '',
  shortTitle: '',
  levels: '',
  levelKeys: ['bachelor'],
  location: '',
  status: 'Open',
  closingLabel: '',
  closingKV: '',
  cscaRequired: false,
  majors: [],
  compare: { tuition: '', accommodation: '', taughtIn: '', openTo: '', extraAward: '' },
  blurb: '',
  about1: '',
  about2: '',
  facts: [],
  eligibility: [],
  funding: '',
  timeline: '',
  fees: serviceFees,
  sortOrder,
  published: false,
})

export default function AdminScholarships() {
  const { reload: reloadPublicSite, source } = useScholarshipStore()
  const [rows, setRows] = useState<AdminScholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  /* The record open in the editor. A record whose id is not in `rows` is new. */
  const [editing, setEditing] = useState<AdminScholarship | null>(null)
  const [deleteAskId, setDeleteAskId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  /* The one row being switched on or off. Kept apart from `busy` so publishing
     one programme does not freeze the buttons on all the others. */
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error: err } = await supabase
      .from(SCHOLARSHIPS_TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (err) {
      setError(friendlyError(err, 'Could not load the scholarships'))
      setRows([])
    } else {
      setRows(((data as ScholarshipRow[] | null) ?? []).map(fromRow))
      setError('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  /* Everything that changes the table refreshes both this list and the copy the
     public pages are rendering from. */
  const afterWrite = async (message: string) => {
    setNote(message)
    await load()
    await reloadPublicSite()
  }

  /* Writes one record. Returns an empty string when it worked, or the message
     to show. Both the editor and the publish switch go through here. */
  const persist = async (record: AdminScholarship): Promise<string> => {
    if (!supabase) return 'The database is not configured.'
    const { error: err } = await supabase
      .from(SCHOLARSHIPS_TABLE)
      .upsert(toRow(record), { onConflict: 'id' })
    return err ? friendlyError(err, 'Could not save') : ''
  }

  const save = async (record: AdminScholarship) => {
    if (!supabase || busy) return
    setBusy(true)
    setError('')
    try {
      const message = await persist(record)
      if (message) {
        setError(message)
      } else {
        setEditing(null)
        await afterWrite(`Saved “${record.title}”.`)
      }
    } finally {
      /* Without this, a failure while refreshing would leave every button in
         the panel disabled until the page was reloaded. */
      setBusy(false)
    }
  }

  const remove = async (record: AdminScholarship) => {
    if (!supabase || busy) return
    setBusy(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from(SCHOLARSHIPS_TABLE)
        .delete()
        .eq('id', record.id)
      if (err) {
        setError(friendlyError(err, 'Could not delete'))
      } else {
        setDeleteAskId(null)
        await afterWrite(`Deleted “${record.title}”.`)
      }
    } finally {
      setBusy(false)
    }
  }

  /* Publishing is a one-click change: it saves on the spot, with no form to
     open and nothing else to confirm. The row flips straight away and is put
     back only if the write fails, so the list never claims something is live
     when it is not. */
  const togglePublished = async (record: AdminScholarship) => {
    if (!supabase || pendingId) return
    const next = { ...record, published: !record.published }
    setPendingId(record.id)
    setError('')
    setNote('')
    setRows((rs) => rs.map((r) => (r.id === record.id ? next : r)))
    try {
      const message = await persist(next)
      if (message) {
        setRows((rs) => rs.map((r) => (r.id === record.id ? record : r)))
        setError(message)
      } else {
        setNote(
          next.published
            ? `“${record.title}” is now on the site.`
            : `“${record.title}” is now a draft. Visitors can no longer see it.`,
        )
        await reloadPublicSite()
      }
    } finally {
      setPendingId(null)
    }
  }

  /* Reordering swaps the two rows' positions, which is all the public site
     reads. Both writes go together so the list cannot end up with a tie. */
  const move = async (index: number, delta: number) => {
    if (!supabase || busy) return
    const other = index + delta
    if (other < 0 || other >= rows.length) return
    setBusy(true)
    const a = rows[index]
    const b = rows[other]
    const next = [...rows]
    next[index] = { ...b, sortOrder: a.sortOrder }
    next[other] = { ...a, sortOrder: b.sortOrder }
    setRows(next.sort((x, y) => x.sortOrder - y.sortOrder))
    try {
      const { error: err } = await supabase.from(SCHOLARSHIPS_TABLE).upsert(
        [
          { ...toRow(a), sort_order: b.sortOrder },
          { ...toRow(b), sort_order: a.sortOrder },
        ],
        { onConflict: 'id' },
      )
      if (err) setError(friendlyError(err, 'Could not reorder'))
      await load()
      await reloadPublicSite()
    } finally {
      setBusy(false)
    }
  }

  /* One-off starting point so the office is not typing eight programmes in from
     scratch. Only offered while the table is empty. */
  const importSeed = async () => {
    if (!supabase || busy) return
    setBusy(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from(SCHOLARSHIPS_TABLE)
        .upsert(seedAsAdminRecords().map(toRow), { onConflict: 'id' })
      if (err) setError(friendlyError(err, 'Could not copy the built-in programmes in'))
      else await afterWrite('The built-in programmes were copied in. Edit them freely.')
    } finally {
      setBusy(false)
    }
  }

  const nextSortOrder = rows.length ? Math.max(...rows.map((r) => r.sortOrder)) + 10 : 10

  if (editing) {
    return (
      <ScholarshipEditor
        record={editing}
        isNew={!rows.some((r) => r.id === editing.id)}
        busy={busy}
        error={error}
        onChange={setEditing}
        onCancel={() => {
          setEditing(null)
          setError('')
        }}
        onSave={save}
      />
    )
  }

  return (
    <>
      <div className="admin-toolbar">
        <button className="btn-outline-navy" onClick={() => void load()} disabled={loading || busy}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <button
          className="btn-red-md"
          onClick={() => {
            setNote('')
            setEditing(blankScholarship(nextSortOrder))
          }}
        >
          Add a scholarship
        </button>
      </div>

      <p className="admin-hint" style={{ margin: '0 0 16px' }}>
        These are the programmes on the public site, in the order they appear.
        The home page shows the first three published ones. Drafts are only
        visible here.
        {source === 'built-in' && rows.length > 0 && (
          <>
            {' '}
            The site is still showing the built-in programmes; publish at least
            one here to take over.
          </>
        )}
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {note && <p className="contact-form-note">{note}</p>}

      {rows.length === 0 && !loading && !error ? (
        <div className="admin-card sch-panel">
          <h2 className="admin-card-title">No scholarships saved yet</h2>
          <p className="admin-hint">
            The site is showing the programmes built into the code. Copy them in
            to start editing them here, or add a scholarship from scratch.
            Nothing on the public site changes until you publish.
          </p>
          <button className="btn-red-md" onClick={() => void importSeed()} disabled={busy}>
            {busy ? 'Copying…' : 'Copy the built-in programmes in'}
          </button>
        </div>
      ) : (
        <div className="admin-list">
          {rows.map((r, i) => (
            <div className="admin-item" key={r.id}>
              <div className="admin-item-head as-row">
                <span className="sch-order">
                  <button
                    className="sch-order-btn"
                    onClick={() => void move(i, -1)}
                    disabled={i === 0 || busy}
                    aria-label={`Move ${r.title} up`}
                  >
                    ↑
                  </button>
                  <button
                    className="sch-order-btn"
                    onClick={() => void move(i, 1)}
                    disabled={i === rows.length - 1 || busy}
                    aria-label={`Move ${r.title} down`}
                  >
                    ↓
                  </button>
                </span>
                <span className="admin-item-name">{r.title || '(untitled)'}</span>
                <span className="admin-item-meta">
                  /scholarships/{r.id} · {r.levels || 'no level'} · {r.majors.length} major
                  {r.majors.length === 1 ? '' : 's'}
                </span>
                <span className={`admin-status-chip s-${r.published ? 'placed' : 'new'}`}>
                  {r.published ? 'Published' : 'Draft'}
                </span>
                <button
                  className="btn-outline-navy admin-btn-sm"
                  onClick={() => {
                    setNote('')
                    setEditing(r)
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-outline-navy admin-btn-sm"
                  onClick={() => void togglePublished(r)}
                  disabled={busy || pendingId === r.id}
                  title={
                    r.published
                      ? 'Take this off the site now. Saves immediately.'
                      : 'Put this on the site now. Saves immediately.'
                  }
                >
                  {pendingId === r.id
                    ? 'Saving…'
                    : r.published
                      ? 'Unpublish'
                      : 'Publish'}
                </button>
                <button
                  className="admin-trash-link"
                  onClick={() => setDeleteAskId(deleteAskId === r.id ? null : r.id)}
                >
                  Delete…
                </button>
              </div>
              {deleteAskId === r.id && (
                <div className="admin-danger-box">
                  <p className="admin-danger-text">
                    Delete <strong>{r.title}</strong> from the site? Applications
                    already submitted for it are not affected, but the page at{' '}
                    <code>/scholarships/{r.id}</code> will stop working. If you
                    only want it off the site for now, unpublish it instead.
                  </p>
                  <div className="admin-danger-row">
                    <button
                      className="btn-red-md admin-btn-sm"
                      onClick={() => void remove(r)}
                      disabled={busy}
                    >
                      {busy ? 'Deleting…' : 'Delete permanently'}
                    </button>
                    <button
                      className="btn-outline-navy admin-btn-sm"
                      onClick={() => setDeleteAskId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- Editor ---------- */

function Field({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <div className="admin-field">
      <label className="field-label">{label}</label>
      {children}
      {help && <p className="field-help">{help}</p>}
    </div>
  )
}

function ScholarshipEditor({
  record,
  isNew,
  busy,
  error,
  onChange,
  onCancel,
  onSave,
}: {
  record: AdminScholarship
  isNew: boolean
  busy: boolean
  error: string
  onChange: (r: AdminScholarship) => void
  onCancel: () => void
  onSave: (r: AdminScholarship) => void
}) {
  const [formError, setFormError] = useState('')
  const set = <K extends keyof AdminScholarship>(key: K, value: AdminScholarship[K]) =>
    onChange({ ...record, [key]: value })

  const setCompare = (key: keyof AdminScholarship['compare'], value: string) =>
    onChange({ ...record, compare: { ...record.compare, [key]: value } })

  const setFact = (i: number, key: 'label' | 'value', value: string) =>
    onChange({
      ...record,
      facts: record.facts.map((f, n) => (n === i ? { ...f, [key]: value } : f)),
    })

  const toggleLevel = (key: LevelKey) =>
    set(
      'levelKeys',
      record.levelKeys.includes(key)
        ? record.levelKeys.filter((k) => k !== key)
        : [...record.levelKeys, key],
    )

  const submit = () => {
    const id = record.id.trim()
    if (!record.title.trim()) {
      setFormError('Give the scholarship a title.')
      return
    }
    if (!id) {
      setFormError('The web address cannot be empty.')
      return
    }
    if (!/^[a-z0-9-]+$/.test(id)) {
      setFormError('The web address can only use lowercase letters, numbers and hyphens.')
      return
    }
    setFormError('')
    onSave({
      ...record,
      id,
      title: record.title.trim(),
      facts: record.facts.filter((f) => f.label.trim() || f.value.trim()),
    })
  }

  return (
    <div className="admin-card sch-panel sch-editor">
      <h2 className="admin-card-title">
        {isNew ? 'Add a scholarship' : `Edit ${record.title || 'scholarship'}`}
      </h2>

      <h3 className="admin-sub">The basics</h3>
      <Field label="Title" help="Shown as the heading on the card and the detail page.">
        <input
          className="field-input"
          value={record.title}
          onChange={(e) => {
            const title = e.target.value
            /* A new programme gets its web address from the title until the
               address is edited by hand; an existing one is left alone, because
               changing it breaks links already given to students. */
            onChange(
              isNew && (record.id === '' || record.id === slugify(record.title))
                ? { ...record, title, id: slugify(title) }
                : { ...record, title },
            )
          }}
        />
      </Field>
      <Field
        label="Web address"
        help={
          isNew
            ? 'The programme will live at /scholarships/' + (record.id || '…')
            : 'Changing this breaks any link already sent to students. Leave it alone unless you have a reason.'
        }
      >
        <input
          className="field-input"
          value={record.id}
          onChange={(e) => set('id', e.target.value)}
        />
      </Field>
      <Field
        label="Short name"
        help="Used as the column heading in the comparison table, where the full title is too long. Optional."
      >
        <input
          className="field-input"
          value={record.shortTitle ?? ''}
          onChange={(e) => set('shortTitle', e.target.value)}
        />
      </Field>
      <Field label="Level, as written on the card" help="For example: Bachelor's, or Chinese language, 1 year.">
        <input
          className="field-input"
          value={record.levels}
          onChange={(e) => set('levels', e.target.value)}
        />
      </Field>
      <Field
        label="Study level on the application form"
        help="Decides which documents an applicant is asked for. Master's and PhD ask for a degree transcript and a study plan."
      >
        <div className="level-row">
          {LEVEL_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`level-btn${record.levelKeys.includes(o.key) ? ' selected' : ''}`}
              onClick={() => toggleLevel(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Location">
        <input
          className="field-input"
          value={record.location}
          onChange={(e) => set('location', e.target.value)}
        />
      </Field>
      <div className="sch-row-2">
        <Field label="Status">
          <select
            className="field-input"
            value={record.status}
            onChange={(e) => set('status', e.target.value as ScholarshipStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Intake label" help="Shown on the card corner, e.g. Sep 2026 intake.">
          <input
            className="field-input"
            value={record.closingLabel}
            onChange={(e) => set('closingLabel', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Closes" help="The value shown against CLOSES on the home page cards.">
        <input
          className="field-input"
          value={record.closingKV}
          onChange={(e) => set('closingKV', e.target.value)}
        />
      </Field>
      <div className="admin-check-row">
        <label className="admin-handled">
          <input
            type="checkbox"
            checked={record.cscaRequired}
            onChange={(e) => set('cscaRequired', e.target.checked)}
          />
          The CSCA exam is required
        </label>
        <label className="admin-handled">
          <input
            type="checkbox"
            checked={record.published}
            onChange={(e) => set('published', e.target.checked)}
          />
          Published on the public site
        </label>
      </div>

      <h3 className="admin-sub">What visitors read</h3>
      <Field label="Card summary" help="Two or three sentences, shown on the scholarship card.">
        <textarea
          className="field-input"
          rows={3}
          value={record.blurb}
          onChange={(e) => set('blurb', e.target.value)}
        />
      </Field>
      <Field label="About, first paragraph">
        <textarea
          className="field-input"
          rows={4}
          value={record.about1}
          onChange={(e) => set('about1', e.target.value)}
        />
      </Field>
      <Field label="About, second paragraph">
        <textarea
          className="field-input"
          rows={4}
          value={record.about2}
          onChange={(e) => set('about2', e.target.value)}
        />
      </Field>
      <Field label="Majors, one per line" help="These also fill the Study by subject list.">
        <textarea
          className="field-input"
          rows={6}
          value={listToLines(record.majors)}
          onChange={(e) => set('majors', linesToList(e.target.value))}
        />
      </Field>
      <Field label="Requirements, one per line">
        <textarea
          className="field-input"
          rows={7}
          value={listToLines(record.eligibility)}
          onChange={(e) => set('eligibility', linesToList(e.target.value))}
        />
      </Field>

      <h3 className="admin-sub">Key facts</h3>
      <p className="admin-hint">
        The label and value rows on the detail page, in the order shown.
      </p>
      {record.facts.map((f, i) => (
        <div className="sch-fact-row" key={i}>
          <input
            className="field-input"
            placeholder="Label, e.g. Tuition"
            value={f.label}
            onChange={(e) => setFact(i, 'label', e.target.value)}
            aria-label={`Fact ${i + 1} label`}
          />
          <input
            className="field-input"
            placeholder="Value, e.g. 8,000 RMB per year"
            value={f.value}
            onChange={(e) => setFact(i, 'value', e.target.value)}
            aria-label={`Fact ${i + 1} value`}
          />
          <button
            className="admin-trash-link"
            type="button"
            onClick={() => set('facts', record.facts.filter((_, n) => n !== i))}
            aria-label={`Remove fact ${i + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="btn-outline-navy admin-btn-sm"
        type="button"
        onClick={() => set('facts', [...record.facts, { label: '', value: '' }])}
      >
        Add a fact
      </button>

      <h3 className="admin-sub">Comparison table</h3>
      <p className="admin-hint">
        One line each in the side-by-side table on the scholarships page.
      </p>
      <Field label="Tuition">
        <input
          className="field-input"
          value={record.compare.tuition}
          onChange={(e) => setCompare('tuition', e.target.value)}
        />
      </Field>
      <Field label="Accommodation">
        <input
          className="field-input"
          value={record.compare.accommodation}
          onChange={(e) => setCompare('accommodation', e.target.value)}
        />
      </Field>
      <Field label="Taught in">
        <input
          className="field-input"
          value={record.compare.taughtIn}
          onChange={(e) => setCompare('taughtIn', e.target.value)}
        />
      </Field>
      <Field label="Open to">
        <input
          className="field-input"
          value={record.compare.openTo}
          onChange={(e) => setCompare('openTo', e.target.value)}
        />
      </Field>
      <Field label="Extra award">
        <input
          className="field-input"
          value={record.compare.extraAward}
          onChange={(e) => setCompare('extraAward', e.target.value)}
        />
      </Field>

      <h3 className="admin-sub">The Details panel</h3>
      <Field label="What the award covers">
        <textarea
          className="field-input"
          rows={4}
          value={record.funding}
          onChange={(e) => set('funding', e.target.value)}
        />
      </Field>
      <Field label="Timeline">
        <textarea
          className="field-input"
          rows={4}
          value={record.timeline}
          onChange={(e) => set('timeline', e.target.value)}
        />
      </Field>
      <Field label="Fees" help="The wording about the service fee. The same on every programme unless you change it.">
        <textarea
          className="field-input"
          rows={4}
          value={record.fees}
          onChange={(e) => set('fees', e.target.value)}
        />
      </Field>

      {(formError || error) && (
        <p className="form-error" role="alert">
          {formError || error}
        </p>
      )}

      <div className="admin-editor-actions">
        <button className="btn-red-md" onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : isNew ? 'Add scholarship' : 'Save changes'}
        </button>
        <button className="btn-outline-navy" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  )
}
