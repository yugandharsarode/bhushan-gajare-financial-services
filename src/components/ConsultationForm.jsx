import { useState, useEffect, useCallback } from 'react'
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
}

/**
 * Premium floating-label text input with icon and error display.
 * Label position is driven by value + focus (not :placeholder-shown) so
 * controlled React inputs never overlap typed text.
 */
function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  icon,
  maxLength,
  inputMode,
}) {
  const [focused, setFocused] = useState(false)
  const hasError = Boolean(error)
  const hasValue = String(value).length > 0
  const floated = focused || hasValue

  const handleBlur = (e) => {
    setFocused(false)
    onBlur?.(e)
  }

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-brand-400">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`w-full rounded-sm border bg-white pl-12 pr-4 text-sm text-[#292929] shadow-sm transition-all duration-500 focus:outline-none focus:ring-2 ${
            floated ? 'pt-5 pb-2.5' : 'py-3.5'
          } ${
            hasError
              ? 'border-red-300 focus:border-red-400 focus:ring-red-200/50'
              : 'border-[#e0e0e0] focus:border-brand-600 focus:ring-brand-600/20'
          }`}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-12 z-20 transition-all duration-200 ${
            floated
              ? '-top-2.5 bg-white px-1 text-xs font-medium text-brand-700'
              : 'top-1/2 -translate-y-1/2 text-sm text-brand-600'
          } ${focused && !hasValue ? 'text-brand-600' : ''} ${
            hasError ? 'text-red-500' : ''
          }`}
        >
          {label}
        </label>
      </div>
      <p
        className={`mt-1.5 min-h-[1.25rem] text-xs transition-opacity duration-200 ${
          hasError ? 'text-red-600 opacity-100' : 'opacity-0'
        }`}
        role="alert"
      >
        {error || '\u00A0'}
      </p>
    </div>
  )
}

/**
 * Premium select with floating label styling.
 */
function FormSelect({ id, label, value, onChange, onBlur, error, icon }) {
  const hasError = Boolean(error)
  const hasValue = Boolean(value)

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-brand-400">
          {icon}
        </span>
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full appearance-none rounded-sm border bg-white py-3.5 pl-12 pr-10 text-sm text-[#292929] shadow-sm transition-all duration-500 focus:outline-none focus:ring-2 ${
            hasError
              ? 'border-red-300 focus:border-red-400 focus:ring-red-200/50'
              : 'border-[#e0e0e0] focus:border-brand-600 focus:ring-brand-600/20'
          } ${!hasValue ? 'text-[#757575]' : ''}`}
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
        {/* Select labels stay above the field — avoids overlap with the dropdown value */}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-12 -top-2.5 z-20 bg-white px-1 text-xs font-medium ${
            hasError ? 'text-red-500' : 'text-brand-700'
          }`}
        >
          {label}
        </label>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>
      <p
        className={`mt-1.5 min-h-[1.25rem] text-xs transition-opacity duration-200 ${
          hasError ? 'text-red-600 opacity-100' : 'opacity-0'
        }`}
        role="alert"
      >
        {error || '\u00A0'}
      </p>
    </div>
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
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const valid = isFormValid(validateForm(formData))

  // Re-validate whenever form data changes (real-time)
  useEffect(() => {
    setErrors(validateForm(formData))
  }, [formData])

  const showError = (field) => (touched[field] ? errors[field] : '')

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleChange = (field) => (e) => {
    const value =
      field === 'consent' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  /** Phone: digits only, max 10 characters */
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData((prev) => ({ ...prev, phone: digits }))
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      // Mark all fields as touched to show any remaining errors
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        city: true,
        service: true,
        consent: true,
      })

      const validationErrors = validateForm(formData)
      setErrors(validationErrors)

      if (!isFormValid(validationErrors)) return

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
    },
    [formData, onSuccess],
  )

  const isModal = variant === 'modal'

  if (submitSuccess) {
    return (
      <div
      className={`consultation-pattern hydro-card relative overflow-hidden rounded-xl p-8 text-center sm:p-12 ${
          isModal ? '' : 'mx-auto max-w-3xl'
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-6 text-xl font-bold text-brand-800 sm:text-2xl">
          Thank you! Our team will contact you shortly.
        </h3>
        <p className="mt-3 text-[#334155]">
          We have received your enquiry and will reach out within 1–2 business days.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`consultation-pattern hydro-card relative overflow-hidden rounded-xl ${
        isModal ? '' : 'mx-auto max-w-3xl'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-brand-700/96" />

      <div className="relative p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
              Free Consultation
            </p>
            <h2
              id="consultation-modal-title"
              className="mt-1 text-2xl font-bold text-white sm:text-3xl"
            >
              Book Free Consultation
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">
              Share your details and our team will guide you on demat, investments,
              and financial planning.
            </p>
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-[#d4af37] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close form"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-1" noValidate>
          <div className="grid gap-1 sm:grid-cols-2">
            <FormInput
              id="fullName"
              label="Full Name *"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              onBlur={() => handleBlur('fullName')}
              error={showError('fullName')}
              icon={icons.user}
            />
            <FormInput
              id="email"
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={() => handleBlur('email')}
              error={showError('email')}
              icon={icons.email}
            />
          </div>

          <div className="grid gap-1 sm:grid-cols-2">
            <FormInput
              id="phone"
              label="Phone Number *"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              error={showError('phone')}
              icon={icons.phone}
              maxLength={10}
              inputMode="numeric"
            />
            <FormInput
              id="city"
              label="City *"
              value={formData.city}
              onChange={handleChange('city')}
              onBlur={() => handleBlur('city')}
              error={showError('city')}
              icon={icons.location}
            />
          </div>

          <FormSelect
            id="service"
            label="Service Interested In *"
            value={formData.service}
            onChange={handleChange('service')}
            onBlur={() => handleBlur('service')}
            error={showError('service')}
            icon={icons.briefcase}
          />

          {/* Message — optional */}
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-4 text-[#d4af37]">
                {icons.chat}
              </span>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange('message')}
                placeholder="Tell us about your concern (optional)"
                className="w-full resize-none rounded-sm border border-[#e0e0e0] bg-white py-3.5 pl-12 pr-4 text-sm text-[#292929] shadow-sm transition-all duration-500 placeholder:text-[#757575] focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/35"
              />
            </div>
          </div>

          {/* Consent checkbox */}
          <div className="pt-2">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={handleChange('consent')}
                onBlur={() => handleBlur('consent')}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#d4af37] focus:ring-[#d4af37]/35"
              />
              <span className="text-sm text-[#334155]">
                I agree to be contacted regarding my enquiry
              </span>
            </label>
            <p
              className={`ml-7 mt-1.5 min-h-[1.25rem] text-xs ${
                showError('consent') ? 'text-red-600' : 'opacity-0'
              }`}
              role="alert"
            >
              {showError('consent') || '\u00A0'}
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!valid || isSubmitting}
              className="hydro-btn w-full sm:w-auto sm:min-w-[220px]"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  'Book Free Consultation'
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConsultationForm
