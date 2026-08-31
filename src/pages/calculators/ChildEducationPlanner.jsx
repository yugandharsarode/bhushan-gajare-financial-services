import { useState } from 'react'
import { HiOutlineAcademicCap, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import InputField from '../../components/calculator/InputField'
import SummaryCard from '../../components/calculator/SummaryCard'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import {
  validateRequiredPositive,
  validateOptionalNonNegative,
} from '../../utils/calculatorValidation'
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

  const updateGlobal = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const updateChild = (index, field) => (e) => {
    setForm((prev) => {
      const children = [...prev.children]
      children[index] = { ...children[index], [field]: e.target.value }
      return { ...prev, children }
    })
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
  }

  const validate = () => {
    const nextErrors = validateRequiredPositive({
      annualReturn: { value: form.annualReturn, label: 'Assumed annual return' },
      annualStepUp: { value: form.annualStepUp, label: 'Annual step-up percentage' },
    })
    const lumpErr = validateOptionalNonNegative(form.lumpSumToday, 'Lump sum today')
    if (lumpErr) nextErrors.lumpSumToday = lumpErr

    form.children.forEach((child, i) => {
      const prefix = `child${i}`
      Object.assign(
        nextErrors,
        validateRequiredPositive({
          [`${prefix}_currentAge`]: { value: child.currentAge, label: "Child's current age" },
          [`${prefix}_graduationAge`]: { value: child.graduationAge, label: 'Graduation age' },
          [`${prefix}_graduationPresentCost`]: { value: child.graduationPresentCost, label: 'Graduation present cost' },
          [`${prefix}_graduationInflationPercent`]: { value: child.graduationInflationPercent, label: 'Graduation inflation' },
          [`${prefix}_postGraduationAge`]: { value: child.postGraduationAge, label: 'Post graduation age' },
          [`${prefix}_postGraduationPresentCost`]: { value: child.postGraduationPresentCost, label: 'Post graduation present cost' },
          [`${prefix}_postGraduationInflationPercent`]: { value: child.postGraduationInflationPercent, label: 'Post graduation inflation' },
        })
      )
    })

    return nextErrors
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      setResults(null)
      return
    }

    const computed = calculateChildEducationResults({
      annualReturnPercent: Number(form.annualReturn),
      annualStepUpPercent: Number(form.annualStepUp),
      lumpSumToday: form.lumpSumToday === '' ? 0 : Number(form.lumpSumToday),
      children: form.children.map((c) => ({
        name: c.name || 'Child',
        currentAge: Number(c.currentAge),
        graduationAge: Number(c.graduationAge),
        graduationPresentCost: Number(c.graduationPresentCost),
        graduationInflationPercent: Number(c.graduationInflationPercent),
        postGraduationAge: Number(c.postGraduationAge),
        postGraduationPresentCost: Number(c.postGraduationPresentCost),
        postGraduationInflationPercent: Number(c.postGraduationInflationPercent),
      })),
    })

    setResults(computed)
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setSubmitted(false)
    setResults(null)
  }

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        formPanel={
          <CalculatorFormPanel
            title="Education Planning"
            description="Add children and their graduation goals."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Education Plan"
          >
            <InputField id="annualReturn" label="Assumed Annual Return" suffix="%" value={form.annualReturn} onChange={updateGlobal('annualReturn')} error={errors.annualReturn} required min="0.01" step="0.01" />
            <InputField id="annualStepUp" label="Preferred Annual SIP Step-Up" suffix="%" value={form.annualStepUp} onChange={updateGlobal('annualStepUp')} error={errors.annualStepUp} required min="0" step="0.01" />
            <InputField id="lumpSumToday" label="Lump Sum Today" prefix="₹" value={form.lumpSumToday} onChange={updateGlobal('lumpSumToday')} error={errors.lumpSumToday} optional min="0" />

            {form.children.map((child, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Child {index + 1}</h3>
                  {form.children.length > 1 && (
                    <button type="button" onClick={() => removeChild(index)} className="text-slate-400 hover:text-red-600" aria-label="Remove child">
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <InputField id={`name-${index}`} label="Child's Name" type="text" value={child.name} onChange={updateChild(index, 'name')} optional />
                  <InputField id={`age-${index}`} label="Child's Current Age" suffix="yrs" value={child.currentAge} onChange={updateChild(index, 'currentAge')} error={errors[`child${index}_currentAge`]} required min="1" step="1" />

                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Graduation Plan</p>
                  <InputField id={`gradAge-${index}`} label="Age at Graduation" suffix="yrs" value={child.graduationAge} onChange={updateChild(index, 'graduationAge')} error={errors[`child${index}_graduationAge`]} required min="1" />
                  <InputField id={`gradCost-${index}`} label="Graduation Present Cost" prefix="₹" value={child.graduationPresentCost} onChange={updateChild(index, 'graduationPresentCost')} error={errors[`child${index}_graduationPresentCost`]} required min="1" />
                  <InputField id={`gradInfl-${index}`} label="Graduation Inflation" suffix="%" value={child.graduationInflationPercent} onChange={updateChild(index, 'graduationInflationPercent')} error={errors[`child${index}_graduationInflationPercent`]} required min="0.01" step="0.01" />

                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Post Graduation Plan</p>
                  <InputField id={`pgAge-${index}`} label="Age at Post Graduation" suffix="yrs" value={child.postGraduationAge} onChange={updateChild(index, 'postGraduationAge')} error={errors[`child${index}_postGraduationAge`]} required min="1" />
                  <InputField id={`pgCost-${index}`} label="Post Graduation Present Cost" prefix="₹" value={child.postGraduationPresentCost} onChange={updateChild(index, 'postGraduationPresentCost')} error={errors[`child${index}_postGraduationPresentCost`]} required min="1" />
                  <InputField id={`pgInfl-${index}`} label="Post Graduation Inflation" suffix="%" value={child.postGraduationInflationPercent} onChange={updateChild(index, 'postGraduationInflationPercent')} error={errors[`child${index}_postGraduationInflationPercent`]} required min="0.01" step="0.01" />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addChild}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              <HiOutlinePlus className="h-4 w-4" /> Add Child
            </button>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Education Plan Results</h2>
                <DownloadReportButton />
              </div>

              {results.childResults.map((child, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <GoalBlock title={`Graduation (${child.name})`} goal={child.graduation} stepUp={form.annualStepUp} />
                  <GoalBlock title={`Post Graduation (${child.name})`} goal={child.postGraduation} stepUp={form.annualStepUp} />
                </div>
              ))}
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
  return (
    <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ opacity: 0 }}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Original Present Value</dt><dd className="font-medium"><CurrencyAmount value={goal.presentCost} size="sm" /></dd></div>
        <div><dt className="text-slate-500">Inflation Applied</dt><dd className="font-medium">{goal.inflationPercent}%</dd></div>
        <div><dt className="text-slate-500">Years to Goal</dt><dd className="font-medium">{goal.yearsToGoal} years</dd></div>
        <div><dt className="text-slate-500">Future Value (Target Corpus)</dt><dd className="font-medium"><CurrencyAmount value={goal.futureValue} size="sm" /></dd></div>
      </dl>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Lumpsum Contribution (FV)" value={goal.lumpSumContributionFv} accent="brand" />
        <SummaryCard label="Corpus via SIP" value={goal.corpusViaSip} accent="emerald" />
        <SummaryCard label="Fixed SIP Required" value={goal.fixedSipRequired} decimals={0} accent="amber" />
        <SummaryCard label={`Initial Step-Up SIP (${stepUp}% p.a.)`} value={goal.initialStepUpSipRequired} decimals={0} accent="brand" />
      </div>
    </div>
  )
}

export default ChildEducationPlanner
