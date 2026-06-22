import { formatIndianCurrencyParts } from '../../utils/formatCurrency'

const sizeStyles = {
  sm: { symbol: 'text-sm', amount: 'text-sm' },
  md: { symbol: 'text-base', amount: 'text-lg' },
  lg: { symbol: 'text-lg', amount: 'text-xl sm:text-2xl' },
}

/**
 * Rupee amount with symbol and value separated for clean alignment.
 */
function CurrencyAmount({
  value,
  size = 'lg',
  className = '',
  amountClassName = '',
  decimals = 0,
}) {
  const { symbol, amount } = formatIndianCurrencyParts(value, { decimals })
  const styles = sizeStyles[size] || sizeStyles.lg

  return (
    <span
      className={`inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 leading-tight ${className}`}
      aria-label={`${symbol}${amount}`}
    >
      <span className={`shrink-0 font-semibold text-slate-500 ${styles.symbol}`}>
        {symbol}
      </span>
      <span
        className={`min-w-0 font-bold tabular-nums tracking-tight text-slate-900 ${styles.amount} ${amountClassName}`}
      >
        {amount}
      </span>
    </span>
  )
}

export default CurrencyAmount
