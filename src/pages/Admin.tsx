import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { usePageMeta } from '../lib/meta'
import { FILES_BUCKET, supabase } from '../lib/supabase'
import { fieldLabels } from '../data/applicationForm'
import type { EducationRow, EmploymentRow } from '../data/applicationForm'

/* Internal admin panel (not linked from the public navigation, reached at
   /admin). Requires a Supabase login; accounts are created by invitation
   from the Supabase dashboard, never with a developer-known password. */

interface UploadMeta {
  name: string
  path?: string
  link?: string
}

interface AppRow {
  id: string
  created_at: string
  scholarship_title: string
  level: string
  status: string
  form: Record<string, string>
  uploads: Record<string, UploadMeta>
  deleted_at: string | null
}

interface MsgRow {
  id: string
  created_at: string
  name: string
  contact: string
  message: string
  handled: boolean
}

const STATUSES = ['New', 'In review', 'Contacted', 'Placed', 'Not eligible']

/* Built from the same definition the application form uses, so the panel and
   the CSV always show every field the applicant filled in. */
const FORM_LABELS: Record<string, string> = { reference: 'Reference', ...fieldLabels }

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function csvEscape(v: string) {
  return `"${v.replace(/"/g, '""')}"`
}

/* The official form keeps surname and given names apart; show them joined. */
function applicantName(form: Record<string, string> | undefined): string {
  const name = [form?.surname, form?.givenName].filter((p) => p?.trim()).join(' ').trim()
  return name || '(no name)'
}

/* ---------- Document preview ---------- */

type DocKind = 'image' | 'pdf' | 'link' | 'other'

const extOf = (name: string) => name.split('.').pop()?.toLowerCase() ?? ''

function kindOf(u: UploadMeta): DocKind {
  if (!u.path) return 'link'
  const e = extOf(u.name)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(e)) return 'image'
  if (e === 'pdf') return 'pdf'
  return 'other'
}

interface PreviewDoc extends UploadMeta {
  key: string
  kind: DocKind
}

/* Signed URLs expire, so they are fetched on demand and cached per path. */
const urlCache = new Map<string, { url: string; expires: number }>()

async function signedUrl(path: string): Promise<string | null> {
  const hit = urlCache.get(path)
  if (hit && hit.expires > Date.now()) return hit.url
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(path, 60 * 60)
  if (error || !data) return null
  urlCache.set(path, { url: data.signedUrl, expires: Date.now() + 55 * 60 * 1000 })
  return data.signedUrl
}

/* Small image thumbnail in the document list. */
function DocThumb({ doc }: { doc: PreviewDoc }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    if (doc.kind === 'image' && doc.path) {
      void signedUrl(doc.path).then((u) => {
        if (alive) setSrc(u)
      })
    }
    return () => {
      alive = false
    }
  }, [doc])

  if (doc.kind === 'image') {
    return (
      <span className="doc-thumb">
        {src ? <img src={src} alt="" loading="lazy" /> : <span className="doc-thumb-ph" />}
      </span>
    )
  }
  return (
    <span className={`doc-thumb doc-thumb-icon kind-${doc.kind}`}>
      {doc.kind === 'pdf' ? 'PDF' : doc.kind === 'link' ? '↗' : extOf(doc.name).toUpperCase().slice(0, 4) || 'FILE'}
    </span>
  )
}

