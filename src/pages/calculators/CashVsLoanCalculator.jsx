import { useState } from 'react'
import {
  HiOutlineScale,
  HiOutlineBanknotes,
  HiOutlineReceiptPercent,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import FormSection from '../../components/calculator/FormSection'
import InputField from '../../components/calculator/InputField'
import ResultCard from '../../components/calculator/ResultCard'
import SummaryCard from '../../components/calculator/SummaryCard'
import ComparisonBarChart from '../../components/calculator/ComparisonBarChart'
import ProjectionTable from '../../components/calculator/ProjectionTable'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { cashVsLoanSchema, validateCashVsLoanCross } from '../../config/calculatorSchemas'
import { calculateCashVsLoan } from '../../utils/cashVsLoanCalculations'

const meta = calculatorRegistry['cash-vs-loan']

const INITIAL_FORM = {
  assetValue: '',
  downPayment: '',
  loanRate: '',
  tenureYears: '',
  investmentReturn: '',
  taxOnGains: '',
  inflation: '',
}

const LOAN_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'openingBalance', label: 'Opening Balance', type: 'currency' },
  { key: 'principal', label: 'Principal Paid', type: 'currency' },
  { key: 'interest', label: 'Interest Paid', type: 'currency', highlight: true },
  { key: 'closingBalance', label: 'Closing Balance', type: 'currency' },
]

const INVESTMENT_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'openingValue', label: 'Opening Value', type: 'currency' },
  { key: 'growth', label: 'Growth for the Year', type: 'currency', highlight: true },
  { key: 'closingValue', label: 'Closing Value', type: 'currency' },
]

const VERDICT_STYLES = {
  borrow: 'border-emerald-100 bg-emerald-50/60',
  cash: 'border-amber-100 bg-amber-50/60',
  equal: 'border-slate-200 bg-white',
}

