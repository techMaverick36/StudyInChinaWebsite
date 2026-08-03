import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import { contact, faqs } from '../data/content'
import { submitContactMessage } from '../lib/submit'

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number>(0)
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  usePageMeta(
    'Contact Us | StudyInChinaNow',
    'Ask about scholarships, documents or deadlines. Call, email, WhatsApp or visit our office at Church House, Kampala Road, Kampala. Frequently asked questions answered.',
  )

  const [sendError, setSendError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || !form.message.trim()) return
    setSending(true)
    setSendError('')
    try {
      await submitContactMessage(form)
      setSent(true)
      setForm({ name: '', contact: '', message: '' })
    } catch (err) {
      console.error(err)
      setSendError(
        'Your message could not be sent. Please try again, or reach us directly by phone or WhatsApp.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        lede="Ask us anything about scholarships, documents or deadlines. Call, write or visit the office. We answer in plain language, and there is no charge for asking."
        photoNote="Enjosh office on Kampala Road"
        maxWidth={1000}
      />
      <div className="container-1000 body-pad">
        <div className="contact-grid">
          <div>
            <div className="contact-item">
              <div className="contact-label">Phone</div>
              <div className="contact-value">{contact.phone}</div>
            </div>
            <div className="contact-item">
              <div className="contact-label">Email</div>
              <div className="contact-value">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-label">Office</div>
              <div className="contact-value multiline">
                {contact.addressLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < contact.addressLines.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
            <div className="contact-item" style={{ marginBottom: 24 }}>
              <div className="contact-label">Office hours</div>
              <div className="contact-value">{contact.hours}</div>
            </div>
            <a
              className="whatsapp-btn"
              href={contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Message us on WhatsApp
            </a>
          </div>
          <div className="map-placeholder">
            <span className="map-badge">MAP — Church House, Kampala Road, Kampala</span>
          </div>
        </div>

        <div className="contact-form-block">
          <h2 className="faq-h">Send us a message</h2>
          <form onSubmit={onSubmit}>
            <div className="field-grid">
              <div>
                <label className="field-label" htmlFor="cf-name">
                  Your name
                </label>
                <input
                  id="cf-name"
                  className="field-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="cf-contact">
                  Phone or email
                </label>
                <input
                  id="cf-contact"
                  className="field-input"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="+256 7XX XXX XXX or you@example.com"
                  required
                />
              </div>
              <div className="field-full">
                <label className="field-label" htmlFor="cf-message">
                  Your message
                </label>
                <textarea
                  id="cf-message"
                  className="field-input"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you would like to know"
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn-red-md" type="submit" disabled={sending}>
                {sending ? 'Sending…' : 'Send message'}
              </button>
              {sent && (
                <p className="contact-form-note">
                  Thank you. Your message has been received. We reply within one
                  working day.
                </p>
              )}
              {sendError && (
                <p className="form-error" role="alert">
                  {sendError}
                </p>
              )}
            </div>
          </form>
        </div>

        <h2 className="faq-h">Frequently asked questions</h2>
        <div className="faq-list">
          {faqs.map((f, i) => {
            const open = openFaq === i
            return (
              <div className="faq-item" key={f.q}>
                <button
                  className="faq-q"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <span className={`faq-chevron${open ? ' open' : ''}`}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {open && <p className="faq-a">{f.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
