import { useId, useRef, useState } from 'react'
import { consultationServices } from '../data/consultationServices'
import { validateForm, isFormValid } from '../utils/validateConsultationForm'

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  service: '',
  message: '',
  consent: false,
}

const ALL_TOUCHED = {
  fullName: true,
  email: true,
  phone: true,
  city: true,
  service: true,
  consent: true,
}

/** Simple inline icons for input fields */
const icons = {
  user: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
    </svg>
  ),
  email: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  location: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.049.672-.564 1.208-1.237 1.237h-.758M3.75 21h16.5M5.25 6.75h13.5M12 3.75v3" />
    </svg>
  ),
  chat: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  alert: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
}

/*
 * Fields sit on the navy card: a translucent fill, a white/40 border (at least
 * 3:1 against the card), a brighter border on hover and a gold border + glow on focus.
 */
const FIELD_BASE =
  'consult-field w-full rounded-xl border bg-white/[0.06] text-sm text-white transition-colors duration-200 placeholder:text-white/50 focus:bg-white/[0.09] focus:outline-none focus:ring-[3px]'

const fieldState = (hasError) =>
  hasError
    ? 'border-red-400 focus:border-red-300 focus:ring-red-400/25'
    : 'border-white/40 hover:border-white/60 focus:border-[#d4af37] focus:ring-[#d4af37]/25'

/**
 * Label above the field, an icon inside it and the error message below.
 * The error line keeps its height when empty: a message appearing on blur must
 * not push the next field or the submit button away mid-click.
 */
