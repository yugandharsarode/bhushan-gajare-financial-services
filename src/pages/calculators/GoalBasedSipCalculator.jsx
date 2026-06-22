import { useState } from 'react'
import {
  HiOutlineFlag,
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
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
  calculateGoalBasedSipResults,
  buildGoalBasedYearlyProjection,
} from '../../utils/financialCalculations'

const meta = calculatorRegistry['goal-based-sip']

const INITIAL_FORM = {
  targetAmount: '',
  lumpSum: '',
  years: '',
  annualReturn: '',
}

const FIELD_LABELS = {
  targetAmount: { label: 'Target goal amount', required: true },
  years: { label: 'Investment period', required: true },
  annualReturn: { label: 'Expected annual return', required: true },
  lumpSum: { label: 'Initial lump sum investment', optional: true },
}

const PROJECTION_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'annualInvestment', label: 'Annual Investment', type: 'currency', decimals: 2 },
  { key: 'cumulativeInvestment', label: 'Cumulative Investment', type: 'currency', decimals: 2 },
  { key: 'interestEarned', label: 'Interest Earned', type: 'currency', decimals: 2, highlight: true },
  { key: 'portfolioValue', label: 'Portfolio Value', type: 'currency', decimals: 2 },
]

function GoalBasedSipCalculator() {
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
    const computed = calculateGoalBasedSipResults({
      targetAmount: values.targetAmount,
      annualReturnPercent: values.annualReturn,
      years: values.years,
      lumpSum: values.lumpSum,
    })

    setResults(computed)
    setProjection(
      buildGoalBasedYearlyProjection({
        targetAmount: values.targetAmount,
        annualReturnPercent: values.annualReturn,
        years: values.years,
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
            title="Goal Details"
            description="Enter your target amount and investment horizon to find the required monthly SIP."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Required SIP"
          >
            <InputField
              id="targetAmount"
              label="Target Goal Amount"
              prefix="₹"
              value={form.targetAmount}
              onChange={updateField('targetAmount')}
              error={errors.targetAmount}
              required
              min="1"
            />
            <InputField
              id="lumpSum"
              label="Initial Lump Sum Investment"
              prefix="₹"
              value={form.lumpSum}
              onChange={updateField('lumpSum')}
              error={errors.lumpSum}
              optional
              min="0"
              hint="Optional one-time investment at the start"
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
                  label="Required Monthly SIP"
                  value={results.requiredMonthlySip}
                  icon={HiOutlineCurrencyRupee}
                  accent="brand"
                  delay={0.1}
                  decimals={2}
                />
                <ResultCard
                  label="Future Value"
                  value={results.totalCorpus}
                  icon={HiOutlineBanknotes}
                  accent="amber"
                  delay={0.15}
                />
                <ResultCard
                  label="Wealth Gain"
                  value={results.wealthGain}
                  icon={HiOutlineArrowTrendingUp}
                  accent="emerald"
                  delay={0.2}
                />
                <ResultCard
                  label="Total Corpus Achieved"
                  value={results.totalCorpus}
                  icon={HiOutlineFlag}
                  accent="brand"
                  delay={0.25}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryCard
                  label="Required Monthly SIP"
                  value={results.requiredMonthlySip}
                  decimals={2}
                  accent="brand"
                  delay={0.3}
                />
                <SummaryCard
                  label="Future Value of Lumpsum"
                  value={results.lumpSumFutureValue}
                  accent="emerald"
                  delay={0.35}
                />
                <SummaryCard
                  label="Projected Future Value from SIPs"
                  value={results.sipFutureValue}
                  accent="amber"
                  delay={0.4}
                />
              </div>

              <WealthPieChart
                invested={results.totalInvested}
                gain={results.wealthGain}
                title="Goal Composition"
                subtitle="Investment vs projected gains"
              />

              <ProjectionTable
                rows={projection}
                columns={PROJECTION_COLUMNS}
                subtitle="Year-by-year projection at required SIP"
              />

              <p className="text-xs leading-relaxed text-slate-500">
                * Required SIP is computed to reach your goal assuming constant returns.
                Actual market returns may vary. For illustration only, not financial advice.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState
              description="Enter your goal amount and click Calculate Required SIP to see how much you need to invest monthly."
            />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default GoalBasedSipCalculator
