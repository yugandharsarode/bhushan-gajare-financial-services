import { useState } from 'react'
import {
  HiOutlineBanknotes,
  HiOutlineCurrencyRupee,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import FormSection from '../../components/calculator/FormSection'
import InputField from '../../components/calculator/InputField'
import ResultCard from '../../components/calculator/ResultCard'
import SummaryCard from '../../components/calculator/SummaryCard'
import WealthPieChart from '../../components/calculator/WealthPieChart'
import ProjectionTable from '../../components/calculator/ProjectionTable'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { swpSchema, validateSwpCross } from '../../config/calculatorSchemas'
import { calculateSwpResults, SWP_MAX_MONTHS } from '../../utils/financialCalculations'

const meta = calculatorRegistry.swp

const INITIAL_FORM = {
  lumpSum: '',
  monthlySip: '',
  years: '',
  accumulationReturn: '',
  monthlyWithdrawal: '',
  annualStepUp: '',
  swpReturn: '',
}

const MAX_YEARS = SWP_MAX_MONTHS / 12

/** "8 yrs 9 mos" style duration */
function formatDuration(months) {
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`)
  if (rest) parts.push(`${rest} ${rest === 1 ? 'mo' : 'mos'}`)
  return parts.join(' ')
}

const SWP_COLUMNS = [
  { key: 'month', label: 'Month' },
  { key: 'startBalance', label: 'Start Balance', type: 'currency' },
  { key: 'withdrawal', label: 'Withdrawal', type: 'currency' },
  { key: 'returns', label: 'Returns', type: 'currency', highlight: true },
  { key: 'endBalance', label: 'End Balance', type: 'currency' },
]

function SwpCalculator() {
  const {
    form,
    errors,
    submitted,
    setSubmitted,
    setErrors,
    updateField,
    validate,
    reset,
    getNumericValues,
  } = useCalculatorForm(INITIAL_FORM, swpSchema, validateSwpCross)

  const [results, setResults] = useState(null)

  const handleCalculate = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      setResults(null)
      return
    }

    const v = getNumericValues()
    setResults(
      calculateSwpResults({
        monthlySip: v.monthlySip,
        accumulationReturnPercent: v.accumulationReturn,
        years: v.years,
        lumpSum: v.lumpSum,
        monthlyWithdrawal: v.monthlyWithdrawal,
        annualStepUpPercent: v.annualStepUp,
        swpReturnPercent: v.swpReturn,
      })
    )
    setSubmitted(true)
  }

  const handleReset = () => {
    reset()
    setResults(null)
  }

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="SWP Details"
            description="Build a corpus with SIP, then plan systematic withdrawals."
            onSubmit={handleCalculate}
            onReset={handleReset}
          >
            <FormSection title="Build the Corpus" columns={4}>
              <InputField id="lumpSum" label="Lump Sum Investment" prefix="₹" value={form.lumpSum} onChange={updateField('lumpSum')} error={errors.lumpSum} optional />
              <InputField id="monthlySip" label="Monthly SIP" prefix="₹" value={form.monthlySip} onChange={updateField('monthlySip')} error={errors.monthlySip} required hint="Enter 0 if investing only a lump sum" />
              <InputField id="years" label="Investment Duration" suffix="yrs" value={form.years} onChange={updateField('years')} error={errors.years} step="1" required hint="Whole years" range={{ min: 1, max: 40, step: 1 }} />
              <InputField id="accumulationReturn" label="Expected Return" suffix="%" value={form.accumulationReturn} onChange={updateField('accumulationReturn')} error={errors.accumulationReturn} step="0.01" required hint="During the investment phase" range={{ min: 0, max: 30, step: 0.1 }} />
            </FormSection>
            <FormSection title="Systematic Withdrawals" columns={3}>
              <InputField id="monthlyWithdrawal" label="Monthly Withdrawal" prefix="₹" value={form.monthlyWithdrawal} onChange={updateField('monthlyWithdrawal')} error={errors.monthlyWithdrawal} required />
              <InputField id="annualStepUp" label="Annual Step-Up on Withdrawal" suffix="%" value={form.annualStepUp} onChange={updateField('annualStepUp')} error={errors.annualStepUp} step="0.01" required hint="Withdrawal rises every 12 months" range={{ min: 0, max: 25, step: 0.5 }} />
              <InputField id="swpReturn" label="Return During Withdrawals" suffix="%" value={form.swpReturn} onChange={updateField('swpReturn')} error={errors.swpReturn} step="0.01" required range={{ min: 0, max: 20, step: 0.1 }} />
            </FormSection>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Results Summary</h2>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard label="Total Amount Invested" value={results.totalInvested} icon={HiOutlineCurrencyRupee} accent="brand" delay={0.1} />
                <ResultCard label="Corpus for SWP" value={results.corpusForSwp} icon={HiOutlineBanknotes} accent="amber" delay={0.15} />
                <ResultCard label="Estimated Profit" value={results.estimatedProfit} icon={HiOutlineArrowTrendingUp} accent="emerald" delay={0.2} />
                <div className="hero-animate-in hydro-card flex flex-col rounded-xl p-5 sm:p-6" style={{ animationDelay: '0.25s', opacity: 0 }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Corpus Lasts</p>
                  {results.lastsBeyondSchedule ? (
                    <p className="mt-auto pt-3 text-2xl font-bold text-slate-900">{MAX_YEARS}+ <span className="text-base font-semibold text-slate-500">years</span></p>
                  ) : (
                    <p className="mt-auto pt-3 text-2xl font-bold text-slate-900">{results.corpusLastsMonths} <span className="text-base font-semibold text-slate-500">months</span></p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard label="Future Value of SIPs" value={results.sipFutureValue} accent="brand" delay={0.3} />
                <SummaryCard label="Future Value of Lumpsum" value={results.lumpSumFutureValue} accent="emerald" delay={0.35} />
              </div>

              <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '0.3s', opacity: 0 }}>
                {results.lastsBeyondSchedule ? (
                  <p className="text-sm text-slate-600">
                    The corpus is not used up within <strong className="text-brand-800">{MAX_YEARS} years</strong> of withdrawals · Corpus left after {MAX_YEARS} years:{' '}
                    <CurrencyAmount value={results.corpusAtEnd} size="sm" />
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    Corpus lasts <strong className="text-brand-800">{results.corpusLastsMonths} months ({formatDuration(results.corpusLastsMonths)})</strong> · Corpus at end:{' '}
                    <CurrencyAmount value={results.corpusAtEnd} size="sm" />
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Withdrawals are taken at the start of each month and the remaining balance earns the SWP return. The final month shows the amount actually left to withdraw.
                </p>
              </div>

              <WealthPieChart invested={results.totalInvested} gain={results.estimatedProfit} />

              <ProjectionTable
                title="SWP Withdrawal Schedule"
                subtitle="Month-by-month withdrawal breakdown"
                rows={results.schedule}
                columns={SWP_COLUMNS}
              />
            </div>
          ) : (
            <CalculatorEmptyState description="Enter investment and withdrawal details to see your SWP projection." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default SwpCalculator
