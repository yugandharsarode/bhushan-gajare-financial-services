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
import InputField from '../../components/calculator/InputField'
import ResultCard from '../../components/calculator/ResultCard'
import SummaryCard from '../../components/calculator/SummaryCard'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
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

const FIELD_LABELS = {
  currentAnnualExpenses: { label: 'Current annual expenses', required: true },
  preRetirementInflation: { label: 'Pre-retirement inflation rate', required: true },
  currentAge: { label: 'Current age', required: true },
  retirementAge: { label: 'Retirement age', required: true },
  lifeExpectancy: { label: 'Life expectancy', required: true },
  preRetirementReturn: { label: 'Pre-retirement return rate', required: true },
  stepUpSipPercent: { label: 'Step-up SIP increase rate', required: true },
  lumpSumSaved: { label: 'Lump sum already saved', optional: true },
  postRetirementReturn: { label: 'Post-retirement return rate', required: true },
  postRetirementInflation: { label: 'Post-retirement inflation rate', required: true },
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
  } = useCalculatorForm(INITIAL_FORM, FIELD_LABELS)

  const [results, setResults] = useState(null)

  const handleCalculate = (e) => {
    e.preventDefault()
    const nextErrors = validate()

    const currentAge = Number(form.currentAge)
    const retirementAge = Number(form.retirementAge)
    const lifeExpectancy = Number(form.lifeExpectancy)

    if (retirementAge <= currentAge) {
      nextErrors.retirementAge = 'Retirement age must be greater than current age'
    }
    if (lifeExpectancy <= retirementAge) {
      nextErrors.lifeExpectancy = 'Life expectancy must be greater than retirement age'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      setResults(null)
      return
    }

    const v = getNumericValues(['lumpSumSaved'])
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
        formPanel={
          <CalculatorFormPanel
            title="Retirement Details"
            description="Enter your current expenses and retirement timeline."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Retirement Plan"
          >
            <InputField id="currentAnnualExpenses" label="Current Annual Expenses" prefix="₹" value={form.currentAnnualExpenses} onChange={updateField('currentAnnualExpenses')} error={errors.currentAnnualExpenses} required min="1" />
            <InputField id="preRetirementInflation" label="Expected Inflation (Pre-Retirement)" suffix="%" value={form.preRetirementInflation} onChange={updateField('preRetirementInflation')} error={errors.preRetirementInflation} required min="0.01" step="0.01" />
            <InputField id="currentAge" label="Current Age" suffix="yrs" value={form.currentAge} onChange={updateField('currentAge')} error={errors.currentAge} required min="1" step="1" />
            <InputField id="retirementAge" label="Retirement Age" suffix="yrs" value={form.retirementAge} onChange={updateField('retirementAge')} error={errors.retirementAge} required min="1" step="1" />
            <InputField id="lifeExpectancy" label="Life Expectancy" suffix="yrs" value={form.lifeExpectancy} onChange={updateField('lifeExpectancy')} error={errors.lifeExpectancy} required min="1" step="1" />
            <InputField id="preRetirementReturn" label="Expected Return (Pre-Retirement)" suffix="%" value={form.preRetirementReturn} onChange={updateField('preRetirementReturn')} error={errors.preRetirementReturn} required min="0.01" step="0.01" />
            <InputField id="stepUpSipPercent" label="Step-Up SIP Increase Rate" suffix="%" value={form.stepUpSipPercent} onChange={updateField('stepUpSipPercent')} error={errors.stepUpSipPercent} required min="0" step="0.01" />
            <InputField id="lumpSumSaved" label="Lump Sum Already Saved" prefix="₹" value={form.lumpSumSaved} onChange={updateField('lumpSumSaved')} error={errors.lumpSumSaved} optional min="0" />
            <InputField id="postRetirementReturn" label="Post-Retirement Return Rate" suffix="%" value={form.postRetirementReturn} onChange={updateField('postRetirementReturn')} error={errors.postRetirementReturn} required min="0.01" step="0.01" />
            <InputField id="postRetirementInflation" label="Post-Retirement Inflation Rate" suffix="%" value={form.postRetirementInflation} onChange={updateField('postRetirementInflation')} error={errors.postRetirementInflation} required min="0.01" step="0.01" />
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Retirement Plan Results</h2>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
                <ResultCard label="Annual Expenses at Retirement" value={results.annualExpensesAtRetirement} icon={HiOutlineCurrencyRupee} accent="brand" delay={0.1} />
                <ResultCard label="Total Retirement Corpus Needed" value={results.totalRetirementCorpusNeeded} icon={HiOutlineBanknotes} accent="amber" delay={0.15} />
                <ResultCard label="Future Value of Current Savings" value={results.futureValueOfCurrentSavings} icon={HiOutlineSun} accent="emerald" delay={0.2} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ResultCard label="Additional Corpus Needed" value={results.additionalCorpusNeeded} icon={HiOutlineArrowTrendingUp} accent="brand" delay={0.25} />
                <SummaryCard label="Monthly SIP Required (Fixed)" value={results.monthlySipRequiredFixed} decimals={0} accent="brand" delay={0.3} />
                <SummaryCard label={`Step-up SIP Starting Amount (${form.stepUpSipPercent}% p.a.)`} value={results.stepUpSipStartingAmount} decimals={0} accent="emerald" delay={0.35} />
                <ResultCard label="Total Corpus Value" value={results.totalRetirementCorpusNeeded} icon={HiOutlineBanknotes} accent="amber" delay={0.4} />
              </div>
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
