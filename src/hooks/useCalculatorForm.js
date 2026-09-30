import { useState, useCallback } from 'react'
import { validateFields, toNumericValues } from '../utils/calculatorValidation'

/**
 * Shared form state and validation for calculators.
 *
 * @param initialForm   initial string values for every input
 * @param schema        field rules (see utils/calculatorValidation.js)
 * @param crossValidate optional (values, fieldErrors) => extra errors for
 *                      rules that span several fields
 */
export function useCalculatorForm(initialForm, schema, crossValidate) {
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
    const fieldErrors = validateFields(form, schema)
    const extraErrors = crossValidate ? crossValidate(form, fieldErrors) : {}
    return { ...extraErrors, ...fieldErrors }
  }, [form, schema, crossValidate])

  const reset = useCallback(() => {
    setForm(initialForm)
    setErrors({})
    setSubmitted(false)
  }, [initialForm])

  const getNumericValues = useCallback(() => toNumericValues(form, schema), [form, schema])

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
