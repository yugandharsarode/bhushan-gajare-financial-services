/**
 * Format numbers in Indian currency style (₹ with lakh/crore grouping).
 */

export function formatIndianCurrencyParts(value, options = {}) {
  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    decimals,
  } = options

  const maxFrac = decimals ?? maximumFractionDigits
  const minFrac = decimals ?? minimumFractionDigits
  const num = Number(value)
  if (!Number.isFinite(num)) {
    return { symbol: '₹', amount: '0' }
  }

  const amount = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: minFrac,
  }).format(num)

  return { symbol: '₹', amount }
}

export function formatIndianCurrency(value, options = {}) {
  const { symbol, amount } = formatIndianCurrencyParts(value, options)
  return `${symbol}${amount}`
}

export function formatIndianNumber(value, options = {}) {
  const { maximumFractionDigits = 0 } = options
  const num = Number(value)
  if (!Number.isFinite(num)) return '0'

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits,
  }).format(num)
}
