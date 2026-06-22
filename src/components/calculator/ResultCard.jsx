import CurrencyAmount from './CurrencyAmount'

const accentStyles = {
  brand: 'from-brand-600 to-brand-700',
  success: 'from-brand-500 to-brand-700',
  gold: 'from-[#d4af37] to-[#b38f24]',
  emerald: 'from-brand-500 to-brand-700',
  amber: 'from-[#d4af37] to-[#b38f24]',
}

/**
 * Premium summary card for calculator results.
 */
function ResultCard({
  label,
  value,
  icon: Icon,
  accent = 'brand',
  delay = 0,
  animate = true,
  decimals = 0,
}) {
  return (
    <article
      className={`group hydro-card relative overflow-hidden rounded-xl p-5 transition-all duration-500 hover:-translate-y-0.5 sm:p-6 ${
        animate ? 'hero-animate-in' : ''
      }`}
      style={animate ? { animationDelay: `${delay}s`, opacity: 0 } : undefined}
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accentStyles[accent] || accentStyles.brand} opacity-[0.08] transition-transform duration-500 group-hover:scale-110`}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {label}
          </p>
          <div className="mt-2">
            <CurrencyAmount value={value} size="lg" decimals={decimals} />
          </div>
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl bg-gradient-to-br sm:h-11 sm:w-11 ${accentStyles[accent] || accentStyles.brand} text-white shadow-md`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
    </article>
  )
}

export default ResultCard
