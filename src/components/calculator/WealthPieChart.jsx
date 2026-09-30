import { HiOutlineChartPie } from 'react-icons/hi2'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatIndianCurrency } from '../../utils/formatCurrency'

const PIE_COLORS = ['#1d4ed8', '#10b981', '#d4af37']

/**
 * Donut chart with a breakdown list beside it.
 * Defaults to invested vs wealth gain; pass `slices` ([{ name, value }]) and
 * `valueFormatter` to chart other splits.
 */
function WealthPieChart({
  invested,
  gain,
  title = 'Wealth Composition',
  subtitle = 'Invested vs estimated gains',
  slices,
  valueFormatter = (value) => formatIndianCurrency(value),
  showShare = true,
}) {
  const pieData = (
    slices ?? [
      { name: 'Invested Amount', value: invested },
      { name: 'Wealth Gain', value: gain },
    ]
  ).map((slice) => ({ ...slice, value: Math.max(0, slice.value) }))
  const total = pieData.reduce((sum, slice) => sum + slice.value, 0)

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

      <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
        <div className="h-56 w-full min-h-[220px] sm:h-64">
          <ResponsiveContainer width="100%" height="100%" minHeight={220} initialDimension={{ width: 320, height: 240 }}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="85%"
                paddingAngle={pieData.filter((slice) => slice.value > 0).length > 1 ? 3 : 0}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => valueFormatter(value)}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-col gap-3">
          {pieData.map((slice, index) => {
            const share = total > 0 ? (slice.value / total) * 100 : 0
            return (
              <li
                key={slice.name}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-slate-700">{slice.name}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-bold tabular-nums text-slate-900">
                    {valueFormatter(slice.value)}
                  </span>
                  {showShare && (
                    <span className="block text-xs tabular-nums text-slate-500">
                      {share.toFixed(1)}%
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default WealthPieChart
