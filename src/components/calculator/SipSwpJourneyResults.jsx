import {
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineCurrencyRupee,
  HiOutlineExclamationTriangle,
  HiOutlineWallet,
} from 'react-icons/hi2'
import { formatIndianCurrency } from '../../utils/formatCurrency'
import CurrencyAmount from './CurrencyAmount'
import DownloadReportButton from './DownloadReportButton'
import JourneyCorpusChart from './JourneyCorpusChart'
import ProjectionTable from './ProjectionTable'
import ResultCard from './ResultCard'

const TABLE_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'stage', label: 'Stage' },
  { key: 'invested', label: 'Invested', type: 'currency' },
  { key: 'withdrawn', label: 'Withdrawn', type: 'currency' },
  { key: 'growth', label: 'Est. Growth', type: 'currency', highlight: true },
  { key: 'corpus', label: 'Est. Corpus at Year End', type: 'currency' },
]

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

/** "7 years 8 months", "10 years", "8 months" */
function formatDuration({ years, months }) {
  const parts = []
  if (years) parts.push(plural(years, 'year'))
  if (months) parts.push(plural(months, 'month'))
  return parts.join(' ') || 'less than a month'
}

const formatPercent = (value) => `${Number(value.toFixed(2))}%`

/** An amount inside a sentence, in the surrounding text colour */
function Amount({ value }) {
  return <strong className="whitespace-nowrap font-semibold">{formatIndianCurrency(value)}</strong>
}

function StatusBanner({ inputs, result }) {
  const { withdraw } = result.stageYears
  const plannedPeriod = plural(withdraw, 'year')

  if (result.sufficient) {
    return (
      <div className="hero-animate-in flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6" style={{ animationDelay: '0.05s', opacity: 0 }} role="status">
        <HiOutlineCheckCircle className="h-7 w-7 shrink-0 text-emerald-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Corpus sufficient</p>
          <p className="mt-1 text-lg font-semibold text-emerald-950">
            Estimated to last the full {plannedPeriod} of withdrawals
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-900">
            Withdrawing <Amount value={inputs.monthlyWithdrawal} /> a month, about{' '}
            <Amount value={result.remainingCorpus} /> is estimated to remain at the end of year{' '}
            {result.totalYears}.
          </p>
        </div>
      </div>
    )
  }

  const plannedMonths = withdraw * 12
  const early = formatDuration({
    years: Math.floor((plannedMonths - result.monthsFullyFunded) / 12),
    months: (plannedMonths - result.monthsFullyFunded) % 12,
  })
  const lasts =
    result.monthsFullyFunded === 0
      ? 'in the first month of withdrawals'
      : `after about ${formatDuration(result.lastsFor)} of withdrawals`

  return (
    <div className="hero-animate-in flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6" style={{ animationDelay: '0.05s', opacity: 0 }} role="status">
      <HiOutlineExclamationTriangle className="h-7 w-7 shrink-0 text-red-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Corpus not sufficient</p>
        <p className="mt-1 text-lg font-semibold text-red-950">Estimated to run out {lasts}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-red-900">
          That is around year {result.runOutJourneyYear} of your {result.totalYears}-year journey, about {early}{' '}
          before the planned {plannedPeriod} end.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-red-900">
          To last the full {plannedPeriod}, you would need an estimated <Amount value={result.requiredCorpus} /> when
          withdrawals start (<Amount value={result.additionalCorpusNeeded} /> more), or could withdraw about{' '}
          <Amount value={result.sustainableMonthlyWithdrawal} /> a month instead.
        </p>
      </div>
    </div>
  )
}

