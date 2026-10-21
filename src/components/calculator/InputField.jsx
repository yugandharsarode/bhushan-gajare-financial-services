import { useLayoutEffect, useRef } from 'react'
import {
  fillPercent,
  positionToValue,
  sliderBounds,
  valueToPosition,
} from '../../utils/sliderScale'

/** Group an integer digit string the Indian way: 12345678 → 1,23,45,678 */
function groupIndianDigits(digits) {
  const trimmed = digits.replace(/^0+(?=\d)/, '')
  if (trimmed.length <= 3) return trimmed
  const head = trimmed.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${head},${trimmed.slice(-3)}`
}

/**
 * Keep a leading minus, digits and at most one decimal point (with a limited
 * number of decimals). Anything that would change the number's meaning is
 * kept rather than dropped, so validation can explain it ("must be a whole
 * number", "cannot be negative").
 */
function sanitizeNumber(text, maxDecimals) {
  let result = text.trimStart().startsWith('-') ? '-' : ''
  let decimals = -1
  for (const char of text) {
    if (char >= '0' && char <= '9') {
      if (decimals >= 0) {
        if (decimals >= maxDecimals) continue
        decimals++
      }
      result += char
    } else if (char === '.' && decimals < 0) {
      decimals = 0
      result += char
    }
  }
  return result
}

function formatAmount(raw) {
  if (!raw) return ''
  const sign = raw.startsWith('-') ? '-' : ''
  const unsigned = raw.slice(sign.length)
  if (!unsigned) return sign
  const [whole, fraction] = unsigned.split('.')
  const grouped = groupIndianDigits(whole) || '0'
  return `${sign}${fraction === undefined ? grouped : `${grouped}.${fraction}`}`
}

const SIGNIFICANT = /[\d.-]/

/** Position in `text` just after the n-th digit, decimal point or minus sign */
function caretAfterSignificant(text, count) {
  if (count <= 0) return 0
  let seen = 0
  for (let i = 0; i < text.length; i++) {
    if (SIGNIFICANT.test(text[i])) seen++
    if (seen === count) return i + 1
  }
  return text.length
}

/**
 * Calculator input with the label above the box and the unit inside it.
 *
 * Numbers are typed into a text box (no browser spinners) and cleaned as you
 * type: only a leading minus, digits and one decimal point are kept. Rupee
 * amounts (prefix ₹) are shown with Indian digit grouping; the value passed to
 * onChange never contains commas. Whole-number fields (step="1") get a
 * numeric keypad on phones.
 *
 * Pass `range` (see utils/sliderScale.js) to show a slider under the box; the
 * slider and the box always show the same value.
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
  step = 'any',
  hint,
  placeholder = '',
  range,
}) {
  const inputRef = useRef(null)
  const pendingCaret = useRef(null)
  const isNumber = type !== 'text'
  const isAmount = isNumber && prefix === '₹'
  const wholeNumber = step === '1'
  const maxDecimals = isAmount ? 2 : 4
  const rawValue = value === null || value === undefined ? '' : String(value)
  const displayValue = isAmount ? formatAmount(rawValue) : rawValue
  const hasError = Boolean(error)

  useLayoutEffect(() => {
    const input = inputRef.current
    if (pendingCaret.current === null || !input || document.activeElement !== input) return
    const position = caretAfterSignificant(displayValue, pendingCaret.current)
    input.setSelectionRange(position, position)
    pendingCaret.current = null
  }, [displayValue])

  const handleChange = (e) => {
    if (!isNumber) {
      onChange(e)
      return
    }
    const typed = e.target.value
    const caret = e.target.selectionStart ?? typed.length
    pendingCaret.current = typed.slice(0, caret).replace(/[^\d.-]/g, '').length
    onChange({ target: { value: sanitizeNumber(typed, maxDecimals) } })
  }

  const describedBy = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            hasError ? 'text-red-600' : 'text-brand-700'
          }`}
        >
          {label}
        </label>
        {optional && !required && (
          <span className="shrink-0 text-[11px] font-medium text-slate-400">Optional</span>
        )}
      </div>

      <div
        className={`flex h-12 items-center gap-2 rounded-xl border bg-white px-4 transition-all duration-200 ${
          hasError
            ? 'border-red-500 ring-[3px] ring-red-100 focus-within:ring-red-200'
            : 'border-field hover:border-field-hover focus-within:border-brand-600 focus-within:ring-[3px] focus-within:ring-brand-600/15'
        }`}
      >
        {prefix && (
          <span className="shrink-0 text-sm font-semibold text-brand-600" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode={isNumber ? (wholeNumber ? 'numeric' : 'decimal') : undefined}
          autoComplete="off"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="h-full w-full min-w-0 bg-transparent text-[15px] font-semibold tabular-nums text-brand-800 outline-none placeholder:font-normal placeholder:text-slate-400"
          aria-invalid={hasError}
          aria-describedby={describedBy}
        />
        {suffix && (
          <span className="shrink-0 text-sm font-medium text-slate-500" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>

      {range && isNumber && (
        <RangeSlider
          id={`${id}-range`}
          label={label}
          range={range}
          value={rawValue}
          onChange={(next) => onChange({ target: { value: String(next) } })}
        />
      )}

      {hasError && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
}

/** Slider bound to the same value as the text box */
function RangeSlider({ id, label, range, value, onChange }) {
  const numeric = value === '' ? NaN : Number(value)
  const position = valueToPosition(numeric, range)
  const bounds = sliderBounds(range)
  const filled = Number.isFinite(numeric) ? fillPercent(position, range) : 0

  return (
    <input
      id={id}
      type="range"
      min={bounds.min}
      max={bounds.max}
      step={bounds.step}
      value={position}
      onChange={(e) => onChange(positionToValue(Number(e.target.value), range))}
      className="calc-range mt-3"
      data-empty={Number.isFinite(numeric) ? undefined : 'true'}
      style={{ '--fill': `${filled}%` }}
      aria-label={`${label} slider`}
    />
  )
}

export default InputField
