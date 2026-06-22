import CurrencyAmount from './CurrencyAmount'

/**
 * Secondary result card for detailed breakdown metrics.
 */
function SummaryCard({ label, value, decimals = 0, accent = 'slate', delay = 0 }) {
  const accentBorder = {
    slate: 'border-slate-200',
    brand: 'border-brand-100 bg-brand-50/30',
    emerald: 'border-emerald-100 bg-emerald-50/30',
    amber: 'border-amber-100 bg-amber-50/30',
  }

  return (
    <div
      className={`hero-animate-in rounded-xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:p-5 ${accentBorder[accent] || accentBorder.slate}`}
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="mt-2">
        <CurrencyAmount value={value} size="md" decimals={decimals} />
      </div>
    </div>
  )
}

export default SummaryCard
