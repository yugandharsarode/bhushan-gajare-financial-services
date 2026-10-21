import { HiOutlineChartBar } from 'react-icons/hi2'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatCompactCurrency, formatIndianCurrency } from '../../utils/formatCurrency'

const LINE = '#0f3d91'
const RUN_OUT = '#dc2626'
// Neutral shading keeps the blue area wash blue; the middle stage is shaded to set it apart
const STAGE_FILLS = { Build: '#ffffff', Grow: '#f1f5f9', Withdraw: '#ffffff' }

/** Round axis steps (1, 2, 2.5 or 5 × a power of ten) from zero to just above `max` */
function niceTicks(max, count = 4) {
  if (!(max > 0)) return [0, 1]
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw)
  const top = Math.ceil(max / step) * step
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-lg">
      <p className="text-xs font-medium text-slate-500">
        {point.year === 0 ? 'Start' : `Year ${point.year}`} · {point.stage}
      </p>
      <p className="mt-0.5 font-semibold text-slate-900">{formatIndianCurrency(point.corpus)}</p>
      <p className="text-[11px] text-slate-500">Estimated corpus</p>
    </div>
  )
}

/**
 * Estimated corpus across the Build → Grow → Withdraw journey, one point per
 * year, with each stage shaded behind the line.
 */
function JourneyCorpusChart({ rows, stageYears, startingCorpus, result }) {
  const { build, grow, withdraw } = stageYears
  const total = build + grow + withdraw
  const data = [{ year: 0, stage: 'Build', corpus: startingCorpus }, ...rows]
  const yTicks = niceTicks(Math.max(...data.map((point) => point.corpus)))

  const stages = [
    { name: 'Build', from: 0, to: build },
    { name: 'Grow', from: build, to: build + grow },
    { name: 'Withdraw', from: build + grow, to: total },
  ].filter((stage) => stage.to > stage.from)

  const milestones = [
    { year: build, corpus: result.corpusAfterBuild },
    ...(grow > 0 ? [{ year: build + grow, corpus: result.corpusAfterGrow }] : []),
    ...(result.sufficient ? [{ year: total, corpus: result.remainingCorpus }] : []),
  ]

  const summary = `Estimated corpus: ${formatIndianCurrency(result.corpusAfterBuild)} after Build, ${formatIndianCurrency(
    result.corpusAfterGrow
  )} when withdrawals start, ${
    result.sufficient
      ? `${formatIndianCurrency(result.remainingCorpus)} at the end of year ${total}`
      : `running out in year ${result.runOutJourneyYear}`
  }.`

  return (
    <div
      className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      style={{ animationDelay: '0.25s', opacity: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <HiOutlineChartBar className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Estimated Corpus Over Your Journey</h3>
          <p className="text-sm text-slate-600">Year by year, assuming each stage&apos;s return stays constant</p>
        </div>
      </div>

      <div className="mt-6 h-72 w-full min-h-[260px] sm:h-80" role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%" minHeight={260} initialDimension={{ width: 720, height: 300 }}>
          <AreaChart data={data} margin={{ top: 28, right: 16, left: 4, bottom: 4 }}>
            {stages.map((stage) => (
              <ReferenceArea
                key={stage.name}
                x1={stage.from}
                x2={stage.to}
                fill={STAGE_FILLS[stage.name]}
                fillOpacity={1}
                ifOverflow="extendDomain"
                label={{ value: stage.name, position: 'insideTop', fill: '#475569', fontSize: 12, fontWeight: 600, dy: -22 }}
              />
            ))}
            {stages.slice(1).map((stage) => (
              <ReferenceLine key={stage.name} x={stage.from} stroke="#cbd5e1" />
            ))}
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[0, total]}
              ticks={[0, ...stages.map((stage) => stage.to)]}
              tickFormatter={(year) => `Yr ${year}`}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              domain={[0, yTicks.at(-1)]}
              ticks={yTicks}
              tickFormatter={formatCompactCurrency}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="corpus"
              stroke={LINE}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill={LINE}
              fillOpacity={0.1}
              activeDot={{ r: 5, fill: LINE, stroke: '#ffffff', strokeWidth: 2 }}
            />
            {milestones.map((point) => (
              <ReferenceDot
                key={point.year}
                x={point.year}
                y={point.corpus}
                r={5}
                fill={LINE}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
            {!result.sufficient && (
              <ReferenceDot
                x={result.runOutJourneyYear}
                y={0}
                r={5}
                fill={RUN_OUT}
                stroke="#ffffff"
                strokeWidth={2}
                label={{ value: 'Runs out', position: 'right', fill: '#334155', fontSize: 12, fontWeight: 600, offset: 8, dy: -12 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default JourneyCorpusChart
