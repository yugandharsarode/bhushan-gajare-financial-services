import { suite, seededRandom } from './harness.mjs'
import { calculateRentVsBuy } from '../../src/utils/rentVsBuyCalculations.js'
import { rentVsBuySchema, validateRentVsBuyCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Rent vs Buy')

const DEFAULTS = {
  comparisonYears: 10,
  propertyAppreciationPercent: 5,
  monthlyRent: 15000,
  annualRentIncreasePercent: 5,
  propertyPrice: 5000000,
  upfrontCosts: 300000,
  renovationCosts: 200000,
  annualPropertyTax: 5000,
  propertyTaxIncreasePercent: 3,
  annualMaintenance: 10000,
  maintenanceIncreasePercent: 3,
  sellingBrokeragePercent: 1,
  investmentReturnPercent: 10,
  downPayment: 1000000,
  loanRatePercent: 8.5,
  loanTenureYears: 20,
  processingFees: 10000,
  otherLoanFees: 0,
}

// ---------------------------------------------------------------------------
// Reference cases where our corrections do not change the figures
// (no tax or maintenance, so the year-1 cost timing does not matter).
// Only the loan summary differs: the reference reads year N-1, we read year N.
// ---------------------------------------------------------------------------

// TC2: all optional costs, fees and brokerage 0
{
  const r = calculateRentVsBuy({
    ...DEFAULTS, comparisonYears: 7, propertyAppreciationPercent: 4.2, monthlyRent: 18900, annualRentIncreasePercent: 6.5,
    propertyPrice: 6125000, upfrontCosts: 0, renovationCosts: 0, annualPropertyTax: 0, propertyTaxIncreasePercent: 0,
    annualMaintenance: 0, maintenanceIncreasePercent: 0, sellingBrokeragePercent: 0, investmentReturnPercent: 9.3,
    downPayment: 1225000, loanRatePercent: 9.15, loanTenureYears: 15, processingFees: 0, otherLoanFees: 0,
  })
  t.rupees('TC2 buy outright net worth', r.outright.buyNetWorth, 8169211)
  t.rupees('TC2 invest instead value', r.outright.investValue, 11414246)
  t.rupees('TC2 outright difference', r.outright.difference, 3245035)
  t.equal('TC2 outright verdict', r.outright.winner, 'alternative')
  const outright = [[0, 6125000, 6125000], [1, 6382250, 6694625], [2, 6650305, 7317225], [7, 8169211, 11414246]]
  for (const [year, value, invest] of outright) {
    t.rupees(`TC2 outright year ${year} property value`, r.outright.rows[year].propertyValue, value)
    t.rupees(`TC2 outright year ${year} invest instead`, r.outright.rows[year].investmentValue, invest)
  }
  // [year, property, emi, principal, interest, outstanding, net worth]
  const loan = [
    [0, 6125000, 0, 0, 0, 4900000, 0], [1, 6382250, 601647, 159892, 441755, 4740108, -184505],
    [2, 6650305, 601647, 175152, 426495, 4564956, -342946], [5, 7523929, 601647, 230237, 371410, 3932673, -641979],
    [6, 7839934, 601647, 252210, 349437, 3680462, -675410], [7, 8169211, 601647, 276281, 325366, 3404182, -671499],
  ]
  for (const [year, value, emi, principal, interest, outstanding, netWorth] of loan) {
    const row = r.withLoan.loanRows[year]
    t.rupees(`TC2 loan year ${year} property value`, row.propertyValue, value)
    t.rupees(`TC2 loan year ${year} EMI`, row.annualEmi, emi)
    t.rupees(`TC2 loan year ${year} principal`, row.annualPrincipal, principal)
    t.rupees(`TC2 loan year ${year} interest`, row.annualInterest, interest)
    t.rupees(`TC2 loan year ${year} outstanding`, row.loanOutstanding, outstanding)
    t.rupees(`TC2 loan year ${year} net worth`, row.netWorth, netWorth)
  }
  // [year, monthly rent, annual rent, saved, investment]
  const rent = [[1, 18900, 226800, 374847, 409708], [2, 20129, 241542, 360105, 841405], [6, 25895, 310736, 290911, 2808405], [7, 27578, 330933, 270714, 3365477]]
  for (const [year, monthly, annual, saved, invest] of rent) {
    const row = r.withLoan.rentRows[year]
    t.rupees(`TC2 rent year ${year} monthly rent`, row.monthlyRent, monthly)
    t.rupees(`TC2 rent year ${year} annual rent`, row.annualRent, annual)
    t.rupees(`TC2 rent year ${year} saved`, row.moneySaved, saved)
    t.rupees(`TC2 rent year ${year} investment`, row.investmentValue, invest)
  }
  // Reference summary shows year 6 (-₹6,75,410 vs ₹28,08,405) under "after 7 years"
  t.rupees('TC2 loan summary uses year 7', r.withLoan.buyNetWorth, -671499)
  t.rupees('TC2 rent & invest summary uses year 7', r.withLoan.rentInvestValue, 3365477)
  t.equal('TC2 loan verdict', r.withLoan.winner, 'alternative')
}

// Defaults without tax, maintenance and brokerage
{
  const base = { ...DEFAULTS, annualPropertyTax: 0, annualMaintenance: 0, sellingBrokeragePercent: 0 }
  const r = calculateRentVsBuy(base)
  t.rupees('No-cost defaults: buy outright', r.outright.buyNetWorth, 7644473)
  t.rupees('No-cost defaults: invest instead', r.outright.investValue, 14265584)
  t.rupees('No-cost defaults: outright difference', r.outright.difference, 6621110)
  t.rupees('No-cost defaults: loan year 0 net worth', r.withLoan.loanRows[0].netWorth, -510000)
  t.rupees('No-cost defaults: loan year 9 net worth', r.withLoan.loanRows[9].netWorth, -472727)
  t.rupees('No-cost defaults: loan summary uses year 10', r.withLoan.buyNetWorth, -330831)
  t.rupees('No-cost defaults: rent & invest summary uses year 10', r.withLoan.rentInvestValue, 3481901)
  t.rupees('No-cost defaults: year 10 outstanding', r.withLoan.loanRows[10].loanOutstanding, 2799753)

  const noFees = calculateRentVsBuy({ ...base, upfrontCosts: 0, renovationCosts: 0, processingFees: 0 })
  t.rupees('No fees: buy outright', noFees.outright.buyNetWorth, 8144473)
  t.rupees('No fees: invest instead', noFees.outright.investValue, 12968712)
  t.rupees('No fees: loan summary uses year 10', noFees.withLoan.buyNetWorth, 179169)
  t.rupees('No fees: rent & invest', noFees.withLoan.rentInvestValue, 3481901)
}

// ---------------------------------------------------------------------------
// Default inputs with tax and maintenance. Year 1 costs are the amounts entered
// (the reference already raised them by 3% in year 1), so these are checked
// against an independent closed-form calculation, plus the reference for the
// columns that do not depend on costs.
// ---------------------------------------------------------------------------
{
  const r = calculateRentVsBuy(DEFAULTS)
  const N = 10
  const V = (year) => 5000000 * 1.05 ** year
  const cost = (year) => (year === 0 ? 0 : 15000 * 1.03 ** (year - 1))
  const costsTo = (year) => (15000 * (1.03 ** year - 1)) / 0.03
  const i = 0.085 / 12
  const L = 4000000
  const emi = (L * i) / (1 - (1 + i) ** -240)
  const outstanding = (months) => L * (1 + i) ** months - (emi * ((1 + i) ** months - 1)) / i
  const saved = (year) => 12 * emi + cost(year) - 12 * 15000 * 1.05 ** (year - 1)
  let rentCorpus = 0
  for (let year = 1; year <= N; year++) rentCorpus += Math.max(0, saved(year)) * 1.1 ** (N - year + 1)

  t.close('Defaults: buy outright (independent formula)', r.outright.buyNetWorth, V(N) - 500000 - costsTo(N) - 0.01 * V(N), 0.01)
  t.close('Defaults: buy with loan (independent formula)', r.withLoan.buyNetWorth, V(N) - outstanding(120) - (1000000 + 500000 + 10000 + 120 * emi + costsTo(N)) - 0.01 * V(N), 0.01)
  t.close('Defaults: rent & invest (independent formula)', r.withLoan.rentInvestValue, rentCorpus, 0.01)
  t.rupees('Defaults: year 1 costs are the amounts entered', r.outright.rows[1].annualOngoingCosts, 15000)
  t.rupees('Defaults: year 2 costs grow 3%', r.outright.rows[2].annualOngoingCosts, 15450)
  t.close('Defaults: cumulative costs shown (reference shows N/A)', r.withLoan.loanRows[1].cumulativeCosts, 1510000 + 12 * emi + 15000, 0.01)

  // Columns that do not depend on costs match the reference
  t.rupees('Defaults: invest instead (reference)', r.outright.investValue, 14265584)
  const loanRef = [[1, 5250000, 416555, 79609, 336946, 3920391], [2, 5512500, 416555, 86646, 329909, 3833745], [9, 7756641, 416555, 156763, 259793, 2970372], [10, 8144473, 416555, 170619, 245936, 2799753]]
  for (const [year, value, annualEmi, principal, interest, out] of loanRef) {
    const row = r.withLoan.loanRows[year]
    t.rupees(`Defaults: year ${year} property value (reference)`, row.propertyValue, value)
    t.rupees(`Defaults: year ${year} EMI (reference)`, row.annualEmi, annualEmi)
    t.rupees(`Defaults: year ${year} principal (reference)`, row.annualPrincipal, principal)
    t.rupees(`Defaults: year ${year} interest (reference)`, row.annualInterest, interest)
    t.rupees(`Defaults: year ${year} outstanding (reference)`, row.loanOutstanding, out)
  }
  const rentRef = [[1, 15000, 180000], [2, 15750, 189000], [9, 22162, 265942], [10, 23270, 279239]]
  for (const [year, monthly, annual] of rentRef) {
    t.rupees(`Defaults: year ${year} monthly rent (reference)`, r.withLoan.rentRows[year].monthlyRent, monthly)
    t.rupees(`Defaults: year ${year} annual rent (reference)`, r.withLoan.rentRows[year].annualRent, annual)
  }
}

// Period longer than the loan (TC3): after the loan closes, EMI and outstanding are 0,
// and years where rent exceeds the old EMI + costs add nothing to the investment
{
  const r = calculateRentVsBuy({
    ...DEFAULTS, comparisonYears: 25, propertyAppreciationPercent: 9.5, monthlyRent: 42000, annualRentIncreasePercent: 8,
    propertyPrice: 13500000, upfrontCosts: 945000, renovationCosts: 350000, annualPropertyTax: 14200, propertyTaxIncreasePercent: 3.5,
    annualMaintenance: 36000, maintenanceIncreasePercent: 6, sellingBrokeragePercent: 2, investmentReturnPercent: 6.2,
    downPayment: 2700000, loanRatePercent: 8.4, loanTenureYears: 12, processingFees: 25000, otherLoanFees: 11000,
  })
  t.rupees('TC3 year 1 EMI (reference)', r.withLoan.loanRows[1].annualEmi, 1431439)
  t.rupees('TC3 year 12 EMI (reference)', r.withLoan.loanRows[12].annualEmi, 1431439)
  t.rupees('TC3 loan closed by year 12', r.withLoan.loanRows[12].loanOutstanding, 0)
  t.rupees('TC3 no EMI in year 13', r.withLoan.loanRows[13].annualEmi, 0)
  t.rupees('TC3 year 25 property value (reference)', r.withLoan.loanRows[25].propertyValue, 130522910)
  t.rupees('TC3 year 25 monthly rent (reference)', r.withLoan.rentRows[25].monthlyRent, 266330)
  t.ok('TC3 year 25: rent higher than costs, so nothing added', r.withLoan.rentRows[25].moneySaved < 0)
  t.close('TC3 year 25: investment only grows', r.withLoan.rentRows[25].investmentValue, r.withLoan.rentRows[24].investmentValue * 1.062, 1e-6)
  t.equal('TC3 buying with loan wins', r.withLoan.winner, 'buy')
  t.equal('TC3 buying outright wins', r.outright.winner, 'buy')
}

// 0% loan: the reference shows N/A; the loan is repaid in equal instalments
{
  const r = calculateRentVsBuy({ ...DEFAULTS, loanRatePercent: 0 })
  t.rupees('0% loan: annual EMI', r.withLoan.loanRows[1].annualEmi, 200000)
  t.rupees('0% loan: no interest', r.withLoan.loanRows[1].annualInterest, 0)
  t.rupees('0% loan: outstanding after 10 years', r.withLoan.loanRows[10].loanOutstanding, 2000000)
  t.finite('0% loan: no NaN/Infinity', r)
}

// Tie: equal values are reported as equal (the reference names the investing side)
{
  const r = calculateRentVsBuy({ ...DEFAULTS, investmentReturnPercent: 5, upfrontCosts: 0, renovationCosts: 0, annualPropertyTax: 0, annualMaintenance: 0, sellingBrokeragePercent: 0 })
  t.equal('tie: outright comparison equal', r.outright.winner, 'equal')
  t.rupees('tie: values', r.outright.buyNetWorth, 8144473)
}

// No loan (down payment = price)
{
  const r = calculateRentVsBuy({ ...DEFAULTS, downPayment: 5000000, loanTenureYears: 0 })
  t.rupees('no loan: EMI 0', r.withLoan.loanRows[3].annualEmi, 0)
  t.rupees('no loan: outstanding 0', r.withLoan.loanRows[3].loanOutstanding, 0)
  t.finite('no loan: no NaN/Infinity', r)
}

// One-year period (the reference used year 0 for the loan summary)
{
  const r = calculateRentVsBuy({ ...DEFAULTS, comparisonYears: 1 })
  t.equal('one year: tables have years 0 and 1', r.withLoan.loanRows.length, 2)
  t.close('one year: loan summary uses year 1', r.withLoan.buyNetWorth, r.withLoan.loanRows[1].netWorth - r.sellingCosts, 1e-6)
  t.ok('one year: rent & invest after one year is positive', r.withLoan.rentInvestValue > 0)
}

// Additional values
const random = seededRandom(1234)
for (let n = 0; n < 40; n++) {
  const propertyPrice = Math.round(1000000 + random() * 30000000)
  const input = {
    ...DEFAULTS,
    comparisonYears: 1 + Math.floor(random() * 30),
    propertyAppreciationPercent: Math.round(random() * 1200) / 100,
    monthlyRent: Math.round(5000 + random() * 150000),
    annualRentIncreasePercent: Math.round(random() * 1000) / 100,
    propertyPrice,
    upfrontCosts: Math.round(random() * propertyPrice * 0.1),
    annualPropertyTax: Math.round(random() * 50000),
    annualMaintenance: Math.round(random() * 100000),
    sellingBrokeragePercent: Math.round(random() * 300) / 100,
    investmentReturnPercent: Math.round(random() * 1500) / 100,
    downPayment: Math.round(random() * propertyPrice),
    loanRatePercent: Math.round(random() * 1500) / 100,
    loanTenureYears: 1 + Math.floor(random() * 30),
  }
  const r = calculateRentVsBuy(input)
  const loanMonths = input.loanTenureYears * 12
  const principalPaid = r.withLoan.loanRows.reduce((sum, row) => sum + row.annualPrincipal, 0)
  const expectedPaid = r.loanAmount - (r.withLoan.loanRows.at(-1).loanOutstanding)
  t.close(`random ${n}: principal paid matches outstanding`, principalPaid, expectedPaid, 1e-6 * Math.max(1, r.loanAmount))
  if (input.comparisonYears * 12 >= loanMonths) t.rupees(`random ${n}: loan closed within period`, r.withLoan.loanRows.at(-1).loanOutstanding, 0)
  t.ok(`random ${n}: rent investment never negative`, r.withLoan.rentRows.every((row) => row.investmentValue >= 0))
  t.equal(`random ${n}: tables cover years 0 to N`, r.outright.rows.length, input.comparisonYears + 1)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => {
  const fieldErrors = validateFields(values, rentVsBuySchema)
  return { ...validateRentVsBuyCross(values, fieldErrors), ...fieldErrors }
}
const valid = {
  comparisonYears: '10', propertyAppreciation: '5', monthlyRent: '15000', rentIncrease: '5', propertyPrice: '5000000',
  upfrontCosts: '', renovationCosts: '', annualPropertyTax: '', propertyTaxIncrease: '', annualMaintenance: '',
  maintenanceIncrease: '', sellingBrokerage: '', investmentReturn: '10', downPayment: '1000000', loanRate: '8.5',
  loanTenure: '20', processingFees: '', otherLoanFees: '',
}
t.equal('valid form with blank optional costs', v(valid), {})
t.equal('period 0 rejected', v({ ...valid, comparisonYears: '0' }).comparisonYears, 'Comparison period must be greater than zero')
t.equal('fractional period rejected', v({ ...valid, comparisonYears: '0.5' }).comparisonYears, 'Comparison period must be a whole number')
t.equal('down payment above price', v({ ...valid, downPayment: '6000000' }).downPayment, 'Down payment cannot be more than the property price')
t.equal('tenure needed when there is a loan', v({ ...valid, loanTenure: '' }).loanTenure, 'Loan tenure is required when a loan is taken')
t.equal('tenure not needed without a loan', v({ ...valid, downPayment: '5000000', loanTenure: '' }), {})
t.equal('0% loan rate accepted', v({ ...valid, loanRate: '0' }), {})
