import { suite, seededRandom } from './harness.mjs'
import {
  calculateGoalBasedSipResults,
  buildGoalBasedYearlyProjection,
  getMonthlyRate,
} from '../../src/utils/financialCalculations.js'
import { goalBasedSipSchema } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Goal Based SIP Calculator')

// [goal, lumpSum, years, return%] → [requiredSip (paise), fvLump, fvFromSips]
const REFERENCE = [
  ['TC1', [3750000, 0, 13, 9.3], [12715.92, 0, 3750000]],
  ['TC2', [12500000, 340000, 17, 11.7], [16952.53, 2230401, 10269599]],
  ['TC3', [865000, 115500, 7, 13.45], [4317.19, 279392, 585608]],
  ['TC4 (lump sum blank)', [24000000, 0, 22, 8.15], [33916.19, 0, 24000000]],
  ['Default', [5000000, 0, 10, 12], [22317.85, 0, 5000000]],
  ['X4 one year', [100000, 12345, 1, 9.3], [6867.65, 13493, 86507]],
  ['X5 large goal', [5000000000, 2500000, 40, 15], [187894.43, 669658866, 4330341134]],
  ['X6 decimal amounts', [3750000.75, 1000.5, 13, 9.3], [12705.14, 3179, 3746822]],
  ['X13 tiny SIP', [1000, 0, 30, 14], [0.22, 0, 1000]],
  ['F1 fresh', [8340000, 195750, 14, 10.35], [20812.05, 777167, 7562833]],
]

for (const [name, [targetAmount, lumpSum, years, annualReturnPercent], [sip, fvLump, fvSips]] of REFERENCE) {
  const r = calculateGoalBasedSipResults({ targetAmount, lumpSum, years, annualReturnPercent })
  t.paise(`${name} required SIP`, r.requiredMonthlySip, sip)
  t.rupees(`${name} FV of lump sum`, r.lumpSumFutureValue, fvLump)
  t.rupees(`${name} FV from SIPs`, r.sipFutureValue, fvSips)
  t.rupees(`${name} corpus reaches goal`, r.totalCorpus, Math.round(targetAmount))
}

// Reference table rows: [year, annual, cumulative, interestForYear, yearEnd]
const TABLES = [
  ['TC1', [3750000, 0, 13, 9.3], [[1, 152591, 152591, 7582, 160173], [2, 152591, 305182, 22478, 335243], [3, 152591, 457773, 38760, 526594], [13, 152591, 1983683, 313030, 3750000]]],
  ['TC2', [12500000, 340000, 17, 11.7], [[1, 203430, 543430, 52455, 595885], [2, 203430, 746861, 82393, 881708], [3, 203430, 950291, 115834, 1200973], [17, 203430, 3798315, 1299349, 12500000]]],
  ['TC3', [865000, 115500, 7, 13.45], [[1, 51806, 167306, 19236, 186543], [2, 51806, 219113, 28792, 267140], [3, 51806, 270919, 39632, 358579], [7, 51806, 478144, 99670, 865000]]],
  ['TC4', [24000000, 0, 22, 8.15], [[1, 406994, 406994, 17752, 424746], [2, 406994, 813988, 52369, 884109], [3, 406994, 1220983, 89807, 1380911], [22, 406994, 8953873, 1794343, 24000000]]],
  ['X4', [100000, 12345, 1, 9.3], [[1, 82412, 94757, 5243, 100000]]],
  ['X13', [1000, 0, 30, 14], [[1, 3, 3, 0, 3]]],
  ['F1', [8340000, 195750, 14, 10.35], [[1, 249745, 445495, 34051, 479545], [14, 249745, 3692174, 771302, 8340000]]],
]

for (const [name, [targetAmount, lumpSum, years, annualReturnPercent], rows] of TABLES) {
  const table = buildGoalBasedYearlyProjection({ targetAmount, lumpSum, years, annualReturnPercent })
  for (const [year, annual, cumulative, interest, yearEnd] of rows) {
    const row = table[year - 1]
    t.rupees(`${name} row ${year} annual investment`, row.annualInvestment, annual)
    t.rupees(`${name} row ${year} cumulative investment`, row.cumulativeInvestment, cumulative)
    t.rupees(`${name} row ${year} interest for the year`, row.interestEarned, interest)
    t.rupees(`${name} row ${year} year-end value`, row.portfolioValue, yearEnd)
  }
}