function CashVsLoanCalculator() {
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
  } = useCalculatorForm(INITIAL_FORM, cashVsLoanSchema, validateCashVsLoanCross)

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
    setResults({
      tenureYears: v.tenureYears,
      ...calculateCashVsLoan({
        assetValue: v.assetValue,
        downPayment: v.downPayment,
        loanRatePercent: v.loanRate,
        tenureYears: v.tenureYears,
        investmentReturnPercent: v.investmentReturn,
        taxOnGainsPercent: v.taxOnGains,
        inflationPercent: v.inflation,
      }),
    })
    setSubmitted(true)
  }

  const handleReset = () => {
    reset()
    setResults(null)
  }

  const years = results ? `${results.tenureYears} ${results.tenureYears === 1 ? 'year' : 'years'}` : ''

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="Purchase Details"
            description="Compare paying cash with borrowing and investing the cash you keep."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Compare"
          >
            <FormSection title="Purchase & Loan" columns={4}>
              <InputField id="assetValue" label="Asset Purchase Value" prefix="₹" value={form.assetValue} onChange={updateField('assetValue')} error={errors.assetValue} required />
              <InputField id="downPayment" label="Down Payment" prefix="₹" value={form.downPayment} onChange={updateField('downPayment')} error={errors.downPayment} optional hint="Paid upfront; the rest is borrowed" />
              <InputField id="loanRate" label="Loan Interest Rate" suffix="%" value={form.loanRate} onChange={updateField('loanRate')} error={errors.loanRate} step="0.01" required range={{ min: 0, max: 30, step: 0.05 }} />
              <InputField id="tenureYears" label="Loan Tenure" suffix="yrs" value={form.tenureYears} onChange={updateField('tenureYears')} error={errors.tenureYears} step="1" required range={{ min: 1, max: 30, step: 1 }} />
            </FormSection>
            <FormSection title="Investing the Cash You Keep" columns={3}>
              <InputField id="investmentReturn" label="Expected Investment Return" suffix="%" value={form.investmentReturn} onChange={updateField('investmentReturn')} error={errors.investmentReturn} step="0.01" required range={{ min: 0, max: 30, step: 0.1 }} />
              <InputField id="taxOnGains" label="Tax on Investment Gains" suffix="%" value={form.taxOnGains} onChange={updateField('taxOnGains')} error={errors.taxOnGains} step="0.01" optional range={{ min: 0, max: 50, step: 0.5 }} />
              <InputField id="inflation" label="Expected Inflation Rate" suffix="%" value={form.inflation} onChange={updateField('inflation')} error={errors.inflation} step="0.01" optional hint="Shows the result in today's money" range={{ min: 0, max: 15, step: 0.1 }} />
            </FormSection>
          </CalculatorFormPanel>
        }
        resultsPanel={
          submitted && results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Comparison Results</h2>
                <DownloadReportButton />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className={`hero-animate-in flex flex-col justify-center rounded-2xl border p-6 shadow-sm sm:p-8 ${VERDICT_STYLES[results.verdict]}`} style={{ animationDelay: '0.1s', opacity: 0 }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                    Net Result of Borrow &amp; Invest
                  </p>
                  <div className="mt-2">
                    <CurrencyAmount value={results.netResult} size="lg" amountClassName="!text-3xl" />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    In today's money: <CurrencyAmount value={results.inflationAdjustedNetResult} size="sm" />
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-800">
                    {results.verdict === 'borrow' &&
                      `Taking the loan and investing your cash is projected to leave you better off than paying cash over ${years}.`}
                    {results.verdict === 'cash' &&
                      `Paying cash is projected to be the better choice over ${years}: the loan interest exceeds the post-tax investment gain.`}
                    {results.verdict === 'equal' &&
                      `Both choices are projected to come out the same over ${years}.`}
                  </p>
                </div>

                <ComparisonBarChart
                  title="Cost of Loan vs Benefit of Investing"
                  subtitle={`Totals over ${years}`}
                  bars={[
                    { name: 'Loan interest', value: results.totalInterest },
                    { name: 'Post-tax gain', value: results.postTaxGain },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard label="Loan Amount" value={results.loanAmount} icon={HiOutlineBanknotes} accent="brand" delay={0.15} />
                <ResultCard label="Monthly EMI" value={results.emi} icon={HiOutlineReceiptPercent} accent="amber" delay={0.2} />
                <ResultCard label="Total Interest Paid" value={results.totalInterest} icon={HiOutlineScale} accent="brand" delay={0.25} />
                <ResultCard label="Post-Tax Investment Gain" value={results.postTaxGain} icon={HiOutlineArrowTrendingUp} accent="emerald" delay={0.3} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Total Loan Repayment" value={results.totalLoanPayment} accent="brand" delay={0.3} />
                <SummaryCard label="Amount Invested" value={results.initialInvestment} accent="slate" delay={0.35} />
                <SummaryCard label="Investment Value at End" value={results.investmentFinalValue} accent="emerald" delay={0.4} />
                <SummaryCard label="Tax on Gains" value={results.taxOnGains} accent="amber" delay={0.45} />
              </div>

              <ProjectionTable
                title="Loan Repayment by Year"
                subtitle="Principal and interest paid through EMIs each year"
                rows={results.loanProjection}
                columns={LOAN_COLUMNS}
              />

              <ProjectionTable
                title="Investment Growth by Year"
                subtitle="The cash you keep, invested as a lump sum"
                rows={results.investmentProjection}
                columns={INVESTMENT_COLUMNS}
              />

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600 sm:p-5">
                <p className="font-semibold text-slate-800">How this comparison works</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>The cash you keep by borrowing (equal to the loan amount) is invested as a lump sum for the loan tenure, compounding annually.</li>
                  <li>The cost of borrowing is the total loan interest. EMIs are assumed to be paid from other income.</li>
                  <li>What those EMI amounts could have earned if invested instead is not counted, so the result favours borrowing when the investment return is close to or below the loan rate.</li>
                  <li>Tax applies only to a positive investment gain. Market returns are not guaranteed. For illustration only, not financial advice.</li>
                </ul>
              </div>
            </div>
          ) : (
            <CalculatorEmptyState description="Enter the purchase and loan details and click Compare to see whether borrowing and investing beats paying cash." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default CashVsLoanCalculator
