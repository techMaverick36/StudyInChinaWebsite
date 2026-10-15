import { useState } from 'react'
import type { FormEvent } from 'react'
import { useJsonLd, usePageMeta } from '../lib/meta'
import PageHero from '../components/PageHero'
import { photos, photoBlurs } from '../data/photos'
import { contact, faqs } from '../data/content'
import { submitContactMessage } from '../lib/submit'
import { ChevronDown, MessageCircle } from 'lucide-react'
import Button from '../components/Button'

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number>(0)
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  usePageMeta(
    'Contact Our Kampala Office | StudyInChinaNow',
    'Call +256 701 458000, WhatsApp or visit Universal House, Luwum Street, Kampala, Monday to Friday 9:00 to 17:00. Answers on eligibility, documents, fees and the CSCA exam.',
  )

  /* The questions are what students type into Google, so they are published
     as FAQPage data that search results can show directly. */
  useJsonLd('faq', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })

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
        title="Contact our Kampala office"
        lede="Call, WhatsApp or walk in on Luwum Street. Questions cost nothing."
        photoNote="the office on Luwum Street"
        photo={photos.contact}
        blur={photoBlurs.contact}
        maxWidth={1000}
      />
      <div className="container-1000 body-pad">
        <div className="contact-split">
          <aside className="contact-details">
            <div className="contact-detail-card">
              <div className="contact-label">Phone</div>
              <div className="contact-value">
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a>
              </div>
            </div>
            <div className="contact-detail-card">
              <div className="contact-label">Email</div>
              <div className="contact-value">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
            <div className="contact-detail-card">
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
            <div className="contact-detail-card">
              <div className="contact-label">Office hours</div>
              <div className="contact-value">{contact.hours}</div>
            </div>
            <Button
              variant="whatsapp"
              icon={MessageCircle}
              iconPosition="start"
              fullWidth
              className="contact-whatsapp-full"
              href={contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Message us on WhatsApp
            </Button>
            <p className="contact-visit-note">
              Walk in during office hours. No appointment needed.
            </p>
          </aside>

          <div className="contact-form-card">
            <h2 className="contact-form-title">Send a message</h2>
            <p className="contact-form-intro">
              Write your question below. Replies go out within 1 working day.
            </p>
            <form onSubmit={onSubmit}>
              <div className="contact-field-stack">
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
                <div>
                  <label className="field-label" htmlFor="cf-message">
                    Your message
                  </label>
                  <textarea
                    id="cf-message"
                    className="field-input"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Your question about scholarships, documents or fees"
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="contact-submit-row">
                <Button type="submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Send message'}
                </Button>
                {sent && (
                  <p className="contact-form-note">
                    Message received. Expect a reply within 1 working day.
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
        </div>

        <h2 className="faq-h contact-faq-h">Frequently asked questions</h2>
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
                    <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </button>
                {/* Closed answers stay in the page, hidden, so they are still read
                    by search engines and found by in-page search. */}
                <p className="faq-a" hidden={!open}>
                  {f.a}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
