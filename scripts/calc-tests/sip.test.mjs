import { suite, seededRandom } from './harness.mjs'
import {
  calculateSipResults,
  buildSipYearlyProjection,
  getMonthlyRate,
} from '../../src/utils/financialCalculations.js'
import { sipSchema, validateSipCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('SIP Calculator')

// Reference cases: exact values displayed by the reference calculator
// [monthly, lumpSum, years, return%] → [invested, fvSips, fvLump, total, profit]
const REFERENCE = [
  ['TC1', [7350, 0, 13, 9.3], [1146600, 2167559, 0, 2167559, 1020959]],
  ['TC2', [12480, 235000, 17, 11.7], [2780920, 7560207, 1541600, 9101807, 6320887]],
  ['TC3', [4215, 86400, 7, 13.45], [440460, 571746, 208999, 780746, 340286]],
  ['TC4 (lump sum blank)', [25600, 0, 22, 8.15], [6758400, 18115244, 0, 18115244, 11356844]],
  ['X2 one year', [7350, 12345, 1, 9.3], [100545, 92583, 13493, 106076, 5531]],
  ['X4 large values', [99999, 10000000, 40, 15], [57999520, 2304644006, 2678635462, 4983279468, 4925279948]],
  ['X5 decimal amounts', [7350.75, 1000.5, 13, 9.3], [1147718, 2167780, 3179, 2170959, 1023242]],
  ['X6 lump sum only', [0, 100000, 10, 12], [100000, 0, 310585, 310585, 210585]],
  ['F1 fresh', [18275, 342500, 19, 10.65], [4509200, 12709174, 2342812, 15051987, 10542787]],
]

for (const [name, [monthlyAmount, lumpSum, years, annualReturnPercent], expected] of REFERENCE) {
  const r = calculateSipResults({ monthlyAmount, lumpSum, years, annualReturnPercent })
  const [invested, fvSips, fvLump, total, profit] = expected
  t.rupees(`${name} invested`, r.totalInvested, invested)
  t.rupees(`${name} FV of SIPs`, r.sipFutureValue, fvSips)
  t.rupees(`${name} FV of lump sum`, r.lumpSumFutureValue, fvLump)
  t.rupees(`${name} total corpus`, r.totalCorpus, total)
  t.rupees(`${name} profit`, r.estimatedProfit, profit)
}

t.rupees('Default case total', calculateSipResults({ monthlyAmount: 10000, lumpSum: 0, years: 10, annualReturnPercent: 12 }).totalCorpus, 2240359)

// Reference yearly table rows: [year, annual, cumulative, interestForYear, yearEnd]
const TABLES = [
  ['TC1', [7350, 0, 13, 9.3], [[1, 88200, 88200, 4383, 92583], [2, 88200, 176400, 12993, 193776], [3, 88200, 264600, 22404, 304379], [13, 88200, 1146600, 180936, 2167559]]],
  ['TC2', [12480, 235000, 17, 11.7], [[1, 149760, 384760, 36826, 421586], [2, 149760, 534520, 58656, 630002], [3, 149760, 684280, 83041, 862803], [17, 149760, 2780920, 946034, 9101807]]],
  ['TC3', [4215, 86400, 7, 13.45], [[1, 50580, 136980, 15235, 152215], [2, 50580, 187560, 24087, 226882], [3, 50580, 238140, 34130, 311591], [7, 50580, 440460, 89750, 780746]]],
  ['TC4', [25600, 0, 22, 8.15], [[1, 307200, 307200, 13399, 320599], [2, 307200, 614400, 39528, 667327], [3, 307200, 921600, 67786, 1042314], [22, 307200, 6758400, 1354373, 18115244]]],
  ['F1', [18275, 342500, 19, 10.65], [[1, 219300, 561800, 48932, 610732], [19, 219300, 4509200, 1438894, 15051987]]],
]

for (const [name, [monthlyAmount, lumpSum, years, annualReturnPercent], rows] of TABLES) {
  const table = buildSipYearlyProjection({ monthlyAmount, lumpSum, years, annualReturnPercent })
  t.equal(`${name} table has ${years} rows`, table.length, years)
  for (const [year, annual, cumulative, interest, yearEnd] of rows) {
    const row = table[year - 1]
    t.rupees(`${name} row ${year} annual investment`, row.annualInvestment, annual)
    t.rupees(`${name} row ${year} cumulative investment`, row.cumulativeInvestment, cumulative)
    t.rupees(`${name} row ${year} interest for the year`, row.interestEarned, interest)
    t.rupees(`${name} row ${year} year-end value`, row.portfolioValue, yearEnd)
  }
}

// Fractional years: the reference drops the fraction (our form also requires whole years)
const x3 = calculateSipResults({ monthlyAmount: 12480, lumpSum: 235000, years: 7.5, annualReturnPercent: 11.7 })
t.rupees('X3 7.5 years treated as 7: invested', x3.totalInvested, 1283320)
t.rupees('X3 7.5 years treated as 7: total', x3.totalCorpus, 2100159)
const f2 = calculateSipResults({ monthlyAmount: 2950, lumpSum: 15750, years: 11.9, annualReturnPercent: 7.25 })
t.rupees('F2 11.9 years treated as 11: total', f2.totalCorpus, 622208)
t.equal('F2 table rows match summary years', buildSipYearlyProjection({ monthlyAmount: 2950, lumpSum: 15750, years: 11.9, annualReturnPercent: 7.25 }).length, 11)

// 0% return: the reference shows NaN (a bug); the correct answer is the amount invested
const zero = calculateSipResults({ monthlyAmount: 5000, lumpSum: 50000, years: 6, annualReturnPercent: 0 })
t.rupees('0% return: total equals invested', zero.totalCorpus, 410000)
t.rupees('0% return: profit is zero', zero.estimatedProfit, 0)

// Additional values: closed form vs month-by-month simulation, and table consistency
const random = seededRandom(20260930)
for (let n = 0; n < 60; n++) {
  const monthlyAmount = Math.round(random() * 100000)
  const lumpSum = random() < 0.5 ? 0 : Math.round(random() * 5000000)
  const years = 1 + Math.floor(random() * 40)
  const annualReturnPercent = Math.round(random() * 2000) / 100
  const r = calculateSipResults({ monthlyAmount, lumpSum, years, annualReturnPercent })

  const i = getMonthlyRate(annualReturnPercent)
  let balance = lumpSum
  for (let m = 0; m < years * 12; m++) balance = (balance + monthlyAmount) * (1 + i)
  t.close(`random ${n}: closed form matches simulation`, r.totalCorpus, balance, Math.max(1e-6 * balance, 1e-6))

  const table = buildSipYearlyProjection({ monthlyAmount, lumpSum, years, annualReturnPercent })
  const interestSum = table.reduce((sum, row) => sum + row.interestEarned, 0)
  t.close(`random ${n}: yearly interest adds up to profit`, interestSum, r.estimatedProfit, 1e-4 * Math.max(1, r.totalCorpus))
  t.close(`random ${n}: last table row equals total`, table.at(-1).portfolioValue, r.totalCorpus, 1e-6 * Math.max(1, r.totalCorpus))
  t.finite(`random ${n}: no NaN/Infinity`, { r, table })
}

// Validation
const v = (values) => ({ ...validateSipCross(values, validateFields(values, sipSchema)), ...validateFields(values, sipSchema) })
const blank = { monthlyAmount: '', lumpSum: '', annualReturn: '', years: '' }
t.equal('blank form: required fields flagged', Object.keys(v(blank)).sort(), ['annualReturn', 'monthlyAmount', 'years'])
t.equal('negative amount', v({ ...blank, monthlyAmount: '-500', annualReturn: '12', years: '10' }).monthlyAmount, 'Monthly SIP amount cannot be negative')
t.equal('fractional years', v({ ...blank, monthlyAmount: '5000', annualReturn: '12', years: '7.5' }).years, 'Investment period must be a whole number')
t.equal('zero years', v({ ...blank, monthlyAmount: '5000', annualReturn: '12', years: '0' }).years, 'Investment period must be greater than zero')
t.equal('years above limit', v({ ...blank, monthlyAmount: '5000', annualReturn: '12', years: '101' }).years, 'Investment period must be at most 100 years')
t.equal('return above limit', v({ ...blank, monthlyAmount: '5000', annualReturn: '150', years: '10' }).annualReturn, 'Expected annual return must be at most 100%')
t.equal('non-numeric input', v({ ...blank, monthlyAmount: 'abc', annualReturn: '12', years: '10' }).monthlyAmount, 'Please enter a valid monthly SIP amount')
t.equal('SIP 0 without lump sum', v({ ...blank, monthlyAmount: '0', annualReturn: '12', years: '10' }).monthlyAmount, 'Enter a monthly SIP amount or a lump sum investment')
t.equal('SIP 0 with lump sum is valid', v({ monthlyAmount: '0', lumpSum: '100000', annualReturn: '12', years: '10' }), {})
t.equal('0% return is valid', v({ monthlyAmount: '5000', lumpSum: '', annualReturn: '0', years: '10' }), {})
t.ok('amount above ₹1 lakh crore rejected', v({ monthlyAmount: '2000000000000', lumpSum: '', annualReturn: '12', years: '10' }).monthlyAmount?.includes('at most'))
