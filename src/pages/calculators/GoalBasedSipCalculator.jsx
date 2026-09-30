import { useState } from 'react'
import {
  HiOutlineFlag,
  HiOutlineArrowTrendingUp,
  HiOutlineCurrencyRupee,
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
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { goalBasedSipSchema } from '../../config/calculatorSchemas'
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

const PROJECTION_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'annualInvestment', label: 'Annual Investment', type: 'currency' },
  { key: 'cumulativeInvestment', label: 'Cumulative Investment', type: 'currency' },
  { key: 'interestEarned', label: 'Interest for the Year', type: 'currency', highlight: true },
  { key: 'portfolioValue', label: 'Portfolio Value', type: 'currency' },
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
  } = useCalculatorForm(INITIAL_FORM, goalBasedSipSchema)

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

    const values = getNumericValues()
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
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="Goal Details"
            description="Enter your target amount and investment horizon to find the required monthly SIP."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Required SIP"
          >
            <FormSection columns={4}>
              <InputField id="targetAmount" label="Target Goal Amount" prefix="₹" value={form.targetAmount} onChange={updateField('targetAmount')} error={errors.targetAmount} required />
              <InputField id="lumpSum" label="Initial Lump Sum Investment" prefix="₹" value={form.lumpSum} onChange={updateField('lumpSum')} error={errors.lumpSum} optional hint="One-time investment at the start" />
              <InputField id="years" label="Investment Period" suffix="yrs" value={form.years} onChange={updateField('years')} error={errors.years} step="1" required hint="Whole years" range={{ min: 1, max: 40, step: 1 }} />
              <InputField id="annualReturn" label="Expected Annual Return" suffix="%" value={form.annualReturn} onChange={updateField('annualReturn')} error={errors.annualReturn} step="0.01" required range={{ min: 0, max: 30, step: 0.1 }} />
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

              {results.lumpSumCoversGoal && (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                  Your lump sum alone is projected to reach this goal, so no monthly SIP is
                  required.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ResultCard
                  label="Required Monthly SIP"
                  value={results.requiredMonthlySip}
                  icon={HiOutlineCurrencyRupee}
                  accent="brand"
                  delay={0.1}
                  decimals={2}
                />
                <ResultCard
                  label="Total Corpus Achieved"
                  value={results.totalCorpus}
                  icon={HiOutlineFlag}
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="Total Amount Invested"
                  value={results.totalInvested}
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
                * Required SIP assumes instalments at the start of each month and a lump sum
                compounding annually, at constant returns. Actual market returns may vary.
                For illustration only, not financial advice.
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