t.rupees('X13 last row reaches goal', buildGoalBasedYearlyProjection({ targetAmount: 1000, lumpSum: 0, years: 30, annualReturnPercent: 14 })[29].portfolioValue, 1000)

// Lump sum alone reaches the goal (reference shows "No additional SIP is required")
const x1 = calculateGoalBasedSipResults({ targetAmount: 500000, lumpSum: 300000, years: 10, annualReturnPercent: 12 })
t.ok('X1 lump sum covers goal', x1.lumpSumCoversGoal)
t.paise('X1 required SIP is 0', x1.requiredMonthlySip, 0)
t.rupees('X1 FV of lump sum', x1.lumpSumFutureValue, 931754)
t.rupees('X1 table year 1 value', buildGoalBasedYearlyProjection({ targetAmount: 500000, lumpSum: 300000, years: 10, annualReturnPercent: 12 })[0].portfolioValue, 336000)
const x15 = calculateGoalBasedSipResults({ targetAmount: 600000, lumpSum: 600000, years: 5, annualReturnPercent: 0 })
t.ok('X15 lump sum exactly equal to goal counts as covered', x15.lumpSumCoversGoal && x15.requiredMonthlySip === 0)

// Fractional years are dropped (reference behaviour); the form requires whole years
const f2 = calculateGoalBasedSipResults({ targetAmount: 1260000, lumpSum: 0, years: 4.8, annualReturnPercent: 6.85 })
t.paise('F2 4.8 years treated as 4', f2.requiredMonthlySip, 22861.86)
const f2Table = buildGoalBasedYearlyProjection({ targetAmount: 1260000, lumpSum: 0, years: 4.8, annualReturnPercent: 6.85 })
t.rupees('F2 table last row reaches goal', f2Table.at(-1).portfolioValue, 1260000)

// 0% return: the reference shows NaN; the correct SIP is the shortfall spread over the months
const x2 = calculateGoalBasedSipResults({ targetAmount: 600000, lumpSum: 60000, years: 5, annualReturnPercent: 0 })
t.paise('X2 0% return SIP', x2.requiredMonthlySip, 9000)
t.rupees('X2 0% return FV from SIPs', x2.sipFutureValue, 540000)

// Additional values: the required SIP, simulated month by month, reaches the goal
const random = seededRandom(7)
for (let n = 0; n < 60; n++) {
  const targetAmount = Math.round(100000 + random() * 50000000)
  const lumpSum = random() < 0.4 ? 0 : Math.round(random() * targetAmount * 0.5)
  const years = 1 + Math.floor(random() * 35)
  const annualReturnPercent = Math.round(random() * 1800) / 100
  const r = calculateGoalBasedSipResults({ targetAmount, lumpSum, years, annualReturnPercent })
  const i = getMonthlyRate(annualReturnPercent)
  let balance = lumpSum
  for (let m = 0; m < years * 12; m++) balance = (balance + r.requiredMonthlySip) * (1 + i)
  const expected = r.lumpSumCoversGoal ? r.lumpSumFutureValue : targetAmount
  t.close(`random ${n}: simulated corpus reaches goal`, balance, expected, 1e-6 * expected)
  t.ok(`random ${n}: SIP not negative`, r.requiredMonthlySip >= 0)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => validateFields(values, goalBasedSipSchema)
t.equal('blank form', Object.keys(v({ targetAmount: '', lumpSum: '', years: '', annualReturn: '' })).sort(), ['annualReturn', 'targetAmount', 'years'])
t.equal('goal 0', v({ targetAmount: '0', lumpSum: '', years: '10', annualReturn: '12' }).targetAmount, 'Target goal amount must be greater than zero')
t.equal('fractional years', v({ targetAmount: '100000', lumpSum: '', years: '4.8', annualReturn: '12' }).years, 'Investment period must be a whole number')
t.equal('0% return accepted', v({ targetAmount: '100000', lumpSum: '', years: '4', annualReturn: '0' }), {})
t.equal('negative lump sum', v({ targetAmount: '100000', lumpSum: '-1', years: '4', annualReturn: '8' }).lumpSum, 'Initial lump sum investment cannot be negative')
