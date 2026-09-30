/**
 * Mapping between a slider position and a field value.
 *
 * range: { min, max, step }  used for years, ages and percentages.
 * Typing into the box still accepts any value; the slider simply pins at its
 * ends when the value is outside the range.
 */

function decimalsOf(step) {
  const text = String(step)
  return text.includes('.') ? text.split('.')[1].length : 0
}

/** Slider attributes for the native <input type="range"> */
export function sliderBounds(range) {
  return { min: range.min, max: range.max, step: range.step ?? 1 }
}

/** Slider position for a field value (clamped to the slider's ends) */
export function valueToPosition(value, range) {
  if (!Number.isFinite(value)) return range.min
  return Math.min(range.max, Math.max(range.min, value))
}

/** Field value for a slider position */
export function positionToValue(position, range) {
  const value = Math.min(range.max, Math.max(range.min, Number(position)))
  return Number(value.toFixed(decimalsOf(range.step ?? 1)))
}

/** Percentage of the track to fill for a position */
export function fillPercent(position, range) {
  if (range.max === range.min) return 0
  return ((position - range.min) / (range.max - range.min)) * 100
}
