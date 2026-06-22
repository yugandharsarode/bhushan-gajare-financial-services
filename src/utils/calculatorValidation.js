/**
 * Shared validation helpers for financial calculators.
 */

export function parsePositiveNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
}

export function parseOptionalNonNegativeNumber(value) {
  if (value === '' || value === null || value === undefined) return 0
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return null
  return num
}

export function validateRequiredPositive(fields) {
  const errors = {}
  for (const [key, { value, label }] of Object.entries(fields)) {
    if (value === '' || value === null || value === undefined) {
      errors[key] = `${label} is required`
      continue
    }
    const num = Number(value)
    if (!Number.isFinite(num)) {
      errors[key] = `Please enter a valid ${label.toLowerCase()}`
    } else if (num <= 0) {
      errors[key] = `${label} must be greater than zero`
    }
  }
  return errors
}

export function validateOptionalNonNegative(value, label) {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  if (!Number.isFinite(num)) {
    return `Please enter a valid ${label.toLowerCase()}`
  }
  if (num < 0) {
    return `${label} cannot be negative`
  }
  return null
}
