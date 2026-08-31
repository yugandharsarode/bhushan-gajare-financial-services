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
import InputField from '../../components/calculator/InputField'
import ResultCard from '../../components/calculator/ResultCard'
import SummaryCard from '../../components/calculator/SummaryCard'
import WealthPieChart from '../../components/calculator/WealthPieChart'
import ProjectionTable from '../../components/calculator/ProjectionTable'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { calculateSwpResults } from '../../utils/financialCalculations'

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

const FIELD_LABELS = {
  lumpSum: { label: 'Lump sum investment', optional: true },
  monthlySip: { label: 'Monthly SIP', required: true },
  years: { label: 'Investment duration', required: true },
  accumulationReturn: { label: 'Expected return during investment', required: true },
  monthlyWithdrawal: { label: 'Monthly withdrawal', required: true },
  annualStepUp: { label: 'Annual step-up on withdrawal', required: true },
  swpReturn: { label: 'SWP return rate', required: true },
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
  } = useCalculatorForm(INITIAL_FORM, FIELD_LABELS)

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

    const v = getNumericValues(['lumpSum'])
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
        formPanel={
          <CalculatorFormPanel
            title="SWP Details"
            description="Build a corpus with SIP, then plan systematic withdrawals."
            onSubmit={handleCalculate}
            onReset={handleReset}
          >
            <InputField id="lumpSum" label="Lump Sum Investment" prefix="₹" value={form.lumpSum} onChange={updateField('lumpSum')} error={errors.lumpSum} optional min="0" />
            <InputField id="monthlySip" label="Monthly SIP" prefix="₹" value={form.monthlySip} onChange={updateField('monthlySip')} error={errors.monthlySip} required min="1" />
            <InputField id="years" label="Investment Duration" suffix="yrs" value={form.years} onChange={updateField('years')} error={errors.years} required min="1" step="1" />
            <InputField id="accumulationReturn" label="Expected Return (Investment Phase)" suffix="%" value={form.accumulationReturn} onChange={updateField('accumulationReturn')} error={errors.accumulationReturn} required min="0.01" step="0.01" />
            <InputField id="monthlyWithdrawal" label="Monthly Withdrawal" prefix="₹" value={form.monthlyWithdrawal} onChange={updateField('monthlyWithdrawal')} error={errors.monthlyWithdrawal} required min="1" />
            <InputField id="annualStepUp" label="Annual Step-Up on Withdrawal" suffix="%" value={form.annualStepUp} onChange={updateField('annualStepUp')} error={errors.annualStepUp} required min="0" step="0.01" />
            <InputField id="swpReturn" label="SWP Return Rate" suffix="%" value={form.swpReturn} onChange={updateField('swpReturn')} error={errors.swpReturn} required min="0.01" step="0.01" />
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Results Summary</h2>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
                <ResultCard label="Total Amount Invested" value={results.totalInvested} icon={HiOutlineCurrencyRupee} accent="brand" delay={0.1} />
                <ResultCard label="Corpus for SWP" value={results.corpusForSwp} icon={HiOutlineBanknotes} accent="amber" delay={0.15} />
                <ResultCard label="Estimated Profit" value={results.estimatedProfit} icon={HiOutlineArrowTrendingUp} accent="emerald" delay={0.2} />
                <div className="hero-animate-in rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '0.25s', opacity: 0 }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Corpus Lasts</p>
                  <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{results.corpusLastsMonths} <span className="text-base font-semibold text-slate-500">months</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard label="Future Value of SIPs" value={results.sipFutureValue} accent="brand" delay={0.3} />
                <SummaryCard label="Future Value of Lumpsum" value={results.lumpSumFutureValue} accent="emerald" delay={0.35} />
              </div>

              <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <p className="text-sm text-slate-600">
                  Corpus lasts <strong className="text-brand-800">{results.corpusLastsMonths} months</strong> · Corpus at end:{' '}
                  <CurrencyAmount value={results.corpusAtEnd} size="sm" />
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
