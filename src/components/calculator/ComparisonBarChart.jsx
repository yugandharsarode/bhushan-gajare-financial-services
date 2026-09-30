import { HiOutlineChartBar } from 'react-icons/hi2'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatIndianCurrency } from '../../utils/formatCurrency'

const BAR_COLORS = ['#1d4ed8', '#d4af37', '#10b981']

/** Compact axis labels in lakh / crore: ₹1.5L, ₹80L, ₹1.2Cr */
function formatAxisAmount(value) {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const short = (n) => String(Number(n.toFixed(n >= 10 ? 0 : 1)))
  if (abs >= 1e7) return `${sign}₹${short(abs / 1e7)}Cr`
  if (abs >= 1e5) return `${sign}₹${short(abs / 1e5)}L`
  if (abs >= 1e3) return `${sign}₹${short(abs / 1e3)}K`
  return `${sign}₹${abs.toFixed(0)}`
}

/**
 * Side-by-side comparison of a few rupee amounts.
 * bars: [{ name, value }]
 */
function ComparisonBarChart({ title, subtitle, bars }) {
  return (
    <div
      className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      style={{ animationDelay: '0.25s', opacity: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <HiOutlineChartBar className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-6 h-56 w-full min-h-[220px] sm:h-64">
        <ResponsiveContainer width="100%" height="100%" minHeight={220} initialDimension={{ width: 520, height: 240 }}>
          <BarChart data={bars} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} tickLine={false} />
            <YAxis
              tickFormatter={formatAxisAmount}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip
              formatter={(value) => formatIndianCurrency(value)}
              cursor={{ fill: 'rgba(15, 61, 145, 0.05)' }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
              {bars.map((bar, index) => (
                <Cell key={bar.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ComparisonBarChart
