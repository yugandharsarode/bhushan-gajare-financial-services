import { useState } from 'react'
import {
  HiOutlineSun,
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
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { retirementSchema, validateRetirementCross } from '../../config/calculatorSchemas'
import { calculateRetirementResults } from '../../utils/financialCalculations'

const meta = calculatorRegistry.retirement

const INITIAL_FORM = {
  currentAnnualExpenses: '',
  preRetirementInflation: '',
  currentAge: '',
  retirementAge: '',
  lifeExpectancy: '',
  preRetirementReturn: '',
  stepUpSipPercent: '',
  lumpSumSaved: '',
  postRetirementReturn: '',
  postRetirementInflation: '',
}

function RetirementPlanningCalculator() {
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
  } = useCalculatorForm(INITIAL_FORM, retirementSchema, validateRetirementCross)

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
      calculateRetirementResults({
        currentAnnualExpenses: v.currentAnnualExpenses,
        preRetirementInflationPercent: v.preRetirementInflation,
        currentAge: v.currentAge,
        retirementAge: v.retirementAge,
        lifeExpectancy: v.lifeExpectancy,
        preRetirementReturnPercent: v.preRetirementReturn,
        stepUpSipPercent: v.stepUpSipPercent,
        lumpSumSaved: v.lumpSumSaved,
        postRetirementReturnPercent: v.postRetirementReturn,
        postRetirementInflationPercent: v.postRetirementInflation,
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
            title="Retirement Details"
            description="Enter your current expenses and retirement timeline."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Retirement Plan"
          >
            <FormSection title="Today" columns={4}>
              <InputField id="currentAnnualExpenses" label="Current Annual Expenses" prefix="₹" value={form.currentAnnualExpenses} onChange={updateField('currentAnnualExpenses')} error={errors.currentAnnualExpenses} required />
              <InputField id="currentAge" label="Current Age" suffix="yrs" value={form.currentAge} onChange={updateField('currentAge')} error={errors.currentAge} step="1" required range={{ min: 18, max: 70, step: 1 }} />
              <InputField id="retirementAge" label="Retirement Age" suffix="yrs" value={form.retirementAge} onChange={updateField('retirementAge')} error={errors.retirementAge} step="1" required range={{ min: 30, max: 80, step: 1 }} />
              <InputField id="lifeExpectancy" label="Life Expectancy" suffix="yrs" value={form.lifeExpectancy} onChange={updateField('lifeExpectancy')} error={errors.lifeExpectancy} step="1" required hint="Expenses planned until the year before this age" range={{ min: 50, max: 110, step: 1 }} />
            </FormSection>
            <FormSection title="Before Retirement" columns={4}>
              <InputField id="preRetirementInflation" label="Expected Inflation" suffix="%" value={form.preRetirementInflation} onChange={updateField('preRetirementInflation')} error={errors.preRetirementInflation} step="0.01" required range={{ min: 0, max: 15, step: 0.1 }} />
              <InputField id="preRetirementReturn" label="Expected Return" suffix="%" value={form.preRetirementReturn} onChange={updateField('preRetirementReturn')} error={errors.preRetirementReturn} step="0.01" required range={{ min: 0, max: 30, step: 0.1 }} />
              <InputField id="stepUpSipPercent" label="Step-Up SIP Increase" suffix="%" value={form.stepUpSipPercent} onChange={updateField('stepUpSipPercent')} error={errors.stepUpSipPercent} step="0.01" required range={{ min: 0, max: 50, step: 0.5 }} />
              <InputField id="lumpSumSaved" label="Lump Sum Already Saved" prefix="₹" value={form.lumpSumSaved} onChange={updateField('lumpSumSaved')} error={errors.lumpSumSaved} optional />
            </FormSection>
            <FormSection title="After Retirement" columns={4}>
              <InputField id="postRetirementReturn" label="Return on Corpus" suffix="%" value={form.postRetirementReturn} onChange={updateField('postRetirementReturn')} error={errors.postRetirementReturn} step="0.01" required range={{ min: 0, max: 20, step: 0.1 }} />
              <InputField id="postRetirementInflation" label="Inflation" suffix="%" value={form.postRetirementInflation} onChange={updateField('postRetirementInflation')} error={errors.postRetirementInflation} step="0.01" required range={{ min: 0, max: 15, step: 0.1 }} />
            </FormSection>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Retirement Plan Results</h2>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ResultCard label="Annual Expenses at Retirement" value={results.annualExpensesAtRetirement} icon={HiOutlineCurrencyRupee} accent="brand" delay={0.1} />
                <ResultCard label="Total Retirement Corpus Needed" value={results.totalRetirementCorpusNeeded} icon={HiOutlineBanknotes} accent="amber" delay={0.15} />
                <ResultCard label="Future Value of Current Savings" value={results.futureValueOfCurrentSavings} icon={HiOutlineSun} accent="emerald" delay={0.2} />
              </div>

              {results.surplusAtRetirement > 0 && (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                  Your current savings are projected to exceed the corpus needed by{' '}
                  <CurrencyAmount value={results.surplusAtRetirement} size="sm" /> at retirement, so no SIP is required.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ResultCard label="Additional Corpus Needed" value={results.additionalCorpusNeeded} icon={HiOutlineArrowTrendingUp} accent="brand" delay={0.25} />
                <ResultCard label="Monthly SIP Required (Fixed)" value={results.monthlySipRequiredFixed} icon={HiOutlineCurrencyRupee} accent="amber" delay={0.3} />
                <ResultCard label={`Step-Up SIP Starting Amount (${form.stepUpSipPercent}% p.a.)`} value={results.stepUpSipStartingAmount} icon={HiOutlineSun} accent="emerald" delay={0.35} />
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                * The corpus funds {results.retirementYears} years of expenses, each drawn at the
                start of the year and growing with post-retirement inflation. SIPs are invested at
                the start of each month; the step-up SIP rises every 12 instalments. Projections
                assume constant returns and are for illustration only.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState description="Enter your retirement details to see corpus requirements and required SIP amounts." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default RetirementPlanningCalculator
