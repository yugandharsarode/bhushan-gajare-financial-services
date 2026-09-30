import CurrencyAmount from './CurrencyAmount'

const accentStyles = {
  brand: 'from-brand-600 to-brand-700',
  success: 'from-brand-500 to-brand-700',
  gold: 'from-[#d4af37] to-[#b38f24]',
  emerald: 'from-brand-500 to-brand-700',
  amber: 'from-[#d4af37] to-[#b38f24]',
}

/**
 * Premium summary card for calculator results: label and icon on top,
 * the amount on its own line below.
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
  const gradient = accentStyles[accent] || accentStyles.brand

  return (
    <article
      className={`group hydro-card @container relative flex min-w-0 flex-col overflow-hidden rounded-xl p-5 transition-all duration-500 hover:-translate-y-0.5 sm:p-6 ${
        animate ? 'hero-animate-in' : ''
      }`}
      style={animate ? { animationDelay: `${delay}s`, opacity: 0 } : undefined}
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] transition-transform duration-500 group-hover:scale-110`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-semibold uppercase leading-snug tracking-wider text-brand-600">
          {label}
        </p>
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="relative mt-auto pt-3">
        <CurrencyAmount value={value} size="lg" decimals={decimals} />
      </div>
    </article>
  )
}

export default ResultCard
