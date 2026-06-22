import { HiOutlineChartPie } from 'react-icons/hi2'

function CalculatorEmptyState({
  title = 'Your projection will appear here',
  description = 'Fill in the details and click Calculate to see results.',
}) {
  return (
    <div
      className="hero-animate-in flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center sm:min-h-[400px]"
      style={{ animationDelay: '0.1s', opacity: 0 }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600">
        <HiOutlineChartPie className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>
    </div>
  )
}

export default CalculatorEmptyState
