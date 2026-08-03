import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { usePageMeta } from '../lib/meta'
import { FILES_BUCKET, supabase } from '../lib/supabase'

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

const FORM_LABELS: Record<string, string> = {
  fullName: 'Full name',
  dob: 'Date of birth',
  idnum: 'ID / passport no.',
  phone: 'Phone',
  email: 'Email',
  address: 'Home address',
  guardian: 'Guardian',
  course: 'Intended course',
  university: 'Preferred university',
  school: 'School',
  year: 'Year',
  grades: 'Grades',
}

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
            <p className="eyebrow-hero">Internal</p>
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
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const signIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    setNote('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setBusy(false)
  }

  const sendLink = async () => {
    if (!supabase) return
    if (!email.trim()) {
      setError('Enter your email first, then request the login link.')
      return
    }
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })
    if (err) setError(err.message)
    else setNote('Check your email. The login link signs you in on this device.')
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
          <button
            className="btn-outline-navy"
            type="button"
            disabled={busy}
            onClick={sendLink}
          >
            Email me a login link
          </button>
        </div>
      </form>
      {note && <p className="contact-form-note">{note}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
        <p className="admin-hint">
          No password yet? Use "Email me a login link", then set a password from
          the Account section once you are in.
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

  const download = async (path: string, name: string) => {
    if (!supabase) return
    const { data, error } = await supabase.storage
      .from(FILES_BUCKET)
      .createSignedUrl(path, 60 * 60)
    if (error || !data) {
      setLoadError(`Could not open ${name}: ${error?.message ?? 'unknown error'}`)
      return
    }
    window.open(data.signedUrl, '_blank', 'noreferrer')
  }

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
                    <span className="admin-item-name">{r.form?.fullName || '(no name)'}</span>
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
                      <h3 className="admin-sub">Documents</h3>
                      {Object.keys(r.uploads ?? {}).length === 0 ? (
                        <p className="admin-empty">No documents uploaded.</p>
                      ) : (
                        <ul className="admin-doc-list">
                          {Object.entries(r.uploads).map(([k, u]) => (
                            <li key={k}>
                              {u.path ? (
                                <button
                                  className="admin-doc-link"
                                  onClick={() => void download(u.path!, u.name)}
                                >
                                  {u.name} ↓
                                </button>
                              ) : (
                                <a href={u.link} target="_blank" rel="noreferrer">
                                  {u.name}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
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
                    <span className="admin-item-name">{r.form?.fullName || '(no name)'}</span>
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
                        <strong>{r.form?.fullName || '(no name)'}</strong> and its{' '}
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
