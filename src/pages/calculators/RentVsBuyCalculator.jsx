import { useState } from 'react'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import InputField from '../../components/calculator/InputField'
import FormSection from '../../components/calculator/FormSection'
import ComparisonBarChart from '../../components/calculator/ComparisonBarChart'
import ProjectionTable from '../../components/calculator/ProjectionTable'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import CurrencyAmount from '../../components/calculator/CurrencyAmount'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { useCalculatorForm } from '../../hooks/useCalculatorForm'
import { rentVsBuySchema, validateRentVsBuyCross } from '../../config/calculatorSchemas'
import { calculateRentVsBuy } from '../../utils/rentVsBuyCalculations'

const meta = calculatorRegistry['rent-vs-buy']

const INITIAL_FORM = {
  comparisonYears: '',
  propertyAppreciation: '',
  monthlyRent: '',
  rentIncrease: '',
  propertyPrice: '',
  upfrontCosts: '',
  renovationCosts: '',
  annualPropertyTax: '',
  propertyTaxIncrease: '',
  annualMaintenance: '',
  maintenanceIncrease: '',
  sellingBrokerage: '',
  investmentReturn: '',
  downPayment: '',
  loanRate: '',
  loanTenure: '',
  processingFees: '',
  otherLoanFees: '',
}

const OUTRIGHT_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'propertyValue', label: 'Property Value', type: 'currency' },
  { key: 'annualOngoingCosts', label: 'Tax + Maintenance', type: 'currency' },
  { key: 'cumulativeCosts', label: 'Cumulative Costs', type: 'currency' },
  { key: 'netWorth', label: 'Buyer Net Worth', type: 'currency', highlight: true },
  { key: 'investmentValue', label: 'Invest Instead Value', type: 'currency' },
]

const LOAN_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'propertyValue', label: 'Property Value', type: 'currency' },
  { key: 'annualEmi', label: 'EMI Paid', type: 'currency' },
  { key: 'annualPrincipal', label: 'Principal', type: 'currency' },
  { key: 'annualInterest', label: 'Interest', type: 'currency' },
  { key: 'annualOngoingCosts', label: 'Tax + Maintenance', type: 'currency' },
  { key: 'cumulativeCosts', label: 'Cumulative Costs', type: 'currency' },
  { key: 'loanOutstanding', label: 'Loan Outstanding', type: 'currency' },
  { key: 'netWorth', label: 'Buyer Net Worth', type: 'currency', highlight: true },
]

const RENT_COLUMNS = [
  { key: 'year', label: 'Year' },
  { key: 'monthlyRent', label: 'Monthly Rent', type: 'currency' },
  { key: 'annualRent', label: 'Annual Rent', type: 'currency' },
  { key: 'moneySaved', label: 'Saved vs Buying', type: 'currency' },
  { key: 'investmentValue', label: 'Investment Value', type: 'currency', highlight: true },
]

function VerdictPanel({ title, years, buyLabel, buyValue, altLabel, altValue, winner, difference, buyWinsText, altWinsText }) {
  const style =
    winner === 'buy'
      ? 'border-emerald-100 bg-emerald-50/60'
      : winner === 'alternative'
        ? 'border-amber-100 bg-amber-50/60'
        : 'border-slate-200 bg-white'

  return (
    <div className={`hero-animate-in rounded-2xl border p-5 shadow-sm sm:p-6 ${style}`} style={{ animationDelay: '0.1s', opacity: 0 }}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">After {years} {years === 1 ? 'year' : 'years'}</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-brand-600">{buyLabel}</dt>
          <dd className="mt-1"><CurrencyAmount value={buyValue} size="md" /></dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-brand-600">{altLabel}</dt>
          <dd className="mt-1"><CurrencyAmount value={altValue} size="md" /></dd>
        </div>
      </dl>
      <p className="mt-4 text-sm font-medium text-slate-800">
        {winner === 'buy' && <>{buyWinsText} by <CurrencyAmount value={difference} size="sm" />.</>}
        {winner === 'alternative' && <>{altWinsText} by <CurrencyAmount value={difference} size="sm" />.</>}
        {winner === 'equal' && 'Both options come out the same.'}
      </p>
    </div>
  )
}

