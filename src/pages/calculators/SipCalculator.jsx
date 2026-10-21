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
import SipSwpJourneyResults from '../../components/calculator/SipSwpJourneyResults'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import {
  sipSchema,
  validateSipCross,
  sipSwpJourneySchema,
  validateSipSwpJourneyCross,
} from '../../config/calculatorSchemas'
import {
  calculateSipResults,
  buildSipYearlyProjection,
} from '../../utils/financialCalculations'
import {
  calculateSipSwpJourney,
  buildJourneyYearlyRows,
} from '../../utils/sipSwpJourneyCalculations'
import { isBlank } from '../../utils/calculatorValidation'

const meta = calculatorRegistry.sip

const INITIAL_FORM = {
  monthlyAmount: '',
  annualReturn: '',
  years: '',
  lumpSum: '',
  // SIP to SWP Journey Planner only (Build uses the SIP fields above)
  growReturn: '',
  growYears: '5',
  monthlyWithdrawal: '',
  withdrawReturn: '',
  withdrawYears: '25',
}

/** Build duration filled in when the journey planner is opened with no period entered */
const DEFAULT_BUILD_YEARS = '10'

const MODES = [
  { id: 'sip', label: 'SIP Returns' },
  { id: 'journey', label: 'SIP → SWP Journey' },
]

const PROJECTION_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'annualInvestment', label: 'Annual Investment', type: 'currency' },
  { key: 'cumulativeInvestment', label: 'Cumulative Investment', type: 'currency' },
  { key: 'interestEarned', label: 'Interest for the Year', type: 'currency', highlight: true },
  { key: 'portfolioValue', label: 'Portfolio Value', type: 'currency' },
]

/** Switch between the standard SIP calculator and the optional journey planner */
function ModeToggle({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-brand-100 bg-white p-1 shadow-sm" role="group" aria-label="Calculator mode">
      {MODES.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={mode === option.id}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === option.id ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700 hover:bg-brand-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Inputs for the three journey stages; Build reuses the SIP fields */
function JourneyFields({ form, errors, updateField }) {
  return (
    <>
      <FormSection title="Stage 1 · Build" note="Invest every month" columns={4}>
        <InputField
          id="monthlyAmount"
          label="Monthly SIP Amount"
          prefix="₹"
          value={form.monthlyAmount}
          onChange={updateField('monthlyAmount')}
          error={errors.monthlyAmount}
          required
          hint="Enter 0 to plan with a lump sum only"
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
          label="Build Duration"
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-5 xl:gap-6">
        <div className="min-w-0 xl:col-span-2">
          <FormSection title="Stage 2 · Grow" note="No new investment" columns={2}>
            <InputField
              id="growReturn"
              label="Expected Annual Return"
              suffix="%"
              value={form.growReturn}
              onChange={updateField('growReturn')}
              error={errors.growReturn}
              required
              step="0.01"
              hint="While the corpus grows untouched"
              range={{ min: 0, max: 30, step: 0.1 }}
            />
            <InputField
              id="growYears"
              label="Grow Duration"
              suffix="yrs"
              value={form.growYears}
              onChange={updateField('growYears')}
              error={errors.growYears}
              required
              step="1"
              hint="Enter 0 to start withdrawals right after Build"
              range={{ min: 0, max: 30, step: 1 }}
            />
          </FormSection>
        </div>
        <div className="min-w-0 xl:col-span-3">
          <FormSection title="Stage 3 · Withdraw" note="Monthly income from your corpus" columns={3}>
            <InputField
              id="monthlyWithdrawal"
              label="Monthly Withdrawal"
              prefix="₹"
              value={form.monthlyWithdrawal}
              onChange={updateField('monthlyWithdrawal')}
              error={errors.monthlyWithdrawal}
              required
              hint="Taken at the start of each month"
            />
            <InputField
              id="withdrawReturn"
              label="Expected Annual Return"
              suffix="%"
              value={form.withdrawReturn}
              onChange={updateField('withdrawReturn')}
              error={errors.withdrawReturn}
              required
              step="0.01"
              hint="Earned on the corpus still invested"
              range={{ min: 0, max: 30, step: 0.1 }}
            />
            <InputField
              id="withdrawYears"
              label="Withdrawal Duration"
              suffix="yrs"
              value={form.withdrawYears}
              onChange={updateField('withdrawYears')}
              error={errors.withdrawYears}
              required
              step="1"
              hint="Whole years, up to 50"
              range={{ min: 1, max: 50, step: 1 }}
            />
          </FormSection>
        </div>
      </div>
    </>
  )
}

function SipCalculator() {
  const [mode, setMode] = useState('sip')
  const isJourney = mode === 'journey'

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
  } = useCalculatorForm(
    INITIAL_FORM,
    isJourney ? sipSwpJourneySchema : sipSchema,
    isJourney ? validateSipSwpJourneyCross : validateSipCross
  )

  const [results, setResults] = useState(null)
  const [projection, setProjection] = useState([])
  const [journey, setJourney] = useState(null)

  const clearResults = () => {
    setSubmitted(false)
    setResults(null)
    setProjection([])
    setJourney(null)
  }

  const fillDefaultBuildYears = () => updateField('years')({ target: { value: DEFAULT_BUILD_YEARS } })

  const switchMode = (next) => {
    if (next === mode) return
    setMode(next)
    setErrors({})
    clearResults()
    if (next === 'journey' && isBlank(form.years)) fillDefaultBuildYears()
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      clearResults()
      return
    }

    const values = getNumericValues()

    if (isJourney) {
      const inputs = {
        monthlySip: values.monthlyAmount,
        lumpSum: values.lumpSum,
        buildReturnPercent: values.annualReturn,
        buildYears: values.years,
        growReturnPercent: values.growReturn,
        growYears: values.growYears,
        monthlyWithdrawal: values.monthlyWithdrawal,
        withdrawReturnPercent: values.withdrawReturn,
        withdrawYears: values.withdrawYears,
      }
      const result = calculateSipSwpJourney(inputs)
      setJourney({ inputs, result, rows: buildJourneyYearlyRows(inputs, result) })
      setSubmitted(true)
      return
    }

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
    clearResults()
    if (isJourney) fillDefaultBuildYears()
  }

  return (
    <CalculatorLayout
      title={meta.name}
      description={meta.description}
      tagline={meta.tagline}
      icon={meta.icon}
    >
      <CalculatorPageShell
        resultsKey={isJourney ? journey : results}
        formPanel={
          <CalculatorFormPanel
            title={isJourney ? 'Journey Details' : 'Investment Details'}
            description={
              isJourney
                ? 'Build a corpus with a SIP, let it grow, then plan monthly withdrawals.'
                : 'Enter your SIP parameters to project wealth growth.'
            }
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel={isJourney ? 'Plan My Journey' : undefined}
            headerAside={<ModeToggle mode={mode} onChange={switchMode} />}
          >
            {isJourney ? (
              <JourneyFields form={form} errors={errors} updateField={updateField} />
            ) : (
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
            )}
          </CalculatorFormPanel>
        }
        resultsPanel={
          isJourney ? (
            submitted && journey ? (
              <SipSwpJourneyResults {...journey} />
            ) : (
              <CalculatorEmptyState
                title="Your journey plan will appear here"
                description="Fill in the three stages above and click Plan My Journey to see your estimated corpus at each stage and whether it lasts through your withdrawals."
              />
            )
          ) : submitted && results ? (
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
