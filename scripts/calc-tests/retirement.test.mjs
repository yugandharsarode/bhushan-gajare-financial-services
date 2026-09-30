import { suite, seededRandom } from './harness.mjs'
import {
  calculateRetirementResults,
  simulateStepUpSip,
  getMonthlyRate,
} from '../../src/utils/financialCalculations.js'
import { retirementSchema, validateRetirementCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Retirement Planning Calculator')

const input = ([expenses, preInfl, currentAge, retirementAge, lifeExpectancy, preReturn, stepUp, lumpSum, postReturn, postInfl]) => ({
  currentAnnualExpenses: expenses,
  preRetirementInflationPercent: preInfl,
  currentAge,
  retirementAge,
  lifeExpectancy,
  preRetirementReturnPercent: preReturn,
  stepUpSipPercent: stepUp,
  lumpSumSaved: lumpSum,
  postRetirementReturnPercent: postReturn,
  postRetirementInflationPercent: postInfl,
})

// [expenses at retirement, corpus, FV of savings, additional corpus, fixed SIP, step-up SIP]
const REFERENCE = [
  ['calc.txt Ex1', [1200000, 6, 35, 55, 100, 12, 10, 10000, 7, 5], [3848563, 117813333, 96463, 117716870, 127973, 63182]],
  ['calc.txt Ex2', [340000, 6, 28, 48, 80, 12.8, 5, 5000, 6, 7], [1090426, 40512099, 55610, 40456490, 39917, 29076]],
  ['A1', [735450, 5.7, 31, 58, 87, 11.3, 7.5, 243600, 6.4, 4.9], [3285321, 78651984, 4385779, 74266205, 38792, 20244]],
  ['A2 step-up 0, no savings', [486250, 6.3, 42, 61, 84, 10.7, 0, 0, 7.9, 6.2], [1552357, 30148119, 0, 30148119, 43109, 43109]],
  ['A3 inflation above return', [1865000, 7.2, 29, 52, 91, 13.4, 12.5, 1575000, 5.6, 6.8], [9229090, 449747823, 28404086, 421343737, 257851, 97696]],
  ['A4', [295700, 4.8, 38, 63, 79, 9.6, 6, 0, 8.3, 5.1], [954736, 12315536, 0, 12315536, 10540, 6276]],
  ['F1 fresh', [987650, 6.7, 37, 59, 88, 11.9, 9, 321000, 7.4, 5.6], [4113583, 95101382, 3808614, 91292768, 78361, 39855]],
  ['F2 fresh', [543210, 5.2, 44, 58, 76, 8.8, 4.5, 0, 6.1, 6.9], [1104557, 21208996, 0, 21208996, 65817, 51664]],
  ['AX1 0% pre-retirement return', [600000, 6, 40, 50, 70, 0, 5, 50000, 7, 5], [null, 18070069, 50000, 18020069, 150167, 119383]],
  ['AX2 post return = post inflation', [600000, 6, 40, 50, 70, 10, 5, 0, 6, 6], [null, 21490172, 0, 21490172, 106673, 88094]],
  ['AX10 0% post-retirement return', [600000, 6, 40, 50, 70, 10, 5, 0, 0, 5], [null, 35529653, 0, 35529653, 176363, 145646]],
  ['AX13 partial savings', [600000, 6, 40, 50, 70, 10, 5, 2000000, 7, 5], [null, 18070069, 5187485, 12882584, 63947, 52809]],
]

for (const [name, values, expected] of REFERENCE) {
  const r = calculateRetirementResults(input(values))
  const [expensesAtRetirement, corpus, fvSavings, additional, fixed, step] = expected
  if (expensesAtRetirement !== null) t.rupees(`${name} expenses at retirement`, r.annualExpensesAtRetirement, expensesAtRetirement)
  t.rupees(`${name} corpus needed`, r.totalRetirementCorpusNeeded, corpus)
  t.rupees(`${name} FV of savings`, r.futureValueOfCurrentSavings, fvSavings)
  t.rupees(`${name} additional corpus`, r.additionalCorpusNeeded, additional)
  t.rupees(`${name} fixed SIP`, r.monthlySipRequiredFixed, fixed)
  t.rupees(`${name} step-up SIP`, r.stepUpSipStartingAmount, step)
  t.rupees(`${name} no surplus`, r.surplusAtRetirement, 0)
}

// Savings already exceed the corpus: additional corpus is 0 (was negative before the fix)
const ax6 = calculateRetirementResults(input([600000, 6, 40, 50, 70, 10, 5, 50000000, 7, 5]))
t.rupees('AX6 FV of savings', ax6.futureValueOfCurrentSavings, 129687123)
t.rupees('AX6 additional corpus is 0, not negative', ax6.additionalCorpusNeeded, 0)
t.rupees('AX6 surplus reported', ax6.surplusAtRetirement, 129687123 - 18070069)
t.rupees('AX6 fixed SIP 0', ax6.monthlySipRequiredFixed, 0)
t.rupees('AX6 step-up SIP 0', ax6.stepUpSipStartingAmount, 0)

// Savings exactly equal to the corpus
const exactCover = calculateRetirementResults(input([600000, 6, 40, 50, 70, 0, 5, 18070069.35, 7, 5]))
t.ok('savings equal to corpus: nothing more needed', exactCover.additionalCorpusNeeded < 1 && exactCover.monthlySipRequiredFixed < 0.01)

// One year to retirement: no step-up can happen, so the step-up SIP is the fixed SIP.
// The reference's search gives ₹8,46,165 against its fixed SIP of ₹8,46,139.
const ax8 = calculateRetirementResults(input([600000, 6, 49, 50, 70, 10, 10, 0, 7, 5]))
t.rupees('AX8 corpus', ax8.totalRetirementCorpusNeeded, 10695646)
t.rupees('AX8 fixed SIP', ax8.monthlySipRequiredFixed, 846139)
t.paise('AX8 step-up SIP equals fixed SIP', ax8.stepUpSipStartingAmount, ax8.monthlySipRequiredFixed)

// One retirement year: the corpus is exactly the first year's expense (withdrawn at the start)
const oneYear = calculateRetirementResults(input([600000, 6, 40, 50, 51, 10, 5, 0, 7, 5]))
t.close('one retirement year: corpus equals year-1 expense', oneYear.totalRetirementCorpusNeeded, oneYear.annualExpensesAtRetirement, 1e-6)

// Additional values: corpus funds exactly the planned withdrawals; SIPs reach the additional corpus
const random = seededRandom(2718)
for (let n = 0; n < 60; n++) {
  const currentAge = 20 + Math.floor(random() * 35)
  const retirementAge = currentAge + 2 + Math.floor(random() * 25)
  const lifeExpectancy = retirementAge + 1 + Math.floor(random() * 35)
  const values = [
    Math.round(100000 + random() * 3000000), Math.round(random() * 900) / 100, currentAge, retirementAge, lifeExpectancy,
    Math.round(random() * 1500) / 100, Math.round(random() * 1500) / 100, random() < 0.5 ? 0 : Math.round(random() * 5000000),
    Math.round(random() * 1000) / 100, Math.round(random() * 800) / 100,
  ]
  const r = calculateRetirementResults(input(values))
  const [, , , , , preReturn, stepUp, , postReturn, postInfl] = values

  // Withdraw each year's expense at the start of the year; the corpus should end at ~0
  let balance = r.totalRetirementCorpusNeeded
  for (let year = 0; year < lifeExpectancy - retirementAge; year++) {
    balance = (balance - r.annualExpensesAtRetirement * Math.pow(1 + postInfl / 100, year)) * (1 + postReturn / 100)
  }
  t.close(`random ${n}: corpus runs out exactly at life expectancy`, balance, 0, 1e-6 * r.totalRetirementCorpusNeeded)

  const i = getMonthlyRate(preReturn)
  let sipBalance = 0
  for (let m = 0; m < (retirementAge - currentAge) * 12; m++) sipBalance = (sipBalance + r.monthlySipRequiredFixed) * (1 + i)
  t.close(`random ${n}: fixed SIP reaches additional corpus`, sipBalance, r.additionalCorpusNeeded, Math.max(1, 1e-5 * r.additionalCorpusNeeded))

  const stepBalance = simulateStepUpSip({ initialMonthlyAmount: r.stepUpSipStartingAmount, annualReturnPercent: preReturn, years: retirementAge - currentAge, annualStepUpPercent: stepUp }).balance
  t.close(`random ${n}: step-up SIP reaches additional corpus (±0.05%)`, stepBalance, r.additionalCorpusNeeded, Math.max(2, 5e-4 * r.additionalCorpusNeeded))
  t.ok(`random ${n}: additional corpus and surplus never negative`, r.additionalCorpusNeeded >= 0 && r.surplusAtRetirement >= 0)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => {
  const fieldErrors = validateFields(values, retirementSchema)
  return { ...validateRetirementCross(values, fieldErrors), ...fieldErrors }
}
const valid = {
  currentAnnualExpenses: '600000', preRetirementInflation: '6', currentAge: '35', retirementAge: '60', lifeExpectancy: '85',
  preRetirementReturn: '12', stepUpSipPercent: '10', lumpSumSaved: '', postRetirementReturn: '7', postRetirementInflation: '5',
}
t.equal('valid form', v(valid), {})
t.equal('0% rates and step-up accepted', v({ ...valid, preRetirementInflation: '0', preRetirementReturn: '0', stepUpSipPercent: '0', postRetirementReturn: '0', postRetirementInflation: '0' }), {})
t.equal('retirement age not after current age', v({ ...valid, retirementAge: '35' }).retirementAge, 'Retirement age must be greater than current age')
t.equal('life expectancy not after retirement', v({ ...valid, lifeExpectancy: '60' }).lifeExpectancy, 'Life expectancy must be greater than retirement age')
t.equal('fractional age rejected', v({ ...valid, currentAge: '35.5' }).currentAge, 'Current age must be a whole number')
t.equal('negative step-up rejected', v({ ...valid, stepUpSipPercent: '-5' }).stepUpSipPercent, 'Step-up SIP increase rate cannot be negative')
t.equal('expenses required', v({ ...valid, currentAnnualExpenses: '' }).currentAnnualExpenses, 'Current annual expenses is required')
