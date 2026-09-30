import { useState } from 'react'
import {
  HiOutlineBanknotes,
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
import { sipSchema, validateSipCross } from '../../config/calculatorSchemas'
import {
  calculateSipResults,
  buildSipYearlyProjection,
} from '../../utils/financialCalculations'

const meta = calculatorRegistry.sip

const INITIAL_FORM = {
  monthlyAmount: '',
  annualReturn: '',
  years: '',
  lumpSum: '',
}

const PROJECTION_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'annualInvestment', label: 'Annual Investment', type: 'currency' },
  { key: 'cumulativeInvestment', label: 'Cumulative Investment', type: 'currency' },
  { key: 'interestEarned', label: 'Interest for the Year', type: 'currency', highlight: true },
  { key: 'portfolioValue', label: 'Portfolio Value', type: 'currency' },
]

function SipCalculator() {
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
  } = useCalculatorForm(INITIAL_FORM, sipSchema, validateSipCross)

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
    const computed = calculateSipResults({
      monthlyAmount: values.monthlyAmount,
      annualReturnPercent: values.annualReturn,
      years: values.years,
      lumpSum: values.lumpSum,
    })

    setResults(computed)
    setProjection(
      buildSipYearlyProjection({
        monthlyAmount: values.monthlyAmount,
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
            title="Investment Details"
            description="Enter your SIP parameters to project wealth growth."
            onSubmit={handleCalculate}
            onReset={handleReset}
          >
            <FormSection columns={4}>
              <InputField
                id="monthlyAmount"
                label="Monthly SIP Amount"
                prefix="₹"
                value={form.monthlyAmount}
                onChange={updateField('monthlyAmount')}
                error={errors.monthlyAmount}
                required
                hint="Enter 0 to calculate a lump sum on its own"
              />
              <InputField
                id="lumpSum"
                label="Lump Sum Investment"
                prefix="₹"
                value={form.lumpSum}
                onChange={updateField('lumpSum')}
                error={errors.lumpSum}
                optional
                hint="One-time amount at the start"
              />
              <InputField
                id="annualReturn"
                label="Expected Annual Return"
                suffix="%"
                value={form.annualReturn}
                onChange={updateField('annualReturn')}
                error={errors.annualReturn}
                required
                step="0.01"
                range={{ min: 0, max: 30, step: 0.1 }}
              />
              <InputField
                id="years"
                label="Investment Period"
                suffix="yrs"
                value={form.years}
                onChange={updateField('years')}
                error={errors.years}
                required
                step="1"
                hint="Whole years"
                range={{ min: 1, max: 40, step: 1 }}
              />
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard
                  label="Future Value of SIPs"
                  value={results.sipFutureValue}
                  accent="brand"
                  delay={0.3}
                />
                <SummaryCard
                  label="Future Value of Lumpsum"
                  value={results.lumpSumFutureValue}
                  accent="emerald"
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
                subtitle="Year-by-year growth breakdown"
              />

              <p className="text-xs leading-relaxed text-slate-500">
                * SIP instalments are invested at the start of each month and the lump sum
                compounds annually at the expected return. Projections assume constant
                returns. Actual returns may vary. This is for illustration only, not
                financial advice.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState
              description="Fill in your SIP details above and click Calculate Returns to see summary cards, charts and a yearly breakdown."
            />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default SipCalculator
