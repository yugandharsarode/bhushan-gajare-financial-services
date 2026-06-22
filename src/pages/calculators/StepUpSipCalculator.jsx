import { useState } from 'react'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineCurrencyRupee,
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
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import {
  calculateStepUpSipResults,
  buildStepUpYearlyProjection,
} from '../../utils/financialCalculations'

const meta = calculatorRegistry['step-up-sip']

const INITIAL_FORM = {
  initialMonthlyAmount: '',
  lumpSum: '',
  years: '',
  annualStepUp: '',
  annualReturn: '',
}

const FIELD_LABELS = {
  initialMonthlyAmount: { label: 'Initial monthly SIP amount', required: true },
  years: { label: 'Investment period', required: true },
  annualStepUp: { label: 'Annual step-up percentage', required: true },
  annualReturn: { label: 'Expected annual return', required: true },
  lumpSum: { label: 'Lump sum investment', optional: true },
}

const PROJECTION_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'monthlySip', label: 'Monthly SIP', type: 'currency', decimals: 2 },
  { key: 'annualInvestment', label: 'Annual Investment', type: 'currency' },
  { key: 'cumulativeInvestment', label: 'Cumulative Investment', type: 'currency' },
  { key: 'interestEarned', label: 'Interest Earned', type: 'currency', highlight: true },
  { key: 'portfolioValue', label: 'Portfolio Value', type: 'currency' },
]

function StepUpSipCalculator() {
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
  const [projection, setProjection] = useState([])

  const handleCalculate = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      setResults(null)
      setProjection([])
      return
    }

    const values = getNumericValues(['lumpSum'])
    const computed = calculateStepUpSipResults({
      initialMonthlyAmount: values.initialMonthlyAmount,
      annualReturnPercent: values.annualReturn,
      years: values.years,
      annualStepUpPercent: values.annualStepUp,
      lumpSum: values.lumpSum,
    })

    setResults(computed)
    setProjection(
      buildStepUpYearlyProjection({
        initialMonthlyAmount: values.initialMonthlyAmount,
        annualReturnPercent: values.annualReturn,
        years: values.years,
        annualStepUpPercent: values.annualStepUp,
        lumpSum: values.lumpSum,
      })
    )
    setSubmitted(true)
  }

  const handleReset = () => {
    reset()
    setResults(null)
    setProjection([])
  }

  return (
    <CalculatorLayout
      title={meta.name}
      description={meta.description}
      tagline={meta.tagline}
      icon={meta.icon}
    >
      <CalculatorPageShell
        formPanel={
          <CalculatorFormPanel
            title="Step-Up SIP Details"
            description="Enter your starting SIP and annual increase to project stepped-up wealth growth."
            onSubmit={handleCalculate}
            onReset={handleReset}
          >
            <InputField
              id="initialMonthlyAmount"
              label="Initial Monthly SIP Amount"
              prefix="₹"
              value={form.initialMonthlyAmount}
              onChange={updateField('initialMonthlyAmount')}
              error={errors.initialMonthlyAmount}
              required
              min="1"
            />
            <InputField
              id="lumpSum"
              label="Lump Sum Investment"
              prefix="₹"
              value={form.lumpSum}
              onChange={updateField('lumpSum')}
              error={errors.lumpSum}
              optional
              min="0"
              hint="One-time amount at the start (leave blank if none)"
            />
            <InputField
              id="years"
              label="Investment Period"
              suffix="yrs"
              value={form.years}
              onChange={updateField('years')}
              error={errors.years}
              required
              min="1"
              step="1"
            />
            <InputField
              id="annualStepUp"
              label="Annual Step-Up Percentage"
              suffix="%"
              value={form.annualStepUp}
              onChange={updateField('annualStepUp')}
              error={errors.annualStepUp}
              required
              min="0.01"
              step="0.01"
            />
            <InputField
              id="annualReturn"
              label="Expected Annual Return"
              suffix="%"
              value={form.annualReturn}
              onChange={updateField('annualReturn')}
              error={errors.annualReturn}
              required
              min="0.01"
              step="0.01"
            />
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
                <ResultCard
                  label="Total Amount Invested"
                  value={results.totalInvested}
                  icon={HiOutlineCurrencyRupee}
                  accent="brand"
                  delay={0.1}
                />
                <ResultCard
                  label="Future Value"
                  value={results.totalCorpus}
                  icon={HiOutlineBanknotes}
                  accent="amber"
                  delay={0.15}
                />
                <ResultCard
                  label="Estimated Profit"
                  value={results.estimatedProfit}
                  icon={HiOutlineArrowTrendingUp}
                  accent="emerald"
                  delay={0.2}
                />
                <ResultCard
                  label="Total Corpus Value"
                  value={results.totalCorpus}
                  icon={HiOutlineBanknotes}
                  accent="brand"
                  delay={0.25}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard
                  label="Future Value of Lumpsum (estimated)"
                  value={results.lumpSumFutureValue}
                  accent="emerald"
                  delay={0.3}
                />
                <SummaryCard
                  label="Future Value of SIPs (estimated)"
                  value={results.sipFutureValue}
                  accent="brand"
                  delay={0.35}
                />
              </div>

              <WealthPieChart
                invested={results.totalInvested}
                gain={results.estimatedProfit}
              />

              <ProjectionTable
                rows={projection}
                columns={PROJECTION_COLUMNS}
                subtitle="Year-by-year step-up SIP breakdown"
              />

              <p className="text-xs leading-relaxed text-slate-500">
                * SIP amount increases annually by the step-up percentage. Projections
                assume constant returns. Actual returns may vary. For illustration only.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState
              description="Fill in your step-up SIP details and click Calculate Returns to see projections."
            />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default StepUpSipCalculator
