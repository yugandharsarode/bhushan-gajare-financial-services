import { suite, seededRandom } from './harness.mjs'
import { calculateCashVsLoan } from '../../src/utils/cashVsLoanCalculations.js'
import { cashVsLoanSchema, validateCashVsLoanCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Cash vs Loan')

const input = ([assetValue, downPayment, loanRatePercent, tenureYears, investmentReturnPercent, taxOnGainsPercent, inflationPercent]) => ({
  assetValue, downPayment, loanRatePercent, tenureYears, investmentReturnPercent, taxOnGainsPercent, inflationPercent,
})

// summary: [net, inflation-adjusted net, loan amount, EMI, interest, total paid, final value, post-tax gain]
// loanRows: [year, opening, principal, interest, closing]; investRows: [year, opening, growth, closing]
const REFERENCE = [
  {
    name: 'TC1', values: [1285000, 235000, 9.35, 5, 11.7, 12.5, 5.4], verdict: 'borrow',
    summary: [410328, 315448, 1050000, 21975, 268504, 1318504, 1825808, 678832],
    loanRows: [[1, 1050000, 172807, 90894, 877193], [2, 877193, 189675, 74026, 687518], [5, 250817, 250817, 12884, 0]],
    investRows: [[1, 1050000, 122850, 1172850], [2, 1172850, 137223, 1310073], [5, 1634564, 191244, 1825808]],
  },
  {
    name: 'TC2 return below loan rate', values: [2460000, 610000, 10.85, 7, 7.9, 20, 6.2], verdict: 'borrow',
    summary: [241479, 158492, 1850000, 31531, 798586, 2648586, 3150082, 1040065],
    loanRows: [[1, 1850000, 186750, 191619, 1663250], [2, 1663250, 208051, 170318, 1455198], [7, 357040, 357040, 21330, 0]],
    investRows: [[1, 1850000, 146150, 1996150], [7, 2919446, 230636, 3150082]],
  },
  {
    name: 'TC3 no down payment, tax or inflation', values: [875500, 0, 8.6, 3, 13.4, 0, 0], verdict: 'borrow',
    summary: [280312, 280312, 875500, 27678, 120907, 996407, 1276719, 401219],
    loanRows: [[1, 875500, 267212, 64923, 608288], [2, 608288, 291120, 41015, 317167], [3, 317167, 317167, 14968, 0]],
    investRows: [[1, 875500, 117317, 992817], [2, 992817, 133037, 1125854], [3, 1125854, 150865, 1276719]],
  },
  {
    name: 'TC4 15 years', values: [5390000, 1275000, 8.15, 15, 12.35, 12.5, 4.75], verdict: 'borrow',
    summary: [14024137, 6991425, 4115000, 39682, 3027805, 7142805, 23602934, 17051942],
    loanRows: [[1, 4115000, 146195, 329992, 3968805], [2, 3968805, 158566, 317621, 3810239], [15, 455815, 455815, 20372, 0]],
    investRows: [[1, 4115000, 508203, 4623203], [15, 21008397, 2594537, 23602934]],
  },
  {
    name: 'F1 fresh', values: [3125750, 480250, 8.95, 9, 10.65, 12.5, 5.8], verdict: 'borrow',
    summary: [2224297, 1339127, 2645500, 35758, 1216331, 3861831, 6577647, 3440628],
    loanRows: [[9, 408995, 408995, 20098, 0]], investRows: [],
  },
  {
    name: 'F2 fresh', values: [1999999, 750001, 12.4, 6, 9.3, 30, 6.6], verdict: 'borrow',
    summary: [88569, 60358, 1249998, 24698, 528293, 1778291, 2131230, 616862],
    loanRows: [[6, 277399, 277399, 18983, 0]], investRows: [],
  },
]

for (const { name, values, verdict, summary, loanRows, investRows } of REFERENCE) {
  const r = calculateCashVsLoan(input(values))
  const [net, realNet, loanAmount, emi, interest, totalPaid, finalValue, postTaxGain] = summary
  t.rupees(`${name} net result`, r.netResult, net)
  t.rupees(`${name} in today's money`, r.inflationAdjustedNetResult, realNet)
  t.rupees(`${name} loan amount`, r.loanAmount, loanAmount)
  t.rupees(`${name} EMI`, r.emi, emi)
  t.rupees(`${name} total interest`, r.totalInterest, interest)
  t.rupees(`${name} total loan payment`, r.totalLoanPayment, totalPaid)
  t.rupees(`${name} investment final value`, r.investmentFinalValue, finalValue)
  t.rupees(`${name} post-tax gain`, r.postTaxGain, postTaxGain)
  t.equal(`${name} verdict`, r.verdict, verdict)
  for (const [year, opening, principal, interestPaid, closing] of loanRows) {
    const row = r.loanProjection[year - 1]
    t.rupees(`${name} loan year ${year} opening`, row.openingBalance, opening)
    t.rupees(`${name} loan year ${year} principal`, row.principal, principal)
    t.rupees(`${name} loan year ${year} interest`, row.interest, interestPaid)
    t.rupees(`${name} loan year ${year} closing`, row.closingBalance, closing)
  }
  for (const [year, opening, growth, closing] of investRows) {
    const row = r.investmentProjection[year - 1]
    t.rupees(`${name} investment year ${year} opening`, row.openingValue, opening)
    t.rupees(`${name} investment year ${year} growth`, row.growth, growth)
    t.rupees(`${name} investment year ${year} closing`, row.closingValue, closing)
  }
}

// Borrowing loses
const d1 = calculateCashVsLoan(input([1640000, 400000, 11.25, 6, 5.1, 20, 5.5]))
t.rupees('D1 net loss', d1.netResult, -125827)
t.rupees('D1 in today\'s money', d1.inflationAdjustedNetResult, -91256)
t.rupees('D1 interest', d1.totalInterest, 470817)
t.rupees('D1 post-tax gain', d1.postTaxGain, 344989)
t.equal('D1 verdict: pay cash', d1.verdict, 'cash')

const d4 = calculateCashVsLoan(input([600000, 100000, 9, 4, 0, 10, 4]))
t.rupees('D4 0% return: no gain', d4.postTaxGain, 0)
t.rupees('D4 net equals minus interest', d4.netResult, -97241)
t.rupees('D4 in today\'s money', d4.inflationAdjustedNetResult, -83122)

const d11 = calculateCashVsLoan(input([333333, 33333, 13.75, 1, 15.5, 30, 7.25]))
t.rupees('D11 one year net', d11.netResult, 9740)
t.rupees('D11 in today\'s money', d11.inflationAdjustedNetResult, 9081)
t.rupees('D11 EMI', d11.emi, 26901)
t.rupees('D11 interest', d11.totalInterest, 22810)
t.rupees('D11 post-tax gain', d11.postTaxGain, 32550)

// 0% loan: the reference shows NaN; with no interest the net result is the post-tax gain
const free = calculateCashVsLoan(input([600000, 100000, 0, 4, 10, 10, 4]))
t.rupees('0% loan EMI', free.emi, 10417)
t.rupees('0% loan interest', free.totalInterest, 0)
t.rupees('0% loan net result = post-tax gain', free.netResult, 208845)

// Additional values: net = post-tax gain - interest; tax only on positive gains
const random = seededRandom(3141)
for (let n = 0; n < 60; n++) {
  const assetValue = Math.round(100000 + random() * 20000000)
  const downPayment = Math.round(random() * assetValue * 0.9)
  const values = [assetValue, downPayment, Math.round(random() * 1800) / 100, 1 + Math.floor(random() * 30), Math.round(random() * 1600) / 100, Math.round(random() * 4000) / 100, Math.round(random() * 800) / 100]
  const r = calculateCashVsLoan(input(values))
  t.close(`random ${n}: net = post-tax gain - interest`, r.netResult, r.postTaxGain - r.totalInterest, 1e-6)
  t.close(`random ${n}: investment = lump sum compounded annually`, r.investmentFinalValue, r.loanAmount * Math.pow(1 + values[4] / 100, values[3]), 1e-6 * r.investmentFinalValue)
  t.ok(`random ${n}: tax never negative`, r.taxOnGains >= 0)
  t.rupees(`random ${n}: loan closes`, r.loanProjection.at(-1).closingBalance, 0)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => {
  const fieldErrors = validateFields(values, cashVsLoanSchema)
  return { ...validateCashVsLoanCross(values, fieldErrors), ...fieldErrors }
}
const valid = { assetValue: '1000000', downPayment: '200000', loanRate: '9', tenureYears: '5', investmentReturn: '12', taxOnGains: '', inflation: '' }
t.equal('valid form, tax and inflation blank', v(valid), {})
t.equal('0% loan rate accepted', v({ ...valid, loanRate: '0' }), {})
t.equal('down payment equal to price', v({ ...valid, downPayment: '1000000' }).downPayment, 'Down payment must be less than the asset value, otherwise there is no loan to compare')
t.equal('fractional tenure', v({ ...valid, tenureYears: '3.5' }).tenureYears, 'Loan tenure must be a whole number')
t.equal('tenure 0', v({ ...valid, tenureYears: '0' }).tenureYears, 'Loan tenure must be greater than zero')
t.equal('tax above 100%', v({ ...valid, taxOnGains: '120' }).taxOnGains, 'Tax on investment gains must be at most 100%')
