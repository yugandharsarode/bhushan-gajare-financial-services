import CurrencyAmount from './CurrencyAmount'

/**
 * Reusable yearly projection table for calculators.
 */
function ProjectionTable({ title = 'Yearly Projection', subtitle, rows, columns }) {
  if (!rows?.length) return null

  return (
    <div
      className="hero-animate-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ animationDelay: '0.35s', opacity: 0 }}
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-brand-900/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-3 font-semibold text-slate-700 sm:px-5"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.year ?? index}
                className={`border-b border-slate-50 transition-colors hover:bg-brand-50/30 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                }`}
              >
                {columns.map((col) => {
                  const cellValue = row[col.key]
                  const isCurrency = col.type === 'currency'
                  const isHighlight = col.highlight

                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-3 sm:px-5 ${
                        col.key === 'year' ? 'font-medium text-brand-800' : ''
                      }`}
                    >
                      {isCurrency ? (
                        <CurrencyAmount
                          value={cellValue}
                          size="sm"
                          decimals={col.decimals ?? 0}
                          amountClassName={isHighlight ? 'text-emerald-700' : ''}
                        />
                      ) : (
                        <span className="font-medium text-slate-700">{cellValue}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProjectionTable
