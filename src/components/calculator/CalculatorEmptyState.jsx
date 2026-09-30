import { HiOutlineChartPie } from 'react-icons/hi2'

function CalculatorEmptyState({
  title = 'Your results will appear here',
  description = 'Fill in the details above and click Calculate to see results.',
}) {
  return (
    <div
      className="hero-animate-in flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-white/70 px-6 py-8 text-center sm:flex-row sm:text-left"
      style={{ animationDelay: '0.1s', opacity: 0 }}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600">
        <HiOutlineChartPie className="h-7 w-7" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

export default CalculatorEmptyState
