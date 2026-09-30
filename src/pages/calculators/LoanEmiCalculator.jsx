import { useState } from 'react'
import {
  HiOutlineReceiptPercent,
  HiOutlineBanknotes,
  HiOutlineCurrencyRupee,
  HiOutlineCalendarDays,
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
import { loanEmiSchema, validateLoanEmiCross } from '../../config/calculatorSchemas'
import { calculateLoanSummary } from '../../utils/loanCalculations'

const meta = calculatorRegistry['loan-emi']

const INITIAL_FORM = {
  loanAmount: '',
  interestRate: '',
  tenureYears: '',
  tenureMonths: '',
}

const SCHEDULE_COLUMNS = [
  { key: 'month', label: 'EMI No.' },
  { key: 'payment', label: 'Payment', type: 'currency' },
  { key: 'interest', label: 'Interest', type: 'currency' },
  { key: 'principal', label: 'Principal', type: 'currency', highlight: true },
  { key: 'balance', label: 'Balance', type: 'currency' },
]

function formatTenure(months) {
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (rest) parts.push(`${rest} ${rest === 1 ? 'month' : 'months'}`)
  return parts.join(' ')
}

function LoanEmiCalculator() {
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
  } = useCalculatorForm(INITIAL_FORM, loanEmiSchema, validateLoanEmiCross)

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
      calculateLoanSummary({
        principal: v.loanAmount,
        annualRatePercent: v.interestRate,
        months: v.tenureYears * 12 + v.tenureMonths,
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
            title="Loan Details"
            description="Enter the loan amount, interest rate and tenure."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Calculate EMI"
          >
            <FormSection columns={4}>
              <InputField id="loanAmount" label="Loan Amount" prefix="₹" value={form.loanAmount} onChange={updateField('loanAmount')} error={errors.loanAmount} required />
              <InputField id="interestRate" label="Annual Interest Rate" suffix="%" value={form.interestRate} onChange={updateField('interestRate')} error={errors.interestRate} step="0.01" required range={{ min: 0, max: 30, step: 0.05 }} />
              <InputField id="tenureYears" label="Tenure (Years)" suffix="yrs" value={form.tenureYears} onChange={updateField('tenureYears')} error={errors.tenureYears} step="1" optional range={{ min: 0, max: 40, step: 1 }} />
              <InputField id="tenureMonths" label="Tenure (Months)" suffix="mos" value={form.tenureMonths} onChange={updateField('tenureMonths')} error={errors.tenureMonths} step="1" optional hint="Additional months, 0 to 11" range={{ min: 0, max: 11, step: 1 }} />
            </FormSection>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Loan Summary</h2>
                  <p className="text-sm text-slate-600">
                    {formatTenure(results.months)} · {results.months} EMIs
                  </p>
                </div>
                <DownloadReportButton />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard label="Monthly EMI" value={results.emi} icon={HiOutlineReceiptPercent} accent="brand" delay={0.1} />
                <ResultCard label="Total Interest" value={results.totalInterest} icon={HiOutlineCurrencyRupee} accent="amber" delay={0.15} />
                <ResultCard label="Total Payment" value={results.totalPayment} icon={HiOutlineBanknotes} accent="emerald" delay={0.2} />
                <ResultCard label="Principal Amount" value={results.principal} icon={HiOutlineCalendarDays} accent="brand" delay={0.25} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SummaryCard label="Payments in First Year" value={results.emi * Math.min(12, results.months)} accent="brand" delay={0.3} />
                <SummaryCard
                  label="Interest Paid in First Year"
                  value={results.schedule.slice(0, 12).reduce((sum, row) => sum + row.interest, 0)}
                  accent="amber"
                  delay={0.35}
                />
              </div>

              <WealthPieChart
                title="Payment Breakdown"
                subtitle="Principal vs total interest"
                slices={[
                  { name: 'Principal', value: results.principal },
                  { name: 'Interest', value: results.totalInterest },
                ]}
              />

              <ProjectionTable
                title="Amortization Schedule"
                subtitle="Month-by-month split of each EMI"
                rows={results.schedule}
                columns={SCHEDULE_COLUMNS}
              />

              <p className="text-xs leading-relaxed text-slate-500">
                * EMI uses the monthly rate of annual rate ÷ 12 on the reducing balance, paid at
                the end of each month. Figures are rounded to the nearest rupee for display. Your
                lender's figures may differ slightly because of rounding and fees.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState description="Enter your loan details and click Calculate EMI to see the EMI, total interest and repayment schedule." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default LoanEmiCalculator