function RentVsBuyCalculator() {
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
  } = useCalculatorForm(INITIAL_FORM, rentVsBuySchema, validateRentVsBuyCross)

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
      calculateRentVsBuy({
        comparisonYears: v.comparisonYears,
        propertyAppreciationPercent: v.propertyAppreciation,
        monthlyRent: v.monthlyRent,
        annualRentIncreasePercent: v.rentIncrease,
        propertyPrice: v.propertyPrice,
        upfrontCosts: v.upfrontCosts,
        renovationCosts: v.renovationCosts,
        annualPropertyTax: v.annualPropertyTax,
        propertyTaxIncreasePercent: v.propertyTaxIncrease,
        annualMaintenance: v.annualMaintenance,
        maintenanceIncreasePercent: v.maintenanceIncrease,
        sellingBrokeragePercent: v.sellingBrokerage,
        investmentReturnPercent: v.investmentReturn,
        downPayment: v.downPayment,
        loanRatePercent: v.loanRate,
        loanTenureYears: v.loanTenure,
        processingFees: v.processingFees,
        otherLoanFees: v.otherLoanFees,
      })
    )
    setSubmitted(true)
  }

  const handleReset = () => {
    reset()
    setResults(null)
  }

  const field = (id, label, props) => (
    <InputField id={id} label={label} value={form[id]} onChange={updateField(id)} error={errors[id]} {...props} />
  )

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="Property & Rent Details"
            description="Blank cost fields are treated as zero."
            onSubmit={handleCalculate}
            onReset={handleReset}
            submitLabel="Compare"
          >
            <FormSection title="Comparison &amp; Rent" columns={4}>
              {field('comparisonYears', 'Comparison Period', { suffix: 'yrs', required: true, step: '1', range: { min: 1, max: 40, step: 1 } })}
              {field('monthlyRent', 'Initial Monthly Rent', { prefix: '₹', required: true })}
              {field('rentIncrease', 'Annual Rent Increase', { suffix: '%', required: true, step: '0.1', range: { min: 0, max: 20, step: 0.1 } })}
              {field('investmentReturn', 'Assumed Investment Return', { suffix: '%', required: true, step: '0.1', range: { min: 0, max: 30, step: 0.1 } })}
            </FormSection>

            <FormSection title="Property" columns={4}>
              {field('propertyPrice', 'Property Price', { prefix: '₹', required: true })}
              {field('propertyAppreciation', 'Annual Appreciation', { suffix: '%', required: true, step: '0.1', range: { min: 0, max: 20, step: 0.1 } })}
              {field('upfrontCosts', 'Upfront Buying Costs', { prefix: '₹', optional: true, hint: 'Registration, stamp duty, legal fees' })}
              {field('renovationCosts', 'Renovation / Furnishing', { prefix: '₹', optional: true })}
            </FormSection>

            <FormSection title="Ownership Costs" columns={5}>
              {field('annualPropertyTax', 'Annual Property Tax', { prefix: '₹', optional: true })}
              {field('propertyTaxIncrease', 'Property Tax Increase', { suffix: '%', optional: true, step: '0.1', range: { min: 0, max: 20, step: 0.1 } })}
              {field('annualMaintenance', 'Annual Maintenance', { prefix: '₹', optional: true })}
              {field('maintenanceIncrease', 'Maintenance Increase', { suffix: '%', optional: true, step: '0.1', range: { min: 0, max: 20, step: 0.1 } })}
              {field('sellingBrokerage', 'Selling Brokerage', { suffix: '%', optional: true, step: '0.1', hint: 'Of the value when sold', range: { min: 0, max: 5, step: 0.1 } })}
            </FormSection>

            <FormSection title="Home Loan" columns={5}>
              {field('downPayment', 'Down Payment', { prefix: '₹', required: true })}
              {field('loanRate', 'Loan Interest Rate', { suffix: '%', required: true, step: '0.01', range: { min: 0, max: 20, step: 0.05 } })}
              {field('loanTenure', 'Loan Tenure', { suffix: 'yrs', step: '1', range: { min: 1, max: 30, step: 1 } })}
              {field('processingFees', 'Processing Fees', { prefix: '₹', optional: true })}
              {field('otherLoanFees', 'Other Loan Fees', { prefix: '₹', optional: true })}
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
                <div className="flex min-w-0 flex-col gap-6">
                  <VerdictPanel
                    title="Buy Outright vs Invest Instead"
                    years={results.comparisonYears}
                    buyLabel="Buy outright: net worth"
                    buyValue={results.outright.buyNetWorth}
                    altLabel="Invest instead: value"
                    altValue={results.outright.investValue}
                    winner={results.outright.winner}
                    difference={results.outright.difference}
                    buyWinsText="Buying outright is better"
                    altWinsText="Investing instead is better"
                  />
                  <ComparisonBarChart
                    title="Buy Outright vs Invest Instead"
                    subtitle="Value at the end of the period"
                    bars={[
                      { name: 'Buy outright', value: results.outright.buyNetWorth },
                      { name: 'Invest instead', value: results.outright.investValue },
                    ]}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-6">
                  <VerdictPanel
                    title="Buy with Loan vs Rent & Invest"
                    years={results.comparisonYears}
                    buyLabel="Buy with loan: net worth"
                    buyValue={results.withLoan.buyNetWorth}
                    altLabel="Rent & invest: value"
                    altValue={results.withLoan.rentInvestValue}
                    winner={results.withLoan.winner}
                    difference={results.withLoan.difference}
                    buyWinsText="Buying with a loan is better"
                    altWinsText="Renting and investing is better"
                  />
                  <ComparisonBarChart
                    title="Buy with Loan vs Rent & Invest"
                    subtitle="Value at the end of the period"
                    bars={[
                      { name: 'Buy with loan', value: results.withLoan.buyNetWorth },
                      { name: 'Rent & invest', value: results.withLoan.rentInvestValue },
                    ]}
                  />
                </div>
              </div>

              {results.loanAmount > 0 && (
                <p className="text-sm text-slate-600">
                  Loan of <CurrencyAmount value={results.loanAmount} size="sm" /> with a monthly EMI of{' '}
                  <CurrencyAmount value={results.monthlyEmi} size="sm" />.
                </p>
              )}

              <ProjectionTable
                title="Buy Outright vs Invest Instead"
                subtitle="Year 0 is the purchase date. Net worth is before selling brokerage."
                rows={results.outright.rows}
                columns={OUTRIGHT_COLUMNS}
              />
              <ProjectionTable
                title="Buy with Loan"
                subtitle="Net worth = property value − loan outstanding − all costs paid (before selling brokerage)"
                rows={results.withLoan.loanRows}
                columns={LOAN_COLUMNS}
              />
              <ProjectionTable
                title="Rent & Invest"
                subtitle="Each year the renter invests what buying with a loan would have cost beyond the rent"
                rows={results.withLoan.rentRows}
                columns={RENT_COLUMNS}
              />

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600 sm:p-5">
                <p className="font-semibold text-slate-800">How this comparison works</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Buyer net worth is the property value minus the costs paid (and any loan still outstanding). Selling brokerage is deducted in the final figures.</li>
                  <li>Invest instead: the price, upfront and renovation costs are invested as a lump sum. Rent is not deducted on this side.</li>
                  <li>Rent &amp; invest: each year, EMI + tax + maintenance − rent is invested at the start of the year. Years where rent is higher add nothing. The down payment and fees are not invested.</li>
                  <li>Year 1 uses the rent, tax and maintenance you enter; each grows from year 2. Returns are assumed constant. For illustration only, not financial advice.</li>
                </ul>
              </div>
            </div>
          ) : (
            <CalculatorEmptyState description="Enter the property, rent and loan details and click Compare to see how buying compares with renting and investing." />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default RentVsBuyCalculator