/* Gmail-style overlay viewer with next/previous across the applicant's files. */
function DocViewer({
  docs,
  index,
  onClose,
  onIndex,
  applicant,
}: {
  docs: PreviewDoc[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
  applicant: string
}) {
  const doc = docs[index]
  /* Keyed by document so switching files shows the loading state without a
     synchronous reset inside the effect. */
  const [loaded, setLoaded] = useState<{ key: string; url: string | null }>({
    key: '',
    url: null,
  })
  const url = loaded.key === doc.key ? loaded.url : null
  const failed = loaded.key === doc.key && loaded.url === null

  useEffect(() => {
    let alive = true
    if (doc.path) {
      void signedUrl(doc.path).then((u) => {
        if (alive) setLoaded({ key: doc.key, url: u })
      })
    }
    return () => {
      alive = false
    }
  }, [doc])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index < docs.length - 1) onIndex(index + 1)
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, docs.length, onClose, onIndex])

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={`${doc.name}, document ${index + 1} of ${docs.length}`}>
      <div className="viewer-backdrop" onClick={onClose} />
      <div className="viewer-panel">
        <div className="viewer-bar">
          <div className="viewer-titles">
            <div className="viewer-name">{doc.name}</div>
            <div className="viewer-sub">
              {applicant} · {index + 1} of {docs.length}
            </div>
          </div>
          {url && (
            <a className="viewer-btn" href={url} download={doc.name} target="_blank" rel="noreferrer">
              Download
            </a>
          )}
          <button className="viewer-btn viewer-close" onClick={onClose} aria-label="Close preview">
            ✕
          </button>
        </div>

        <div className="viewer-body">
          {index > 0 && (
            <button
              className="viewer-nav prev"
              onClick={() => onIndex(index - 1)}
              aria-label="Previous document"
            >
              ‹
            </button>
          )}

          {doc.kind === 'link' ? (
            <div className="viewer-message">
              <p>This item is a link, not an uploaded file.</p>
              <a className="viewer-btn" href={doc.link} target="_blank" rel="noreferrer">
                Open link
              </a>
            </div>
          ) : failed ? (
            <div className="viewer-message">
              <p>This document could not be opened. It may have been removed.</p>
            </div>
          ) : !url ? (
            <div className="viewer-message">
              <p>Loading…</p>
            </div>
          ) : doc.kind === 'image' ? (
            <img className="viewer-image" src={url} alt={doc.name} />
          ) : doc.kind === 'pdf' ? (
            <iframe className="viewer-frame" src={url} title={doc.name} />
          ) : (
            <div className="viewer-message">
              <p>No preview available for this file type.</p>
              <a className="viewer-btn" href={url} download={doc.name} target="_blank" rel="noreferrer">
                Download {doc.name}
              </a>
            </div>
          )}

          {index < docs.length - 1 && (
            <button
              className="viewer-nav next"
              onClick={() => onIndex(index + 1)}
              aria-label="Next document"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* Navy hero band shared by every admin view, matching the interior pages. */
function AdminShell({
  action,
  children,
}: {
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <section className="admin-hero">
        <div className="page-hero-stripes" />
        <div className="page-hero-shade deep" />
        <div className="admin-hero-inner">
          <div>
            <p className="eyebrow-hero ">Internal</p>
            <h1 className="admin-hero-title">Admin panel</h1>
          </div>
          {action}
        </div>
      </section>
      <div className="admin-wrap">{children}</div>
    </>
  )
}

export default function Admin() {
  usePageMeta('Admin | StudyInChinaNow', 'Internal admin panel.')

  /* Keep the internal panel out of search results. */
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <AdminShell>
        <div className="admin-notice">
          Supabase is not configured yet. Copy <code>.env.example</code> to{' '}
          <code>.env.local</code>, fill in the project keys, and restart the
          server. Setup steps are in the README.
        </div>
      </AdminShell>
    )
  }

  if (!authReady) {
    return (
      <AdminShell>
        <div />
      </AdminShell>
    )
  }

  return session ? <Dashboard /> : <Login />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const signIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setBusy(false)
  }

  return (
    <AdminShell>
      <div className="admin-card">
        <h2 className="admin-card-title">Sign in</h2>
        <form onSubmit={signIn}>
        <div className="admin-field">
          <label className="field-label" htmlFor="ad-email">
            Email
          </label>
          <input
            id="ad-email"
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="admin-field">
          <label className="field-label" htmlFor="ad-pass">
            Password
          </label>
          <input
            id="ad-pass"
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="admin-login-row">
          <button className="btn-red-md" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
        <p className="admin-hint">
          Sign in with the password set for your admin account.
        </p>
      </div>
    </AdminShell>
  )
}