function StageCard({ number, name, years, icon: Icon, detail, lines, endLabel, endValue, endNote, delay }) {
  return (
    <article
      className="hero-animate-in hydro-card relative flex min-w-0 flex-col rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b38f24]">Stage {number}</p>
            <h3 className="text-base font-semibold text-brand-800">{name}</h3>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{years}</span>
      </div>

      <p className="mt-4 text-sm text-slate-600">{detail}</p>
      {lines.length > 0 && (
        <dl className="mt-3 space-y-1.5 text-sm">
          {lines.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right">
                <CurrencyAmount value={value} size="sm" inline />
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="min-h-4 flex-1" aria-hidden="true" />
      <div className="border-t border-slate-100 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{endLabel}</p>
        <div className="mt-1">
          <CurrencyAmount value={endValue} size="md" />
        </div>
        {endNote && <p className="mt-1 text-xs font-medium text-red-700">{endNote}</p>}
      </div>
    </article>
  )
}

function StageArrow() {
  return (
    <div className="hidden items-center justify-center text-[#d4af37] lg:flex" aria-hidden="true">
      <HiOutlineChevronRight className="h-6 w-6" />
    </div>
  )
}

/**
 * Results for the SIP to SWP Journey Planner (the SIP calculator's optional mode).
 */
function SipSwpJourneyResults({ inputs, result, rows }) {
  const { build, grow, withdraw } = result.stageYears
  const yearRange = (from, count) => (count === 1 ? `Year ${from}` : `Years ${from}–${from + count - 1}`)
  const hasLumpSum = inputs.lumpSum > 0

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Your SIP → SWP Journey</h2>
          <span className="rounded-full border border-[#d4af37]/50 bg-[#d4af37]/10 px-2.5 py-0.5 text-xs font-semibold text-[#8a6d17]">
            All figures are estimates
          </span>
        </div>
        <DownloadReportButton />
      </div>

      <StatusBanner inputs={inputs} result={result} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-2">
        <StageCard
          number={1}
          name="Build"
          years={yearRange(1, build)}
          icon={HiOutlineBanknotes}
          detail={`${inputs.monthlySip > 0 ? `SIP of ${formatIndianCurrency(inputs.monthlySip)} a month` : 'Lump sum only'} · ${formatPercent(inputs.buildReturnPercent)} a year (est.)`}
          lines={[
            ...(hasLumpSum ? [['SIP invested', result.totalSipInvested], ['Lump sum', inputs.lumpSum]] : [['Total invested', result.totalInvested]]),
            ['Estimated growth', result.buildGrowth],
          ]}
          endLabel="Estimated corpus at end"
          endValue={result.corpusAfterBuild}
          delay={0.1}
        />
        <StageArrow />
        <StageCard
          number={2}
          name="Grow"
          years={grow > 0 ? yearRange(build + 1, grow) : 'Skipped'}
          icon={HiOutlineArrowTrendingUp}
          detail={
            grow > 0
              ? `No new investment · ${formatPercent(inputs.growReturnPercent)} a year (est.)`
              : 'No Grow stage: withdrawals start right after Build'
          }
          lines={grow > 0 ? [['Estimated growth', result.growGrowth]] : []}
          endLabel="Estimated corpus at end"
          endValue={result.corpusAfterGrow}
          delay={0.15}
        />
        <StageArrow />
        <StageCard
          number={3}
          name="Withdraw"
          years={yearRange(build + grow + 1, withdraw)}
          icon={HiOutlineWallet}
          detail={`${formatIndianCurrency(inputs.monthlyWithdrawal)} a month · ${formatPercent(inputs.withdrawReturnPercent)} a year (est.)`}
          lines={[
            ['Total withdrawn', result.totalWithdrawn],
            ['Estimated returns earned', result.withdrawReturns],
          ]}
          endLabel={result.sufficient ? 'Estimated corpus remaining' : 'Corpus at end'}
          endValue={result.remainingCorpus}
          endNote={result.sufficient ? null : `Runs out around year ${result.runOutJourneyYear}`}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultCard
          label={hasLumpSum ? 'Total Invested (SIP + Lump Sum)' : 'Total SIP Investment'}
          value={result.totalInvested}
          icon={HiOutlineCurrencyRupee}
          accent="brand"
          delay={0.25}
        />
        <ResultCard
          label="Estimated Growth Before Withdrawals"
          value={result.estimatedGrowth}
          icon={HiOutlineArrowTrendingUp}
          accent="gold"
          delay={0.3}
        />
        <ResultCard
          label={`Total Withdrawn over ${plural(withdraw, 'Year')} (Est.)`}
          value={result.totalWithdrawn}
          icon={HiOutlineWallet}
          accent="brand"
          delay={0.35}
        />
        <ResultCard
          label={result.sufficient ? 'Estimated Corpus Remaining' : 'Withdrawals Not Covered (Est.)'}
          value={result.sufficient ? result.remainingCorpus : result.withdrawalShortfall}
          icon={result.sufficient ? HiOutlineBanknotes : HiOutlineExclamationTriangle}
          accent="gold"
          delay={0.4}
        />
      </div>

      <JourneyCorpusChart rows={rows} stageYears={result.stageYears} startingCorpus={inputs.lumpSum} result={result} />

      <ProjectionTable
        title="Year-by-Year Journey"
        rows={rows}
        columns={TABLE_COLUMNS}
        subtitle="Estimated values at each year end"
      />

      <p className="text-xs leading-relaxed text-slate-500">
        * All figures are estimates, not guaranteed outcomes. They assume each stage&apos;s expected return stays
        constant every month (compounded monthly at the equivalent monthly rate). SIP instalments and withdrawals are
        made at the start of each month. Actual returns vary, and taxes, exit loads and inflation are not included.
        This is for illustration only, not financial advice.
      </p>
    </div>
  )
}

export default SipSwpJourneyResults
