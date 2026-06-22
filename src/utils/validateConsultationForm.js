/**
 * Validation helpers for the consultation enquiry form.
 * Each function returns an error string, or empty string if valid.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Indian mobile: exactly 10 digits, starting with 6–9 */
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/

export function validateFullName(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Full name is required'
  if (trimmed.length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return 'Name can only contain letters and spaces'
  }
  return ''
}

export function validateEmail(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Email address is required'
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address'
  return ''
}

export function validatePhone(value) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Phone number is required'
  if (digits.length !== 10) return 'Phone number must be exactly 10 digits'
  if (!INDIAN_PHONE_REGEX.test(digits)) {
    return 'Enter a valid Indian mobile number (starts with 6–9)'
  }
  return ''
}

export function validateCity(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'City is required'
  if (trimmed.length < 2) return 'City must be at least 2 characters'
  return ''
}

export function validateService(value) {
  if (!value) return 'Please select a service'
  return ''
}

export function validateConsent(checked) {
  if (!checked) return 'You must agree to be contacted'
  return ''
}

/** Message is optional — no error when empty */
export function validateMessage() {
  return ''
}

/** Validate all fields and return an errors object */
export function validateForm(formData) {
  return {
    fullName: validateFullName(formData.fullName),
    email: validateEmail(formData.email),
    phone: validatePhone(formData.phone),
    city: validateCity(formData.city),
    service: validateService(formData.service),
    message: validateMessage(formData.message),
    consent: validateConsent(formData.consent),
  }
}

/** True when every field has no error */
export function isFormValid(errors) {
  return Object.values(errors).every((msg) => msg === '')
}
