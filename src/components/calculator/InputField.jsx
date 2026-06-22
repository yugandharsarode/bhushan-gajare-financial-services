import { useState } from 'react'

/**
 * Reusable calculator input with floating label (no overlap with values).
 */
function InputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'number',
  prefix,
  suffix,
  required = false,
  optional = false,
  min,
  step = 'any',
  hint,
}) {
  const [focused, setFocused] = useState(false)
  const hasError = Boolean(error)
  const hasValue = String(value).length > 0
  const floated = focused || hasValue

  const prefixLeft = prefix ? 'pl-11' : 'pl-4'
  const labelLeft = prefix ? 'left-11' : 'left-4'

  const handleBlur = (e) => {
    setFocused(false)
    onBlur?.(e)
  }

  return (
    <div className="w-full">
      <div
        className={`relative min-h-[3.75rem] rounded-xl border bg-white transition-all duration-200 ${
          hasError
            ? 'border-red-300 ring-2 ring-red-100'
            : focused
              ? 'border-brand-500 ring-2 ring-brand-100'
              : 'border-brand-100 hover:border-brand-300'
        }`}
      >
        {prefix && (
          <span
            className={`pointer-events-none absolute z-10 text-sm font-medium text-brand-600 transition-all duration-200 ${
              floated ? 'left-4 top-[2.15rem]' : 'left-4 top-1/2 -translate-y-1/2'
            }`}
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          min={min}
          step={step}
          inputMode={type === 'number' ? 'decimal' : undefined}
          placeholder=" "
          className={`w-full rounded-xl bg-transparent text-sm font-medium text-brand-800 outline-none ${prefixLeft} ${
            suffix ? 'pr-12' : 'pr-4'
          } ${floated ? 'pb-3 pt-7' : 'py-3.5'}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />

        <label
          htmlFor={id}
          className={`pointer-events-none absolute z-20 max-w-[calc(100%-2rem)] truncate transition-all duration-200 ${labelLeft} ${
            floated
              ? 'top-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal normal-case tracking-normal text-brand-600'
          } ${hasError && floated ? 'text-red-600' : ''}`}
        >
          {label}
          {optional && !required && !floated && (
            <span className="text-brand-400"> (optional)</span>
          )}
        </label>

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-brand-600">
            {suffix}
          </span>
        )}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-brand-600">
          {hint}
        </p>
      )}
    </div>
  )
}

export default InputField
