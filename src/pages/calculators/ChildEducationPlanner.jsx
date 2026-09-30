import { useState } from 'react'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import FormSection from '../../components/calculator/FormSection'
import InputField from '../../components/calculator/InputField'
import FieldGroupHeading from '../../components/calculator/FieldGroupHeading'
import SummaryCard from '../../components/calculator/SummaryCard'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import {
  validateChildEducationForm,
  toChildEducationInput,
} from '../../config/calculatorSchemas'
import { calculateChildEducationResults } from '../../utils/financialCalculations'

const meta = calculatorRegistry['child-education']

const EMPTY_CHILD = {
  name: '',
  currentAge: '',
  graduationAge: '',
  graduationPresentCost: '',
  graduationInflationPercent: '',
  postGraduationAge: '',
  postGraduationPresentCost: '',
  postGraduationInflationPercent: '',
}

const INITIAL_FORM = {
  annualReturn: '',
  annualStepUp: '',
  lumpSumToday: '',
  children: [{ ...EMPTY_CHILD }],
}

function ChildEducationPlanner() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const updateGlobal = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    clearError(field)
  }

  const updateChild = (index, field) => (e) => {
    setForm((prev) => {
      const children = [...prev.children]
      children[index] = { ...children[index], [field]: e.target.value }
      return { ...prev, children }
    })
    clearError(`child${index}_${field}`)
  }

  const addChild = () => {
    setForm((prev) => ({
      ...prev,
      children: [...prev.children, { ...EMPTY_CHILD }],
    }))
  }

  const removeChild = (index) => {
    if (form.children.length <= 1) return
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }))
    setErrors({})
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    const nextErrors = validateChildEducationForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      setResults(null)
      return
    }

    setResults(calculateChildEducationResults(toChildEducationInput(form)))
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setSubmitted(false)
    setResults(null)
  }

  const childError = (index, field) => errors[`child${index}_${field}`]

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="Education Planning"
            description="Set your investment assumptions, then add each child's education goals."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Education Plan"
          >
            <FormSection title="Investment Assumptions" columns={3}>
              <InputField id="annualReturn" label="Assumed Annual Return" suffix="%" value={form.annualReturn} onChange={updateGlobal('annualReturn')} error={errors.annualReturn} required step="0.01" range={{ min: 0, max: 30, step: 0.1 }} />
              <InputField id="annualStepUp" label="Annual SIP Step-Up" suffix="%" value={form.annualStepUp} onChange={updateGlobal('annualStepUp')} error={errors.annualStepUp} required step="0.01" range={{ min: 0, max: 50, step: 0.5 }} />
              <InputField id="lumpSumToday" label="Lump Sum Today" prefix="₹" value={form.lumpSumToday} onChange={updateGlobal('lumpSumToday')} error={errors.lumpSumToday} optional hint="Used for the nearest goal first; any surplus moves to the next goal" />
            </FormSection>

            <section className="flex flex-col gap-4">
              <FieldGroupHeading>Children &amp; Goals</FieldGroupHeading>

              {form.children.map((child, index) => (
                <div key={index} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <h3 className="text-base font-semibold text-brand-800">
                        {child.name.trim() || `Child ${index + 1}`}
                      </h3>
                    </div>
                    {form.children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove child ${index + 1}`}
                      >
                        <HiOutlineTrash className="h-4 w-4" aria-hidden="true" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-7">
                    <div className="grid items-start gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <InputField id={`name-${index}`} label="Child's Name" type="text" value={child.name} onChange={updateChild(index, 'name')} optional placeholder="e.g. Aarav" />
                      </div>
                      <InputField id={`age-${index}`} label="Child's Current Age" suffix="yrs" value={child.currentAge} onChange={updateChild(index, 'currentAge')} error={childError(index, 'currentAge')} required step="1" range={{ min: 0, max: 25, step: 1 }} />
                    </div>

                    <FormSection title="Graduation" columns={3}>
                      <InputField id={`gradAge-${index}`} label="Age at Graduation" suffix="yrs" value={child.graduationAge} onChange={updateChild(index, 'graduationAge')} error={childError(index, 'graduationAge')} required step="1" range={{ min: 1, max: 40, step: 1 }} />
                      <InputField id={`gradCost-${index}`} label="Cost Today" prefix="₹" value={child.graduationPresentCost} onChange={updateChild(index, 'graduationPresentCost')} error={childError(index, 'graduationPresentCost')} required />
                      <InputField id={`gradInfl-${index}`} label="Education Inflation" suffix="%" value={child.graduationInflationPercent} onChange={updateChild(index, 'graduationInflationPercent')} error={childError(index, 'graduationInflationPercent')} required step="0.01" range={{ min: 0, max: 20, step: 0.1 }} />
                    </FormSection>

                    <FormSection title="Post Graduation" note="(optional: leave blank to skip)" columns={3}>
                      <InputField id={`pgAge-${index}`} label="Age at Post Graduation" suffix="yrs" value={child.postGraduationAge} onChange={updateChild(index, 'postGraduationAge')} error={childError(index, 'postGraduationAge')} step="1" range={{ min: 1, max: 40, step: 1 }} />
                      <InputField id={`pgCost-${index}`} label="Cost Today" prefix="₹" value={child.postGraduationPresentCost} onChange={updateChild(index, 'postGraduationPresentCost')} error={childError(index, 'postGraduationPresentCost')} />
                      <InputField id={`pgInfl-${index}`} label="Education Inflation" suffix="%" value={child.postGraduationInflationPercent} onChange={updateChild(index, 'postGraduationInflationPercent')} error={childError(index, 'postGraduationInflationPercent')} step="0.01" range={{ min: 0, max: 20, step: 0.1 }} />
                    </FormSection>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addChild}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-white px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:border-brand-500 hover:bg-brand-50"
              >
                <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Another Child
              </button>
            </section>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Education Plan Results</h2>
                <DownloadReportButton />
              </div>

              <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ opacity: 0 }}>
                <h3 className="text-base font-semibold text-slate-900">Plan Totals (All Goals)</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <SummaryCard label="Total Target Corpus" value={results.totals.futureValue} accent="brand" />
                  <SummaryCard label="Total Fixed SIP / Month" value={results.totals.fixedSipRequired} accent="amber" />
                  <SummaryCard label={`Total Initial Step-Up SIP (${form.annualStepUp}% p.a.)`} value={results.totals.initialStepUpSipRequired} accent="emerald" />
                </div>
                {results.unallocatedLumpSum > 0.5 && (
                  <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                    Your lump sum covers every goal. <CurrencyAmount value={results.unallocatedLumpSum} size="sm" /> of it is not needed for these goals.
                  </p>
                )}
              </div>

              {results.childResults.map((child, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <GoalBlock title={`Graduation (${child.name})`} goal={child.graduation} stepUp={form.annualStepUp} />
                  {child.postGraduation && (
                    <GoalBlock title={`Post Graduation (${child.name})`} goal={child.postGraduation} stepUp={form.annualStepUp} />
                  )}
                </div>
              ))}

              <p className="text-xs leading-relaxed text-slate-500">
                * SIPs are invested at the start of each month; the step-up SIP starts lower and
                rises every 12 instalments. The lump sum compounds annually and is applied to the
                nearest goal first. Projections assume constant returns and are for illustration only.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState description="Add your child's education goals to see required SIP amounts." />
          )
        }
      />
    </CalculatorLayout>
  )
}

function GoalBlock({ title, goal, stepUp }) {
  const details = [
    ['Cost Today', <CurrencyAmount key="c" value={goal.presentCost} size="sm" />],
    ['Education Inflation', `${goal.inflationPercent}%`],
    ['Years to Goal', `${goal.yearsToGoal} ${goal.yearsToGoal === 1 ? 'year' : 'years'}`],
    ['Future Value (Target Corpus)', <CurrencyAmount key="f" value={goal.futureValue} size="sm" />],
  ]
  if (goal.lumpSumAllocated > 0) {
    details.push(['Lump Sum Used From Today', <CurrencyAmount key="l" value={goal.lumpSumAllocated} size="sm" />])
  }

  return (
    <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ opacity: 0 }}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-5">
        <dl className="grid content-start gap-3 text-sm sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3">
          <SummaryCard label="Lumpsum Contribution (FV)" value={goal.lumpSumContributionFv} accent="brand" />
          <SummaryCard label="Corpus via SIP" value={goal.corpusViaSip} accent="emerald" />
          <SummaryCard label="Fixed SIP Required" value={goal.fixedSipRequired} decimals={0} accent="amber" />
          <SummaryCard label={`Initial Step-Up SIP (${stepUp}% p.a.)`} value={goal.initialStepUpSipRequired} decimals={0} accent="brand" />
        </div>
      </div>
    </div>
  )
}

export default ChildEducationPlanner
