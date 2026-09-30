import { useState } from 'react'
import {
  HiOutlineShieldCheck,
  HiOutlineBanknotes,
  HiOutlineHome,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'react-icons/hi2'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import FormSection from '../../components/calculator/FormSection'
import InputField from '../../components/calculator/InputField'
import FieldGroupHeading from '../../components/calculator/FieldGroupHeading'
import ResultCard from '../../components/calculator/ResultCard'
import SummaryCard from '../../components/calculator/SummaryCard'
import ProjectionTable from '../../components/calculator/ProjectionTable'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import {
  humanLifeValueSchema,
  validateHumanLifeValueCross,
  validateNeedBasedForm,
  toNeedBasedInput,
} from '../../config/calculatorSchemas'
import { validateFields, toNumericValues } from '../../utils/calculatorValidation'
import {
  calculateHumanLifeValue,
  calculateNeedBasedCover,
  NEED_BASED_SUPPORT_UNTIL_AGE,
} from '../../utils/termInsuranceCalculations'

const meta = calculatorRegistry['term-insurance']

const METHODS = [
  { id: 'hlv', label: 'Human Life Value' },
  { id: 'need', label: 'Need-Based' },
]

const INITIAL_HLV = {
  currentAge: '',
  retirementAge: '',
  annualIncome: '',
  salaryHike: '',
  discountRate: '',
}

const EMPTY_GOAL = { description: '', presentCost: '', years: '', inflationPercent: '' }

const INITIAL_NEED = {
  spouseAge: '',
  annualFamilyExpenses: '',
  inflation: '',
  returnRate: '',
  outstandingLoans: '',
  goals: [{ ...EMPTY_GOAL }],
}

const HLV_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'age', label: 'Your Age' },
  { key: 'income', label: 'Income', type: 'currency' },
  { key: 'presentValue', label: 'Present Value', type: 'currency', highlight: true },
]

const NEED_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'spouseAge', label: 'Spouse Age' },
  { key: 'expense', label: 'Living Expense', type: 'currency' },
  { key: 'presentValue', label: 'Present Value', type: 'currency', highlight: true },
]

