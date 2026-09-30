import { suite, seededRandom } from './harness.mjs'
import { calculateLoanSummary, calculateEmi, summarizeScheduleByYear } from '../../src/utils/loanCalculations.js'
import { loanEmiSchema, validateLoanEmiCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Loan EMI Calculator')

const sumRows = (schedule, from, to, key) =>
  schedule.slice(from - 1, to).reduce((sum, row) => sum + row[key], 0)

// [principal, rate%, months] → EMI, annual payment (EMI x 12), total interest, total payment,
// schedule rows [emiNo, interest, principal, balance], period sums [from, to, interest, principal]
const REFERENCE = [
  {
    name: 'TC1 (17 y 5 m)', input: [3847500, 8.65, 209], emi: 35688, annual: 428257, interest: 3611313, total: 7458813,
    rows: [[1, 27734, 7954, 3839546], [2, 27677, 8011, 3831535], [3, 27619, 8069, 3823465], [209, 255, 35433, 0]],
    period: [13, 36, 630238, 226276],
  },
  {
    name: 'TC2 (4 y)', input: [735000, 11.35, 48], emi: 19122, annual: 229460, interest: 182838, total: 917838,
    rows: [[1, 6952, 12170, 722830], [2, 6837, 12285, 710545], [3, 6721, 12401, 698144], [48, 179, 18942, 0]],
    period: [1, 12, 75581, 153879],
  },
  {
    name: 'TC3 (months only)', input: [1265430, 9.85, 83], emi: 21085, annual: 253020, interest: 484627, total: 1750057,
    rows: [[1, 10387, 10698, 1254732], [2, 10299, 10786, 1243946], [3, 10211, 10874, 1233072], [83, 172, 20913, 0]],
    period: [40, 83, 151703, 776038],
  },
  {
    name: 'TC4 (25 y)', input: [12345678, 7.35, 300], emi: 90032, annual: 1080388, interest: 14664023, total: 27009701,
    rows: [[1, 75617, 14415, 12331263], [2, 75529, 14503, 12316760], [3, 75440, 14592, 12302167], [300, 548, 89484, 0]],
    period: [100, 300, 7705112, 10391388],
  },
  {
    name: 'F1 fresh', input: [4672300, 10.35, 273], emi: 44573, annual: 534873, interest: 7496068, total: 12168368,
    rows: [[1, 40299, 4274, 4668026], [273, 381, 44192, 0]],
    period: [49, 96, 1757690, 381804],
  },
  {
    name: 'F2 fresh', input: [189990, 14.85, 16], emi: 13162, annual: 157941, interest: 20599, total: 210589,
    rows: [[16, 161, 13001, 0]],
    period: [5, 16, 12003, 145938],
  },
]

for (const { name, input: [principal, annualRatePercent, months], emi, annual, interest, total, rows, period } of REFERENCE) {
  const r = calculateLoanSummary({ principal, annualRatePercent, months })
  t.rupees(`${name} EMI`, r.emi, emi)
  t.rupees(`${name} annual payment`, r.emi * 12, annual)
  t.rupees(`${name} total interest`, r.totalInterest, interest)
  t.rupees(`${name} total payment`, r.totalPayment, total)
  t.equal(`${name} ${months} schedule rows`, r.schedule.length, months)
  for (const [emiNo, rowInterest, rowPrincipal, balance] of rows) {
    const row = r.schedule[emiNo - 1]
    t.rupees(`${name} EMI ${emiNo} payment`, row.payment, emi)
    t.rupees(`${name} EMI ${emiNo} interest`, row.interest, rowInterest)
    t.rupees(`${name} EMI ${emiNo} principal`, row.principal, rowPrincipal)
    t.rupees(`${name} EMI ${emiNo} balance`, row.balance, balance)
  }
  const [from, to, periodInterest, periodPrincipal] = period
  t.rupees(`${name} interest paid EMI ${from}-${to}`, sumRows(r.schedule, from, to, 'interest'), periodInterest)
  t.rupees(`${name} principal repaid EMI ${from}-${to}`, sumRows(r.schedule, from, to, 'principal'), periodPrincipal)
}

// Other reference cases: [principal, rate%, months] → [EMI, total interest]
const EXTRA = [
  ['D2 2 y + 15 m = 39 months', [856320, 10.15, 39], [25869, 152574]],
  ['D3 7 years (7.5 is read as 7)', [1000000, 9, 84], [16089, 351483]],
  ['D7 30 months', [640000, 10.5, 30], [24348, 90451]],
  ['D4 decimal principal', [1234567.89, 8.4, 63], [24301, 296413]],
  ['D5 one month', [250000, 12.5, 1], [252604, 2604]],
  ['D6 36% rate', [90000, 36, 23], [5473, 35885]],
  ['NEGMO 57 months', [800000, 9, 57], [17300, 186098]],
]
for (const [name, [principal, annualRatePercent, months], [emi, interest]] of EXTRA) {
  const r = calculateLoanSummary({ principal, annualRatePercent, months })
  t.rupees(`${name} EMI`, r.emi, emi)
  t.rupees(`${name} total interest`, r.totalInterest, interest)
}

// 0% loan: the reference rejects it; we repay in equal instalments
const free = calculateLoanSummary({ principal: 120000, annualRatePercent: 0, months: 12 })
t.rupees('0% loan EMI', free.emi, 10000)
t.rupees('0% loan interest', free.totalInterest, 0)
t.rupees('0% loan closes', free.schedule.at(-1).balance, 0)

// Yearly roll-up used by other calculators
const yearly = summarizeScheduleByYear(calculateLoanSummary({ principal: 3847500, annualRatePercent: 8.65, months: 209 }).schedule)
t.equal('yearly roll-up: 18 loan years (last one partial)', yearly.length, 18)
t.rupees('yearly roll-up: last year closes the loan', yearly.at(-1).closingBalance, 0)

// Additional values: schedule repays exactly the principal
const random = seededRandom(8080)
for (let n = 0; n < 80; n++) {
  const principal = Math.round(10000 + random() * 50000000)
  const annualRatePercent = Math.round(random() * 2000) / 100
  const months = 1 + Math.floor(random() * 480)
  const r = calculateLoanSummary({ principal, annualRatePercent, months })
  t.close(`random ${n}: principal repaid equals loan`, sumRows(r.schedule, 1, months, 'principal'), principal, 1e-6 * principal)
  t.close(`random ${n}: interest in schedule equals total interest`, sumRows(r.schedule, 1, months, 'interest'), r.totalInterest, 1e-6 * principal)
  t.ok(`random ${n}: balance never negative and ends at 0`, r.schedule.every((row) => row.balance >= 0) && r.schedule.at(-1).balance === 0)
  t.ok(`random ${n}: higher rate means higher EMI`, calculateEmi(principal, annualRatePercent + 1, months) > r.emi)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => {
  const fieldErrors = validateFields(values, loanEmiSchema)
  return { ...validateLoanEmiCross(values, fieldErrors), ...fieldErrors }
}
const valid = { loanAmount: '500000', interestRate: '9', tenureYears: '5', tenureMonths: '' }
t.equal('valid form', v(valid), {})
t.equal('months only', v({ ...valid, tenureYears: '', tenureMonths: '7' }), {})
t.equal('0% interest accepted', v({ ...valid, interestRate: '0' }), {})
t.equal('no tenure', v({ ...valid, tenureYears: '', tenureMonths: '' }).tenureYears, 'Enter a loan tenure of at least 1 month')
t.equal('months above 11', v({ ...valid, tenureMonths: '15' }).tenureMonths, 'Tenure (months) must be at most 11 months')
t.equal('fractional years', v({ ...valid, tenureYears: '7.5' }).tenureYears, 'Tenure (years) must be a whole number')
t.equal('rate above 50%', v({ ...valid, interestRate: '60' }).interestRate, 'Annual interest rate must be at most 50%')
t.equal('negative amount', v({ ...valid, loanAmount: '-500000' }).loanAmount, 'Loan amount cannot be negative')
t.equal('negative months', v({ ...valid, tenureMonths: '-3' }).tenureMonths, 'Tenure (months) cannot be negative')
