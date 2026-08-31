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
import InputField from '../../components/calculator/InputField'
import ResultCard from '../../components/calculator/ResultCard'
import SummaryCard from '../../components/calculator/SummaryCard'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
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

const FIELD_LABELS = {
  presentValue: { label: 'Present value of goal', required: true },
  years: { label: 'Years from now', required: true },
  inflation: { label: 'Inflation rate', required: true },
  annualReturn: { label: 'Assumed annual return', required: true },
  annualStepUp: { label: 'Annual step-up percentage', required: true },
  lumpSumToday: { label: 'Lump sum today', optional: true },
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

    const v = getNumericValues(['lumpSumToday'])
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
        formPanel={
          <CalculatorFormPanel
            title="Goal Details"
            description="Plan for inflation-adjusted financial goals."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Goal Plan"
          >
            <InputField id="goalDescription" label="Description of Goal" type="text" value={form.goalDescription} onChange={updateField('goalDescription')} optional />
            <InputField id="presentValue" label="Present Value of Goal" prefix="₹" value={form.presentValue} onChange={updateField('presentValue')} error={errors.presentValue} required min="1" />
            <InputField id="years" label="Years from Now" suffix="yrs" value={form.years} onChange={updateField('years')} error={errors.years} required min="1" step="1" />
            <InputField id="inflation" label="Inflation Rate" suffix="%" value={form.inflation} onChange={updateField('inflation')} error={errors.inflation} required min="0.01" step="0.01" />
            <InputField id="annualReturn" label="Assumed Annual Return" suffix="%" value={form.annualReturn} onChange={updateField('annualReturn')} error={errors.annualReturn} required min="0.01" step="0.01" />
            <InputField id="annualStepUp" label="Annual Step-Up" suffix="%" value={form.annualStepUp} onChange={updateField('annualStepUp')} error={errors.annualStepUp} required min="0" step="0.01" />
            <InputField id="lumpSumToday" label="Lump Sum Today" prefix="₹" value={form.lumpSumToday} onChange={updateField('lumpSumToday')} error={errors.lumpSumToday} optional min="0" />
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {form.goalDescription || 'Goal Results'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {results.years} years · Inflation {results.inflationPercent}%
                  </p>
                </div>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
                <ResultCard label="Inflation-Adjusted Future Value" value={results.inflationAdjustedFutureValue} icon={HiOutlineBanknotes} accent="amber" delay={0.1} />
                <ResultCard label="Lump Sum Contribution (FV)" value={results.lumpSumContributionFv} icon={HiOutlineCurrencyRupee} accent="brand" delay={0.15} />
                <ResultCard label="Corpus from SIP" value={results.corpusFromSip} icon={HiOutlineFlag} accent="emerald" delay={0.2} />
                <ResultCard label="Total Corpus Value" value={results.totalCorpus} icon={HiOutlineBanknotes} accent="brand" delay={0.25} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard label="Fixed SIP Required" value={results.fixedSipRequired} decimals={2} accent="brand" delay={0.3} />
                <SummaryCard label={`Initial Step-Up SIP (${form.annualStepUp || 0}% annual)`} value={results.initialStepUpSipRequired} decimals={2} accent="emerald" delay={0.35} />
              </div>

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