function Field({ id, label, required, error, icon, iconTop = false, reserveErrorLine = true, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/80">
        {label}
        {required && (
          <span className="ml-0.5 text-[#d4af37]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 text-[#d4af37] ${
            iconTop ? 'top-3.5' : 'top-1/2 -translate-y-1/2'
          }`}
        >
          {icon}
        </span>
        {children}
      </div>
      {(error || reserveErrorLine) && <ErrorLine id={`${id}-error`} error={error} />}
    </div>
  )
}

function ErrorLine({ id, error, className = '' }) {
  return (
    <p
      id={id}
      className={`mt-1.5 flex min-h-[1.125rem] items-center gap-1.5 text-xs font-medium text-red-300 ${className}`}
      role={error ? 'alert' : undefined}
    >
      {error && icons.alert}
      {error}
    </p>
  )
}

/**
 * Consultation enquiry form — works as standalone section or inside a modal.
 *
 * @param {string} variant - 'section' | 'modal'
 * @param {function} onSuccess - called after successful submit (e.g. close modal)
 * @param {boolean} showCloseButton - show X button (modal mode)
 * @param {function} onClose - close handler for modal
 */
function ConsultationForm({
  variant = 'section',
  onSuccess,
  showCloseButton = false,
  onClose,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const formRef = useRef(null)

  // The popup and a page section can both be on screen, so ids are unique per form
  const uid = useId()
  const fieldId = (name) => `${uid}-${name}`

  const errors = validateForm(formData)
  const showError = (field) => (touched[field] ? errors[field] : '')

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleChange = (field) => (e) => {
    const value =
      field === 'consent' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  /** Phone: digits only, max 10; a pasted +91 or leading 0 is dropped */
  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '')
    if (digits.length > 10) digits = digits.replace(/^(91|0)/, '')
    setFormData((prev) => ({ ...prev, phone: digits.slice(0, 10) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched to show any remaining errors
    setTouched(ALL_TOUCHED)

    if (!isFormValid(errors)) {
      // Wait for the error messages to render, then move to the first problem
      requestAnimationFrame(() => {
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
      })
      return
    }

    setIsSubmitting(true)

    /*
     * PLACEHOLDER SUBMIT — replace with real email integration later:
     *
     * Option A — EmailJS (client-side):
     *   import emailjs from '@emailjs/browser'
     *   await emailjs.send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY)
     *
     * Option B — Nodemailer (server/API route):
     *   await fetch('/api/consultation', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(formData),
     *   })
     *
     * Option C — SMTP via backend service (SendGrid, AWS SES, etc.)
     */
    await new Promise((resolve) => setTimeout(resolve, 1400))

    console.info('[Consultation] Enquiry submitted (placeholder):', formData)

    setIsSubmitting(false)
    setSubmitSuccess(true)

    if (onSuccess) {
      setTimeout(() => onSuccess(), 2800)
    }
  }

  const isModal = variant === 'modal'
  const titleId = isModal ? 'consultation-modal-title' : fieldId('title')

  /** Accessibility attributes shared by every field */
  const describe = (name) => ({
    id: fieldId(name),
    name,
    'aria-invalid': Boolean(showError(name)),
    'aria-describedby': showError(name) ? `${fieldId(name)}-error` : undefined,
  })

  const card = (content) => (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f4d] via-[#0e2a63] to-[#0c3177] shadow-[0_24px_60px_-24px_rgba(11,31,77,0.65)] ring-1 ring-white/10 ${
        isModal ? '' : 'mx-auto max-w-3xl'
      }`}
    >
      <div className="h-1 bg-gradient-to-r from-[#b38f24] via-[#d4af37] to-[#b38f24]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[#d4af37]/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
      <div className="relative p-6 sm:p-8 lg:p-10">{content}</div>
    </div>
  )

  if (submitSuccess) {
    return card(
      <div className="py-6 text-center sm:py-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/40">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 id={titleId} className="mt-6 text-xl font-bold !text-white sm:text-2xl">
          Thank you! Our team will contact you shortly.
        </h3>
        <p className="mt-3 text-white/75">
          We have received your enquiry and will reach out within 1–2 business days.
        </p>
      </div>
    )
  }

  return card(
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            <span className="h-px w-6 bg-[#d4af37]" aria-hidden="true" />
            Free Consultation
          </p>
          <h2 id={titleId} className="mt-2 text-2xl font-bold !text-white sm:text-3xl">
            Book Free Consultation
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            Share your details and our team will guide you on demat, investments,
            and financial planning.
          </p>
        </div>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/15 p-2 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#d4af37]/40"
            aria-label="Close form"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-6 h-px bg-white/10" aria-hidden="true" />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-6 grid gap-x-5 gap-y-3 sm:grid-cols-2"
        noValidate
        aria-labelledby={titleId}
      >
        <Field id={fieldId('fullName')} label="Full Name" required error={showError('fullName')} icon={icons.user}>
          <input
            {...describe('fullName')}
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            onBlur={() => handleBlur('fullName')}
            placeholder="Your full name"
            className={`${FIELD_BASE} h-12 pl-11 pr-4 ${fieldState(showError('fullName'))}`}
          />
        </Field>

        <Field id={fieldId('email')} label="Email Address" required error={showError('email')} icon={icons.email}>
          <input
            {...describe('email')}
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={() => handleBlur('email')}
            placeholder="you@example.com"
            className={`${FIELD_BASE} h-12 pl-11 pr-4 ${fieldState(showError('email'))}`}
          />
        </Field>

        <Field id={fieldId('phone')} label="Phone Number" required error={showError('phone')} icon={icons.phone}>
          <input
            {...describe('phone')}
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            value={formData.phone}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur('phone')}
            placeholder="10-digit mobile number"
            className={`${FIELD_BASE} h-12 pl-11 pr-4 ${fieldState(showError('phone'))}`}
          />
        </Field>

        <Field id={fieldId('city')} label="City" required error={showError('city')} icon={icons.location}>
          <input
            {...describe('city')}
            type="text"
            autoComplete="address-level2"
            value={formData.city}
            onChange={handleChange('city')}
            onBlur={() => handleBlur('city')}
            placeholder="Your city"
            className={`${FIELD_BASE} h-12 pl-11 pr-4 ${fieldState(showError('city'))}`}
          />
        </Field>

        <Field
          id={fieldId('service')}
          label="Service Interested In"
          required
          error={showError('service')}
          icon={icons.briefcase}
          className="sm:col-span-2"
        >
          <select
            {...describe('service')}
            value={formData.service}
            onChange={handleChange('service')}
            onBlur={() => handleBlur('service')}
            className={`${FIELD_BASE} h-12 cursor-pointer appearance-none pl-11 pr-11 [&>option]:bg-white [&>option]:text-[#0b1f4d] ${
              formData.service ? '' : '!text-white/50'
            } ${fieldState(showError('service'))}`}
          >
            <option value="" disabled>
              Select a service
            </option>
            {consultationServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/70" aria-hidden="true">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </Field>

        {/* Message — optional */}
        <Field
          id={fieldId('message')}
          label={
            <>
              Message <span className="font-normal normal-case tracking-normal text-white/50">(optional)</span>
            </>
          }
          icon={icons.chat}
          iconTop
          reserveErrorLine={false}
          className="sm:col-span-2 pb-4"
        >
          <textarea
            id={fieldId('message')}
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange('message')}
            placeholder="Tell us about your concern"
            className={`${FIELD_BASE} resize-none py-3 pl-11 pr-4 ${fieldState(false)}`}
          />
        </Field>

        {/* Consent checkbox */}
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0">
              <input
                {...describe('consent')}
                type="checkbox"
                checked={formData.consent}
                onChange={handleChange('consent')}
                onBlur={() => handleBlur('consent')}
                className={`peer h-5 w-5 cursor-pointer appearance-none rounded-md border bg-white/[0.06] transition-colors checked:border-[#d4af37] checked:bg-[#d4af37] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#d4af37]/40 ${
                  showError('consent') ? 'border-red-400' : 'border-white/50 hover:border-white/70'
                }`}
              />
              <svg
                className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-[#0b1f4d] opacity-0 peer-checked:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <span className="text-sm leading-relaxed text-white/85">
              I agree to be contacted regarding my enquiry
            </span>
          </label>
          <ErrorLine id={`${fieldId('consent')}-error`} error={showError('consent')} className="ml-8" />
        </div>

        {/* Submit */}
        <div className="mt-3 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/60">
            <span className="text-[#d4af37]">*</span> Required fields
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d4af37] px-7 py-3.5 text-sm font-semibold text-[#0b1f4d] shadow-[0_12px_28px_-12px_rgba(212,175,55,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e0bf4f] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#d4af37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c3177] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0 sm:w-auto sm:min-w-[220px]"
          >
            {isSubmitting ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              'Book Free Consultation'
            )}
          </button>
        </div>
      </form>
    </>
  )
}

export default ConsultationForm
