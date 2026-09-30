import { useState } from 'react'
import {
  HiOutlineFlag,
  HiOutlineBanknotes,
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
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { goalPlanningSchema } from '../../config/calculatorSchemas'
import { calculateGoalPlanningResults } from '../../utils/financialCalculations'

const meta = calculatorRegistry['goal-planning']

const INITIAL_FORM = {
  goalDescription: '',
  presentValue: '',
  years: '',
  inflation: '',
  annualReturn: '',
  annualStepUp: '',
  lumpSumToday: '',
}

function GoalPlanningCalculator() {
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
  } = useCalculatorForm(INITIAL_FORM, goalPlanningSchema)

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
      calculateGoalPlanningResults({
        presentValue: v.presentValue,
        years: v.years,
        inflationPercent: v.inflation,
        annualReturnPercent: v.annualReturn,
        annualStepUpPercent: v.annualStepUp,
        lumpSumToday: v.lumpSumToday,
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
            title="Goal Details"
            description="Plan for inflation-adjusted financial goals."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Goal Plan"
          >
            <FormSection title="Your Goal" columns={4}>
              <InputField id="goalDescription" label="Description of Goal" type="text" value={form.goalDescription} onChange={updateField('goalDescription')} optional placeholder="e.g. Home down payment" />
              <InputField id="presentValue" label="Present Value of Goal" prefix="₹" value={form.presentValue} onChange={updateField('presentValue')} error={errors.presentValue} required hint="What it would cost today" />
              <InputField id="years" label="Years from Now" suffix="yrs" value={form.years} onChange={updateField('years')} error={errors.years} step="1" required range={{ min: 1, max: 40, step: 1 }} />
              <InputField id="inflation" label="Inflation Rate" suffix="%" value={form.inflation} onChange={updateField('inflation')} error={errors.inflation} step="0.01" required range={{ min: 0, max: 15, step: 0.1 }} />
            </FormSection>
            <FormSection title="Investment Assumptions" columns={3}>
              <InputField id="annualReturn" label="Assumed Annual Return" suffix="%" value={form.annualReturn} onChange={updateField('annualReturn')} error={errors.annualReturn} step="0.01" required range={{ min: 0, max: 30, step: 0.1 }} />
              <InputField id="annualStepUp" label="Annual Step-Up" suffix="%" value={form.annualStepUp} onChange={updateField('annualStepUp')} error={errors.annualStepUp} step="0.01" required hint="Used for the step-up SIP option" range={{ min: 0, max: 50, step: 0.5 }} />
              <InputField id="lumpSumToday" label="Lump Sum Today" prefix="₹" value={form.lumpSumToday} onChange={updateField('lumpSumToday')} error={errors.lumpSumToday} optional />
            </FormSection>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {form.goalDescription || 'Goal Results'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {results.years} {results.years === 1 ? 'year' : 'years'} · Inflation {results.inflationPercent}%
                  </p>
                </div>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ResultCard label="Inflation-Adjusted Future Value" value={results.inflationAdjustedFutureValue} icon={HiOutlineBanknotes} accent="amber" delay={0.1} />
                <ResultCard label="Lump Sum Contribution (FV)" value={results.lumpSumContributionFv} icon={HiOutlineCurrencyRupee} accent="brand" delay={0.15} />
                <ResultCard label="Corpus from SIP" value={results.corpusFromSip} icon={HiOutlineFlag} accent="emerald" delay={0.2} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard label="Fixed SIP Required" value={results.fixedSipRequired} decimals={2} accent="brand" delay={0.3} />
                <SummaryCard label={`Initial Step-Up SIP (${form.annualStepUp || 0}% annual)`} value={results.initialStepUpSipRequired} decimals={2} accent="emerald" delay={0.35} />
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                * SIPs are invested at the start of each month; the step-up SIP starts lower
                and rises every 12 instalments. The lump sum compounds annually. Projections
                assume constant returns and are for illustration only.
              </p>

              {results.corpusFromSip === 0 && (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                  Your lump sum alone covers this goal — no additional SIP is required.
                </p>
              )}
            </div>
          ) : (
            <CalculatorEmptyState description="Enter your goal details to see inflation-adjusted targets and required SIP amounts." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default GoalPlanningCalculator
