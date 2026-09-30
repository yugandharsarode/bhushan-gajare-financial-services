import { suite, seededRandom } from './harness.mjs'
import {
  calculateSwpResults,
  calculateSwpAccumulationCorpus,
  simulateSwpWithdrawal,
  SWP_MAX_MONTHS,
} from '../../src/utils/financialCalculations.js'
import { swpSchema, validateSwpCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('SWP Calculator')

// Accumulation phase: [lumpSum, monthlySip, years, return%] → corpus (rounded to the rupee)
const CORPUS = [
  ['TC1', [345000, 7350, 13, 11.7], 4027609],
  ['TC2', [0, 12480, 9, 10.35], 2177811],
  ['TC3', [875000, 0, 7, 9.3], 1630607],
  ['calc.txt Ex1', [100000, 1500, 10, 11], 602587],
  ['calc.txt Ex2', [56000, 2653, 8, 9.3], 486642],
  ['calc.txt Ex3', [97579, 677, 9, 7.93], 299373],
  ['E5 one year', [0, 10000, 1, 12], 127665],
  ['F1 fresh', [215500, 4321, 12, 10.8], 1968354],
]
for (const [name, [lumpSum, monthlySip, years, annualReturnPercent], corpus] of CORPUS) {
  const r = calculateSwpAccumulationCorpus({ lumpSum, monthlySip, years, annualReturnPercent })
  t.equal(`${name} corpus for SWP`, r.corpusForSwp, corpus)
}

// Withdrawal phase, full calculator: rows are [month, start, withdrawal, returns, end]
const FULL = [
  {
    name: 'TC1',
    input: { lumpSum: 345000, monthlySip: 7350, years: 13, accumulationReturnPercent: 11.7, monthlyWithdrawal: 42500, annualStepUpPercent: 5.5, swpReturnPercent: 7.3 },
    months: 105,
    rows: [[1, 4027609, 42500, 23468, 4008577], [2, 4008577, 42500, 23355, 3989432], [3, 3989432, 42500, 23243, 3970175]],
    lastStart: 18173,
  },
  {
    name: 'TC2 step-up 0',
    input: { lumpSum: 0, monthlySip: 12480, years: 9, accumulationReturnPercent: 10.35, monthlyWithdrawal: 18750, annualStepUpPercent: 0, swpReturnPercent: 6.8 },
    months: 184,
    rows: [[1, 2177811, 18750, 11869, 2170930], [2, 2170930, 18750, 11831, 2164011], [3, 2164011, 18750, 11793, 2157055]],
    lastStart: 15982,
  },
  {
    name: 'TC3 SIP 0',
    input: { lumpSum: 875000, monthlySip: 0, years: 7, accumulationReturnPercent: 9.3, monthlyWithdrawal: 13999, annualStepUpPercent: 8.25, swpReturnPercent: 8.9 },
    months: 125,
    rows: [[1, 1630607, 13999, 11527, 1628135], [2, 1628135, 13999, 11509, 1625645], [3, 1625645, 13999, 11491, 1623138]],
    lastStart: 12445,
  },
  {
    name: 'calc.txt Ex1',
    input: { lumpSum: 100000, monthlySip: 1500, years: 10, accumulationReturnPercent: 11, monthlyWithdrawal: 50000, annualStepUpPercent: 6, swpReturnPercent: 8 },
    months: 13,
    rows: [[1, 602587, 50000, 3555, 556142], [12, 74939, 50000, 160, 25100]],
    lastStart: 25100,
  },
  {
    name: 'calc.txt Ex2',
    input: { lumpSum: 56000, monthlySip: 2653, years: 8, accumulationReturnPercent: 9.3, monthlyWithdrawal: 20000, annualStepUpPercent: 7, swpReturnPercent: 8 },
    months: 26,
    rows: [
      [1, 486642, 20000, 3002, 469644], [2, 469644, 20000, 2893, 452537], [3, 452537, 20000, 2783, 435320],
      [4, 435320, 20000, 2672, 417993], [5, 417993, 20000, 2561, 400553], [6, 400553, 20000, 2448, 383002],
      [25, 29522, 22898, 43, 6667],
    ],
    lastStart: 6667,
  },
  {
    name: 'calc.txt Ex3',
    input: { lumpSum: 97579, monthlySip: 677, years: 9, accumulationReturnPercent: 7.93, monthlyWithdrawal: 2982, annualStepUpPercent: 4, swpReturnPercent: 7 },
    months: 117,
    rows: [
      [1, 299373, 2982, 1676, 298067], [2, 298067, 2982, 1668, 296753], [3, 296753, 2982, 1661, 295432],
      [4, 295432, 2982, 1654, 294104], [5, 294104, 2982, 1646, 292768], [6, 292768, 2982, 1638, 291424],
      [7, 291424, 2982, 1631, 290073], [116, 7700, 4244, 20, 3475],
    ],
    lastStart: 3475,
  },
  {
    name: 'F1 fresh',
    input: { lumpSum: 215500, monthlySip: 4321, years: 12, accumulationReturnPercent: 10.8, monthlyWithdrawal: 27650, annualStepUpPercent: 4.75, swpReturnPercent: 7.65 },
    months: 80,
    rows: [[1, 1968354, 27650, 11958, 1952662]],
    lastStart: 11431,
  },
]

function checkSchedule(name, result, months, rows, lastStart) {
  t.equal(`${name} corpus lasts`, result.corpusLastsMonths, months)
  t.ok(`${name} corpus fully used`, !result.lastsBeyondSchedule && result.corpusAtEnd === 0)
  for (const [month, start, withdrawal, returns, end] of rows) {
    const row = result.schedule[month - 1]
    t.rupees(`${name} month ${month} start`, row.startBalance, start)
    t.rupees(`${name} month ${month} withdrawal`, row.withdrawal, withdrawal)
    t.rupees(`${name} month ${month} returns`, row.returns, returns)
    t.rupees(`${name} month ${month} end`, row.endBalance, end)
  }
  const last = result.schedule.at(-1)
  t.rupees(`${name} final month start`, last.startBalance, lastStart)
  // The reference shows the full scheduled withdrawal here; we show what was actually left
  t.close(`${name} final month withdraws what is left`, last.withdrawal, last.startBalance, 1e-9)
  t.rupees(`${name} final month ends at 0`, last.endBalance, 0)
}

for (const { name, input, months, rows, lastStart } of FULL) {
  checkSchedule(name, calculateSwpResults(input), months, rows, lastStart)
}

// Corpus entered directly (reference TC4, F2 and edge cases)
const direct = (corpus, monthlyWithdrawal, annualStepUpPercent, swpReturnPercent) =>
  simulateSwpWithdrawal({ corpus, monthlyWithdrawal, annualStepUpPercent, swpReturnPercent })

checkSchedule('TC4 direct corpus', direct(2500000, 31234, 3.3, 6.1), 90,
  [[1, 2500000, 31234, 12212, 2480978], [2, 2480978, 31234, 12118, 2461861], [3, 2461861, 31234, 12023, 2442651]], 17846)
checkSchedule('F2 direct corpus', direct(5876543, 36125, 6.4, 8.35), 193, [[1, 5876543, 36125, 39162, 5879580]], 72827)

const e3 = direct(500000, 10000, 50, 0)
t.equal('E3 step-up applies from months 13 and 25', [e3.schedule[11].withdrawal, e3.schedule[12].withdrawal, e3.schedule[24].withdrawal].map(Math.round), [10000, 15000, 22500])
t.rupees('E3 final month withdraws the ₹20,000 left (reference shows ₹22,500 scheduled)', e3.schedule[32].withdrawal, 20000)
t.equal('E3 lasts 33 months', e3.corpusLastsMonths, 33)
t.equal('E1 partial final month counts', direct(100000, 30000, 0, 0).corpusLastsMonths, 4)
t.equal('E2 exact depletion', direct(120000, 30000, 0, 0).corpusLastsMonths, 4)
t.equal('E7 withdrawal larger than corpus lasts 1 month', direct(25000, 40000, 5, 9).corpusLastsMonths, 1)
t.equal('X2 597 months', direct(1000000, 6535, 0, 8).corpusLastsMonths, 597)

// Beyond 50 years: the reference says "Infinite"; we report that it lasts beyond the schedule
const e4 = direct(1000000, 1000, 0, 8)
t.ok('E4 lasts beyond 600 months', e4.lastsBeyondSchedule && e4.corpusLastsMonths === SWP_MAX_MONTHS)
t.rupees('E4 corpus left after 600 months', e4.corpusAtEnd, 39721518)
const x2b = direct(1000000, 6510, 0, 8)
t.ok('X2b lasts beyond 600 months', x2b.lastsBeyondSchedule)
t.rupees('X2b corpus left after 600 months', x2b.corpusAtEnd, 159197)

// Whole years only: the reference uses 2.5 years as-is (₹1,67,599); our form requires whole years
t.equal('E6 2.5 years treated as 2', calculateSwpAccumulationCorpus({ lumpSum: 100000, monthlySip: 1000, years: 2.5, annualReturnPercent: 12 }).corpusForSwp, 152505)

// 0% accumulation return: the reference shows NaN; the correct corpus is the amount invested
t.equal('0% accumulation return', calculateSwpAccumulationCorpus({ lumpSum: 100000, monthlySip: 1000, years: 5, annualReturnPercent: 0 }).corpusForSwp, 160000)

// Additional values: money is conserved and no invalid numbers appear
const random = seededRandom(4242)
for (let n = 0; n < 60; n++) {
  const corpus = Math.round(100000 + random() * 20000000)
  const monthlyWithdrawal = Math.round(1000 + random() * corpus * 0.02)
  const annualStepUpPercent = Math.round(random() * 1500) / 100
  const swpReturnPercent = Math.round(random() * 1400) / 100
  const r = direct(corpus, monthlyWithdrawal, annualStepUpPercent, swpReturnPercent)
  const returns = r.schedule.reduce((sum, row) => sum + row.returns, 0)
  t.close(`random ${n}: corpus + returns = withdrawals + balance left`, corpus + returns, r.totalWithdrawn + r.corpusAtEnd, 1e-6 * (corpus + returns))
  t.ok(`random ${n}: balances never negative`, r.schedule.every((row) => row.endBalance >= 0 && row.withdrawal >= 0))
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => {
  const fieldErrors = validateFields(values, swpSchema)
  return { ...validateSwpCross(values, fieldErrors), ...fieldErrors }
}
const valid = { lumpSum: '1000000', monthlySip: '0', years: '10', accumulationReturn: '12', monthlyWithdrawal: '50000', annualStepUp: '0', swpReturn: '8' }
t.equal('lump sum only, 0% step-up accepted', v(valid), {})
t.equal('0% SWP return accepted', v({ ...valid, swpReturn: '0' }), {})
t.equal('no lump sum and no SIP', v({ ...valid, lumpSum: '' }).monthlySip, 'Enter a monthly SIP or a lump sum investment to build the corpus')
t.equal('withdrawal required', v({ ...valid, monthlyWithdrawal: '' }).monthlyWithdrawal, 'Monthly withdrawal is required')
t.equal('withdrawal 0 rejected', v({ ...valid, monthlyWithdrawal: '0' }).monthlyWithdrawal, 'Monthly withdrawal must be greater than zero')
t.equal('fractional duration rejected', v({ ...valid, years: '2.5' }).years, 'Investment duration must be a whole number')
