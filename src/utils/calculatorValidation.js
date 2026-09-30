/**
 * Shared validation helpers for financial calculators.
 *
 * A field rule looks like:
 *   {
 *     label: 'Expected annual return',
 *     required: true,      // blank is an error (otherwise blank is allowed and treated as 0)
 *     allowZero: true,     // required numbers must be > 0 unless this is set
 *     integer: true,       // whole numbers only
 *     min: 1, max: 100,    // inclusive bounds
 *     unit: '%',           // appended to bound messages
 *     currency: true,      // format bounds as ₹ amounts
 *   }
 * Optional fields (no `required`) may be blank; when filled they must be >= 0.
 */

import { formatIndianNumber } from './formatCurrency.js'

/** Upper bound for rupee inputs, keeps every projection finite */
export const MAX_AMOUNT = 1e12

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function formatBound(value, rule) {
  if (rule.currency) return `₹${formatIndianNumber(value)}`
  return `${formatIndianNumber(value, { maximumFractionDigits: 2 })}${rule.unit ?? ''}`
}

export function isBlank(value) {
  return value === '' || value === null || value === undefined || String(value).trim() === ''
}

/** Validate one numeric input value against a rule; returns an error message or null */
export function validateNumberField(value, rule) {
  const label = capitalize(rule.label)

  if (isBlank(value)) {
    return rule.required ? `${label} is required` : null
  }

  const num = Number(value)
  if (!Number.isFinite(num)) {
    return `Please enter a valid ${lowerFirst(rule.label)}`
  }
  if (num < 0) {
    return `${label} cannot be negative`
  }
  if (rule.required && !rule.allowZero && num === 0) {
    return `${label} must be greater than zero`
  }
  if (rule.integer && !Number.isInteger(num)) {
    return `${label} must be a whole number`
  }
  if (rule.min !== undefined && num < rule.min) {
    return `${label} must be at least ${formatBound(rule.min, rule)}`
  }
  if (rule.max !== undefined && num > rule.max) {
    return `${label} must be at most ${formatBound(rule.max, rule)}`
  }
  return null
}

/** Validate every field in a schema; returns { fieldKey: message } */
export function validateFields(values, schema) {
  const errors = {}
  for (const [key, rule] of Object.entries(schema)) {
    const error = validateNumberField(values[key], rule)
    if (error) errors[key] = error
  }
  return errors
}

/** Convert schema fields to numbers; blank optional fields become 0 */
export function toNumericValues(values, schema) {
  const numeric = {}
  for (const key of Object.keys(schema)) {
    numeric[key] = isBlank(values[key]) ? 0 : Number(values[key])
  }
  return numeric
}