function TermInsuranceCalculator() {
  const [method, setMethod] = useState('hlv')
  const [hlvForm, setHlvForm] = useState(INITIAL_HLV)
  const [needForm, setNeedForm] = useState(INITIAL_NEED)
  const [errors, setErrors] = useState({})
  const [results, setResults] = useState(null)

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const updateHlv = (field) => (e) => {
    setHlvForm((prev) => ({ ...prev, [field]: e.target.value }))
    clearError(field)
  }

  const updateNeed = (field) => (e) => {
    setNeedForm((prev) => ({ ...prev, [field]: e.target.value }))
    clearError(field)
  }

  const updateGoal = (index, field) => (e) => {
    setNeedForm((prev) => {
      const goals = [...prev.goals]
      goals[index] = { ...goals[index], [field]: e.target.value }
      return { ...prev, goals }
    })
    clearError(`goal${index}_${field}`)
  }

  const addGoal = () => {
    setNeedForm((prev) => ({ ...prev, goals: [...prev.goals, { ...EMPTY_GOAL }] }))
  }

  const removeGoal = (index) => {
    setNeedForm((prev) => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }))
    setErrors({})
  }

  const switchMethod = (nextMethod) => {
    if (nextMethod === method) return
    setMethod(nextMethod)
    setErrors({})
    setResults(null)
  }

  const handleCalculate = (e) => {
    e.preventDefault()

    if (method === 'hlv') {
      const fieldErrors = validateFields(hlvForm, humanLifeValueSchema)
      const nextErrors = { ...validateHumanLifeValueCross(hlvForm, fieldErrors), ...fieldErrors }
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        setResults(null)
        return
      }
      const v = toNumericValues(hlvForm, humanLifeValueSchema)
      const hlv = calculateHumanLifeValue({
        currentAge: v.currentAge,
        retirementAge: v.retirementAge,
        annualIncome: v.annualIncome,
        salaryHikePercent: v.salaryHike,
        discountRatePercent: v.discountRate,
      })
      setResults({
        method: 'hlv',
        ...hlv,
        projection: hlv.projection.map((row) => ({ ...row, age: v.currentAge + row.year - 1 })),
      })
      return
    }

    const nextErrors = validateNeedBasedForm(needForm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setResults(null)
      return
    }
    const input = toNeedBasedInput(needForm)
    const cover = calculateNeedBasedCover(input)
    setResults({
      method: 'need',
      ...cover,
      projection: cover.projection.map((row) => ({ ...row, spouseAge: input.spouseAge + row.year - 1 })),
    })
  }

  const handleReset = () => {
    if (method === 'hlv') setHlvForm(INITIAL_HLV)
    else setNeedForm(INITIAL_NEED)
    setErrors({})
    setResults(null)
  }

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="Cover Details"
            description={
              method === 'hlv'
                ? 'Cover equal to the present value of the income you would earn until retirement.'
                : "Cover for your family's living expenses, future goals and outstanding loans."
            }
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate Cover"
            headerAside={
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-brand-100 bg-white p-1 shadow-sm" role="group" aria-label="Calculation method">
                {METHODS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => switchMethod(option.id)}
                    aria-pressed={method === option.id}
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      method === option.id ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            }
          >
            {method === 'hlv' ? (
              <FormSection title="Your Details" columns={5}>
                <InputField id="currentAge" label="Your Current Age" suffix="yrs" value={hlvForm.currentAge} onChange={updateHlv('currentAge')} error={errors.currentAge} required step="1" range={{ min: 18, max: 70, step: 1 }} />
                <InputField id="retirementAge" label="Retirement Age" suffix="yrs" value={hlvForm.retirementAge} onChange={updateHlv('retirementAge')} error={errors.retirementAge} required step="1" range={{ min: 30, max: 80, step: 1 }} />
                <InputField id="annualIncome" label="Current Annual Income" prefix="₹" value={hlvForm.annualIncome} onChange={updateHlv('annualIncome')} error={errors.annualIncome} required />
                <InputField id="salaryHike" label="Annual Salary Hike" suffix="%" value={hlvForm.salaryHike} onChange={updateHlv('salaryHike')} error={errors.salaryHike} required step="0.1" range={{ min: 0, max: 20, step: 0.1 }} />
                <InputField id="discountRate" label="Return / Discount Rate" suffix="%" value={hlvForm.discountRate} onChange={updateHlv('discountRate')} error={errors.discountRate} required step="0.1" range={{ min: 0, max: 20, step: 0.1 }} />
              </FormSection>
            ) : (
              <>
                <FormSection title="Family & Loans" columns={5}>
                  <InputField id="spouseAge" label="Spouse Age" suffix="yrs" value={needForm.spouseAge} onChange={updateNeed('spouseAge')} error={errors.spouseAge} required step="1" hint={`Expenses covered until age ${NEED_BASED_SUPPORT_UNTIL_AGE}`} range={{ min: 18, max: 89, step: 1 }} />
                  <InputField id="annualFamilyExpenses" label="Annual Family Expenses" prefix="₹" value={needForm.annualFamilyExpenses} onChange={updateNeed('annualFamilyExpenses')} error={errors.annualFamilyExpenses} required />
                  <InputField id="inflation" label="Expected Inflation" suffix="%" value={needForm.inflation} onChange={updateNeed('inflation')} error={errors.inflation} required step="0.1" range={{ min: 0, max: 15, step: 0.1 }} />
                  <InputField id="returnRate" label="Return on Corpus" suffix="%" value={needForm.returnRate} onChange={updateNeed('returnRate')} error={errors.returnRate} required step="0.1" range={{ min: 0, max: 20, step: 0.1 }} />
                  <InputField id="outstandingLoans" label="Outstanding Loans" prefix="₹" value={needForm.outstandingLoans} onChange={updateNeed('outstandingLoans')} error={errors.outstandingLoans} optional />
                </FormSection>

                <section className="flex flex-col gap-4">
                  <FieldGroupHeading note="(optional)">Future Financial Goals</FieldGroupHeading>
                  {needForm.goals.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {needForm.goals.map((goal, index) => (
                        <div
                          key={index}
                          className="grid items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:rounded-xl lg:p-3"
                        >
                          <InputField id={`goalDescription-${index}`} label="Goal" type="text" value={goal.description} onChange={updateGoal(index, 'description')} placeholder="e.g. Child's college" />
                          <InputField id={`goalCost-${index}`} label="Amount Needed Today" prefix="₹" value={goal.presentCost} onChange={updateGoal(index, 'presentCost')} error={errors[`goal${index}_presentCost`]} />
                          <InputField id={`goalYears-${index}`} label="Years from Now" suffix="yrs" value={goal.years} onChange={updateGoal(index, 'years')} error={errors[`goal${index}_years`]} step="1" />
                          <InputField id={`goalInflation-${index}`} label="Goal Inflation" suffix="%" value={goal.inflationPercent} onChange={updateGoal(index, 'inflationPercent')} error={errors[`goal${index}_inflationPercent`]} step="0.1" placeholder="General" />
                          <div className="sm:col-span-2 lg:col-span-1">
                            {/* Spacer the height of a field label, so the button lines up with the boxes */}
                            <span className="invisible mb-1.5 hidden text-[11px] font-semibold uppercase tracking-wider lg:block" aria-hidden="true">
                              Remove
                            </span>
                            <button
                              type="button"
                              onClick={() => removeGoal(index)}
                              className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 lg:w-12"
                              aria-label={`Remove goal ${index + 1}`}
                            >
                              <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                              <span className="lg:sr-only">Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Leave a goal's inflation blank to use the general inflation rate. Empty goal rows are ignored.
                  </p>
                  <button
                    type="button"
                    onClick={addGoal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-white px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:border-brand-500 hover:bg-brand-50"
                  >
                    <HiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Add Goal
                  </button>
                </section>
              </>
            )}
          </CalculatorFormPanel>
        }
        resultsPanel={
          results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Recommended Term Insurance Cover</h2>
                <DownloadReportButton />
              </div>

              {results.method === 'hlv' ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ResultCard label="Recommended Cover (Human Life Value)" value={results.humanLifeValue} icon={HiOutlineShieldCheck} accent="brand" delay={0.1} />
                    <ResultCard label="Total Income Until Retirement" value={results.projection.reduce((sum, row) => sum + row.income, 0)} icon={HiOutlineBanknotes} accent="amber" delay={0.15} />
                  </div>
                  <p className="text-sm text-slate-600">
                    Based on the present value of your income for the next {results.workingYears}{' '}
                    {results.workingYears === 1 ? 'year' : 'years'}, until retirement.
                  </p>
                  <ProjectionTable
                    title="Year-wise Income Projection"
                    subtitle="Each year's income and its value today"
                    rows={results.projection}
                    columns={HLV_COLUMNS}
                  />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ResultCard label="Total Recommended Cover" value={results.totalCover} icon={HiOutlineShieldCheck} accent="brand" delay={0.1} />
                    <ResultCard label="Present Value of Living Expenses" value={results.presentValueOfLivingExpenses} icon={HiOutlineHome} accent="amber" delay={0.15} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SummaryCard label="Present Value of Goals" value={results.totalGoalsPresentValue} accent="emerald" delay={0.2} />
                    <SummaryCard label="Outstanding Loans" value={results.outstandingLoans} accent="brand" delay={0.25} />
                  </div>

                  {results.goals.length > 0 && (
                    <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '0.3s', opacity: 0 }}>
                      <h3 className="text-base font-semibold text-slate-900">Goals Included</h3>
                      <ul className="mt-3 divide-y divide-slate-100 text-sm">
                        {results.goals.map((goal, index) => (
                          <li key={index} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                            <span className="font-medium text-slate-800">
                              {goal.description}
                              <span className="ml-2 font-normal text-slate-500">
                                in {goal.years} {goal.years === 1 ? 'year' : 'years'} · {goal.inflationPercent}% inflation
                              </span>
                            </span>
                            <CurrencyAmount value={goal.presentValue} size="sm" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <ProjectionTable
                    title="Year-wise Living Expense Projection"
                    subtitle={`Family expenses until your spouse turns ${NEED_BASED_SUPPORT_UNTIL_AGE}`}
                    rows={results.projection}
                    columns={NEED_COLUMNS}
                  />
                </>
              )}

              <p className="text-xs leading-relaxed text-slate-500">
                * Year 1 uses today's income or expenses; each later year grows by the hike or
                inflation rate. Every year is discounted to today at the assumed return. Existing
                life cover and investments are not deducted. For illustration only, not financial advice.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState description="Choose a method, enter your details and click Calculate Cover to see how much term insurance you need." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default TermInsuranceCalculator
