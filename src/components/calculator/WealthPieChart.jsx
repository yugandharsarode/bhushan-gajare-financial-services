import { HiOutlineChartPie } from 'react-icons/hi2'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { formatIndianCurrency } from '../../utils/formatCurrency'

const PIE_COLORS = ['#1d4ed8', '#10b981']

/**
 * Invested vs wealth gain donut chart section.
 */
function WealthPieChart({
  invested,
  gain,
  title = 'Wealth Composition',
  subtitle = 'Invested vs estimated gains',
}) {
  const pieData = [
    { name: 'Invested Amount', value: Math.max(0, invested) },
    { name: 'Wealth Gain', value: Math.max(0, gain) },
  ]

  return (
    <div
      className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      style={{ animationDelay: '0.25s', opacity: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <HiOutlineChartPie className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 h-56 w-full min-h-[220px] sm:h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatIndianCurrency(value)}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-sm text-slate-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WealthPieChart
