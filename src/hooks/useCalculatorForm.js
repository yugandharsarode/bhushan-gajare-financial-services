import { useState, useCallback } from 'react'
import {
  validateRequiredPositive,
  validateOptionalNonNegative,
} from '../utils/calculatorValidation'

/**
 * Shared form state and validation for calculators.
 */
export function useCalculatorForm(initialForm, fieldLabels) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateField = useCallback(
    (field) => (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const validate = useCallback(() => {
    const requiredFields = {}
    const optionalFields = {}
    const nextErrors = {}

    for (const [key, config] of Object.entries(fieldLabels)) {
      if (config.required) {
        requiredFields[key] = { value: form[key], label: config.label }
      } else if (config.optional) {
        optionalFields[key] = config.label
      }
    }

    Object.assign(nextErrors, validateRequiredPositive(requiredFields))

    for (const [key, label] of Object.entries(optionalFields)) {
      const err = validateOptionalNonNegative(form[key], label)
      if (err) nextErrors[key] = err
    }

    return nextErrors
  }, [form, fieldLabels])

  const reset = useCallback(() => {
    setForm(initialForm)
    setErrors({})
    setSubmitted(false)
  }, [initialForm])

  const getNumericValues = useCallback(
    (optionalKeys = []) => {
      const values = {}
      for (const key of Object.keys(form)) {
        if (optionalKeys.includes(key) && form[key] === '') {
          values[key] = 0
        } else {
          values[key] = Number(form[key])
        }
      }
      return values
    },
    [form]
  )

  return {
    form,
    errors,
    submitted,
    setSubmitted,
    updateField,
    validate,
    reset,
    getNumericValues,
    setErrors,
  }
}