function Dashboard() {
  const [tab, setTab] = useState<'applications' | 'messages' | 'trash' | 'account'>(
    'applications',
  )
  const [apps, setApps] = useState<AppRow[]>([])
  const [msgs, setMsgs] = useState<MsgRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  /* Staged deletion state: which row is asking "move to trash?", and which
     trashed row has the permanent-delete confirmation open. */
  const [trashAskId, setTrashAskId] = useState<string | null>(null)
  const [purgeAskId, setPurgeAskId] = useState<string | null>(null)
  const [purgeText, setPurgeText] = useState('')
  const [purging, setPurging] = useState(false)
  /* Which document is open in the overlay viewer. */
  const [viewer, setViewer] = useState<{ appId: string; index: number } | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const [a, m] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ])
    if (a.error || m.error) {
      setLoadError((a.error ?? m.error)?.message ?? 'Could not load data.')
    } else {
      setApps((a.data as AppRow[]) ?? [])
      setMsgs((m.data as MsgRow[]) ?? [])
      setLoadError('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const refresh = () => {
    setLoading(true)
    setLoadError('')
    void load()
  }

  const setStatus = async (id: string, status: string) => {
    if (!supabase) return
    setApps((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)))
    const { error } = await supabase.from('applications').update({ status }).eq('id', id)
    if (error) {
      setLoadError(`Could not save status: ${error.message}`)
      void load()
    }
  }

  /* Step 1 of deletion: move to trash (reversible). */
  const moveToTrash = async (id: string) => {
    if (!supabase) return
    setTrashAskId(null)
    setOpenId(null)
    const deleted_at = new Date().toISOString()
    setApps((rows) => rows.map((r) => (r.id === id ? { ...r, deleted_at } : r)))
    const { error } = await supabase.from('applications').update({ deleted_at }).eq('id', id)
    if (error) {
      setLoadError(`Could not move to trash: ${error.message}`)
      void load()
    }
  }

  const restore = async (id: string) => {
    if (!supabase) return
    setPurgeAskId(null)
    setApps((rows) => rows.map((r) => (r.id === id ? { ...r, deleted_at: null } : r)))
    const { error } = await supabase
      .from('applications')
      .update({ deleted_at: null })
      .eq('id', id)
    if (error) {
      setLoadError(`Could not restore: ${error.message}`)
      void load()
    }
  }

  /* Step 2 of deletion: permanent. Documents are removed from storage first,
     then the record itself. Only reachable from the Trash tab after typing
     DELETE. */
  const deleteForever = async (row: AppRow) => {
    if (!supabase || purging) return
    setPurging(true)
    const paths = Object.values(row.uploads ?? {})
      .map((u) => u.path)
      .filter((p): p is string => !!p)
    if (paths.length > 0) {
      const { error } = await supabase.storage.from(FILES_BUCKET).remove(paths)
      if (error) {
        setLoadError(`Could not delete the uploaded documents: ${error.message}. The application was not deleted.`)
        setPurging(false)
        return
      }
    }
    const { error } = await supabase.from('applications').delete().eq('id', row.id)
    if (error) {
      setLoadError(`Could not delete the application: ${error.message}`)
    } else {
      setApps((rows) => rows.filter((r) => r.id !== row.id))
      setPurgeAskId(null)
      setPurgeText('')
    }
    setPurging(false)
  }

  const setHandled = async (id: string, handled: boolean) => {
    if (!supabase) return
    setMsgs((rows) => rows.map((r) => (r.id === id ? { ...r, handled } : r)))
    const { error } = await supabase.from('contact_messages').update({ handled }).eq('id', id)
    if (error) {
      setLoadError(`Could not save: ${error.message}`)
      void load()
    }
  }

  const educationOf = (r: AppRow): EducationRow[] => {
    try {
      const raw = r.form?.education
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as EducationRow[]).filter((e) => e?.school) : []
    } catch {
      return []
    }
  }

  const employmentOf = (r: AppRow): EmploymentRow[] => {
    try {
      const raw = r.form?.employment
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as EmploymentRow[]).filter((e) => e?.employer) : []
    } catch {
      return []
    }
  }

  const docsOf = (r: AppRow): PreviewDoc[] =>
    Object.entries(r.uploads ?? {}).map(([key, u]) => ({ ...u, key, kind: kindOf(u) }))

  const exportCsv = () => {
    const formKeys = Object.keys(FORM_LABELS)
    const header = ['Submitted', 'Scholarship', 'Level', 'Status', ...formKeys.map((k) => FORM_LABELS[k]), 'Documents']
    const lines = [header.map(csvEscape).join(',')]
    for (const r of apps.filter((x) => !x.deleted_at)) {
      const docs = Object.values(r.uploads ?? {})
        .map((u) => u.name)
        .join('; ')
      lines.push(
        [
          fmtDate(r.created_at),
          r.scholarship_title,
          r.level,
          r.status,
          ...formKeys.map((k) => r.form?.[k] ?? ''),
          docs,
        ]
          .map(csvEscape)
          .join(','),
      )
    }
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const signOut = () => {
    void supabase?.auth.signOut()
  }

  const viewerRow = viewer ? apps.find((r) => r.id === viewer.appId) : undefined
  const viewerDocs = viewerRow
    ? docsOf(viewerRow).filter((d) => d.kind !== 'link')
    : undefined

  const activeApps = apps.filter((r) => !r.deleted_at)
  const trashedApps = apps.filter((r) => r.deleted_at)
  const newApps = activeApps.filter((r) => r.status === 'New').length
  const newMsgs = msgs.filter((m) => !m.handled).length

  return (
    <AdminShell
      action={
        <button className="btn-outline-light" onClick={signOut}>
          Sign out
        </button>
      }
    >
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-num">{loading ? '–' : activeApps.length}</div>
          <div className="admin-stat-label">Applications</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{loading ? '–' : newApps}</div>
          <div className="admin-stat-label">Awaiting review</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{loading ? '–' : newMsgs}</div>
          <div className="admin-stat-label">Unread messages</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'applications' ? ' active' : ''}`}
          onClick={() => setTab('applications')}
        >
          Applications ({activeApps.length})
        </button>
        <button
          className={`admin-tab${tab === 'messages' ? ' active' : ''}`}
          onClick={() => setTab('messages')}
        >
          Messages ({msgs.filter((m) => !m.handled).length} new)
        </button>
        <button
          className={`admin-tab${tab === 'trash' ? ' active' : ''}`}
          onClick={() => setTab('trash')}
        >
          Trash ({trashedApps.length})
        </button>
        <button
          className={`admin-tab${tab === 'account' ? ' active' : ''}`}
          onClick={() => setTab('account')}
        >
          Account
        </button>
      </div>

      {loadError && (
        <p className="form-error" role="alert">
          {loadError}
        </p>
      )}

      {tab === 'applications' && (
        <>
          <div className="admin-toolbar">
            <button className="btn-outline-navy" onClick={refresh} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button className="btn-red-md" onClick={exportCsv} disabled={activeApps.length === 0}>
              Export CSV
            </button>
          </div>
          {activeApps.length === 0 && !loading ? (
            <p className="admin-empty">No applications yet.</p>
          ) : (
            <div className="admin-list">
              {activeApps.map((r) => (
                <div className="admin-item" key={r.id}>
                  <button
                    className="admin-item-head"
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                    aria-expanded={openId === r.id}
                  >
                    <span className="admin-item-name">{applicantName(r.form)}</span>
                    <span className="admin-item-meta">
                      {r.scholarship_title} · {r.level} · {fmtDate(r.created_at)}
                    </span>
                    <span className={`admin-status-chip s-${r.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {r.status}
                    </span>
                  </button>
                  {openId === r.id && (
                    <div className="admin-item-body">
                      <div className="admin-detail-grid">
                        {Object.entries(FORM_LABELS).map(([k, label]) => (
                          <div className="review-row" key={k}>
                            <div className="review-label">{label}</div>
                            <div className="review-value">{r.form?.[k]?.trim() || '—'}</div>
                          </div>
                        ))}
                      </div>
                      {employmentOf(r).length > 0 && (
                        <>
                          <h3 className="admin-sub">Employment record</h3>
                          <div className="admin-detail-grid">
                            {employmentOf(r).map((e, i) => (
                              <div className="review-row" key={i}>
                                <div className="review-label">
                                  {i === 0 ? 'Most recent' : `Previous ${i}`}
                                </div>
                                <div className="review-value">
                                  {[e.employer, [e.from, e.to].filter(Boolean).join(' to '), e.post]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {educationOf(r).length > 0 && (
                        <>
                          <h3 className="admin-sub">Education history</h3>
                          <div className="admin-detail-grid">
                            {educationOf(r).map((e, i) => (
                              <div className="review-row" key={i}>
                                <div className="review-label">
                                  {i === 0 ? 'Most recent' : `Previous ${i}`}
                                </div>
                                <div className="review-value">
                                  {[
                                    e.school,
                                    [e.from, e.to].filter(Boolean).join(' to '),
                                    e.qualification,
                                    e.grades,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <h3 className="admin-sub">Documents</h3>
                      {Object.keys(r.uploads ?? {}).length === 0 ? (
                        <p className="admin-empty">No documents uploaded.</p>
                      ) : (
                        <div className="doc-grid">
                          {docsOf(r).map((doc) => (
                            <button
                              className="doc-card"
                              key={doc.key}
                              onClick={() =>
                                doc.kind === 'link'
                                  ? window.open(doc.link, '_blank', 'noreferrer')
                                  : setViewer({
                                      appId: r.id,
                                      /* Index within the previewable files only,
                                         since links are excluded from the viewer. */
                                      index: docsOf(r)
                                        .filter((d) => d.kind !== 'link')
                                        .findIndex((d) => d.key === doc.key),
                                    })
                              }
                              title={doc.name}
                            >
                              <DocThumb doc={doc} />
                              <span className="doc-card-text">
                                <span className="doc-card-name">{doc.name}</span>
                                <span className="doc-card-kind">
                                  {doc.kind === 'link'
                                    ? 'Open link'
                                    : doc.kind === 'image'
                                      ? 'Image'
                                      : doc.kind === 'pdf'
                                        ? 'PDF'
                                        : 'File'}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="admin-status-row">
                        <label className="field-label" htmlFor={`st-${r.id}`}>
                          Status
                        </label>
                        <select
                          id={`st-${r.id}`}
                          className="apply-banner-select"
                          value={r.status}
                          onChange={(e) => void setStatus(r.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-trash-row">
                        {trashAskId === r.id ? (
                          <>
                            <span className="admin-trash-ask">
                              Move this application to the trash? Nothing is
                              deleted yet; you can restore it from the Trash tab.
                            </span>
                            <button
                              className="btn-red-md admin-btn-sm"
                              onClick={() => void moveToTrash(r.id)}
                            >
                              Yes, move to trash
                            </button>
                            <button
                              className="btn-outline-navy admin-btn-sm"
                              onClick={() => setTrashAskId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="admin-trash-link"
                            onClick={() => setTrashAskId(r.id)}
                          >
                            Move to trash
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'trash' && (
        <>
          <p className="admin-hint" style={{ margin: '0 0 16px' }}>
            Trashed applications are kept, with their documents, until you
            delete them permanently. Restoring puts them back in the
            Applications tab.
          </p>
          {trashedApps.length === 0 && !loading ? (
            <p className="admin-empty">The trash is empty.</p>
          ) : (
            <div className="admin-list">
              {trashedApps.map((r) => (
                <div className="admin-item" key={r.id}>
                  <div className="admin-item-head as-row">
                    <span className="admin-item-name">{applicantName(r.form)}</span>
                    <span className="admin-item-meta">
                      {r.scholarship_title} · {r.level} · trashed {fmtDate(r.deleted_at!)}
                    </span>
                    <button
                      className="btn-outline-navy admin-btn-sm"
                      onClick={() => void restore(r.id)}
                    >
                      Restore
                    </button>
                    <button
                      className="admin-trash-link"
                      onClick={() => {
                        setPurgeAskId(purgeAskId === r.id ? null : r.id)
                        setPurgeText('')
                      }}
                    >
                      Delete permanently…
                    </button>
                  </div>
                  {purgeAskId === r.id && (
                    <div className="admin-danger-box">
                      <p className="admin-danger-text">
                        This permanently deletes the application from{' '}
                        <strong>{applicantName(r.form)}</strong> and its{' '}
                        {Object.keys(r.uploads ?? {}).length} attached document
                        {Object.keys(r.uploads ?? {}).length === 1 ? '' : 's'}. It
                        cannot be undone. Type <strong>DELETE</strong> to confirm.
                      </p>
                      <div className="admin-danger-row">
                        <input
                          className="field-input admin-danger-input"
                          value={purgeText}
                          onChange={(e) => setPurgeText(e.target.value)}
                          placeholder="Type DELETE"
                          aria-label="Type DELETE to confirm"
                        />
                        <button
                          className="btn-red-md admin-btn-sm"
                          disabled={purgeText !== 'DELETE' || purging}
                          onClick={() => void deleteForever(r)}
                        >
                          {purging ? 'Deleting…' : 'Delete permanently'}
                        </button>
                        <button
                          className="btn-outline-navy admin-btn-sm"
                          onClick={() => {
                            setPurgeAskId(null)
                            setPurgeText('')
                          }}
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
      )}

      {tab === 'messages' && (
        <div className="admin-list">
          {msgs.length === 0 && !loading ? (
            <p className="admin-empty">No messages yet.</p>
          ) : (
            msgs.map((m) => (
              <div className={`admin-msg${m.handled ? ' handled' : ''}`} key={m.id}>
                <div className="admin-msg-head">
                  <span className="admin-item-name">{m.name}</span>
                  <span className="admin-item-meta">
                    {m.contact} · {fmtDate(m.created_at)}
                  </span>
                  <label className="admin-handled">
                    <input
                      type="checkbox"
                      checked={m.handled}
                      onChange={(e) => void setHandled(m.id, e.target.checked)}
                    />
                    Handled
                  </label>
                </div>
                <p className="admin-msg-body">{m.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'account' && <AccountPanel />}

      {viewerDocs && viewerRow && (
        <DocViewer
          docs={viewerDocs}
          index={viewer!.index}
          applicant={applicantName(viewerRow.form)}
          onClose={() => setViewer(null)}
          onIndex={(i) => setViewer({ appId: viewer!.appId, index: i })}
        />
      )}
    </AdminShell>
  )
}

function AccountPanel() {
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setNote('')
    setError('')
    if (pw1.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (pw1 !== pw2) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password: pw1 })
    if (err) setError(err.message)
    else {
      setNote('Password updated.')
      setPw1('')
      setPw2('')
    }
    setBusy(false)
  }

  return (
    <div className="admin-narrow-inner">
      <h2 className="admin-sub">Change password</h2>
      <p className="admin-hint">
        Set or change the password you use to sign in. Nobody else, including
        the developer, can see it.
      </p>
      <form onSubmit={changePassword}>
        <div className="admin-field">
          <label className="field-label" htmlFor="pw1">
            New password
          </label>
          <input
            id="pw1"
            className="field-input"
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="admin-field">
          <label className="field-label" htmlFor="pw2">
            Repeat new password
          </label>
          <input
            id="pw2"
            className="field-input"
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button className="btn-red-md" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
      {note && <p className="contact-form-note">{note}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
