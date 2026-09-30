import { formatIndianCurrencyParts } from '../../utils/formatCurrency'

const sizeStyles = {
  sm: { symbol: 'text-sm', amount: 'text-sm' },
  md: { symbol: 'text-base', amount: 'text-lg' },
  // Scales with the card it sits in (see ResultCard's @container), capped at 1.5rem
  lg: { symbol: 'text-lg', amount: 'text-[clamp(1.05rem,12cqi,1.5rem)]' },
}

/**
 * Rupee amount with the symbol kept on the same line as the digits.
 *
 * Plain inline text (no flex box), so it lays out the same in every browser
 * inside paragraphs and table cells. In cards a very long amount may break
 * inside the number rather than overflow; with `inline` (tables, sentences)
 * it never breaks.
 */
function CurrencyAmount({
  value,
  size = 'lg',
  className = '',
  amountClassName = '',
  decimals = 0,
  inline = false,
}) {
  const { symbol, amount } = formatIndianCurrencyParts(value, { decimals })
  const styles = sizeStyles[size] || sizeStyles.lg
  const wrapping = inline || size === 'sm' ? 'whitespace-nowrap' : 'inline-block max-w-full [overflow-wrap:anywhere]'

  return (
    <span className={`leading-tight ${wrapping} ${className}`} aria-label={`${symbol}${amount}`}>
      <span className={`mr-1 font-semibold text-slate-500 ${styles.symbol}`}>{symbol}</span>
      <span
        className={`font-bold tabular-nums tracking-tight text-slate-900 ${styles.amount} ${amountClassName}`}
      >
        {amount}
      </span>
    </span>
  )
}

export default CurrencyAmount
