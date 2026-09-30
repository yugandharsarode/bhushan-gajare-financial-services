import { suite, seededRandom } from './harness.mjs'
import {
  calculateGoalPlanningResults,
  simulateStepUpSip,
  solveInitialStepUpSip,
} from '../../src/utils/financialCalculations.js'
import { goalPlanningSchema } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Goal Planning Calculator')

// [return%, stepUp%, lumpSum, presentValue, years, inflation%] →
// [inflation-adjusted FV, lump sum FV, corpus from SIP, fixed SIP, initial step-up SIP]
// Reference cases with several goals are split per goal, with the lump sum on the goal the
// reference gave it to (a single-goal calculation gives that goal the whole lump sum).
const REFERENCE = [
  ['calc.txt Ex1', [12, 10, 10000, 2222, 4, 3.4], [2540, 15735, 0, 0, 0]],
  ['calc.txt Ex2', [8.4, 5, 55000, 1500, 8, 4.6], [2150, 104857, 0, 0, 0]],
  ['calc.txt Ex3', [11.4, 15, 122000, 20000, 7, 3.2], [24934, 259750, 0, 0, 0]],
  ['TC1 Car', [11.7, 8.5, 0, 735000, 13, 6.3], [1626372, 0, 1626372, 4644, 3085]],
  ['TC2 House (lump sum)', [9.3, 7, 125000, 2350000, 11, 5.2], [4104318, 332454, 3771864, 16780, 12432]],
  ['TC3 Vacation (lump sum covers)', [12.4, 9, 340000, 275000, 3, 5.5], [322916, 482812, 0, 0, 0]],
  ['TC3 Car', [12.4, 9, 0, 980000, 7, 4.8], [1360677, 0, 1360677, 10414, 8257]],
  ['TC3 Retire', [12.4, 9, 0, 4500000, 19, 6.1], [13861327, 0, 13861327, 16354, 9084]],
  ['TC4 Wedding', [10.25, 12, 0, 1840000, 9, 7.2], [3440099, 0, 3440099, 19807, 13065]],
  ['TC4 Trip', [10.25, 12, 0, 315500, 2, 3.9], [340589, 0, 340589, 12799, 12140]],
  ['Fresh A Bike (lump sum)', [13.35, 11.5, 275500, 185000, 4, 5.75], [231363, 454787, 0, 0, 0]],
  ['Fresh A Home', [13.35, 11.5, 0, 6250000, 16, 6.8], [17906886, 0, 17906886, 28949, 15028]],
  ['Fresh A Edu', [13.35, 11.5, 0, 1240000, 4, 8], [1687006, 0, 1687006, 26930, 23168]],
]

/**
 * The reference step-up SIP is its search's stale upper bound (usually 0.1-1.5% high).
 * Ours reaches the goal and is at most ~0.1% above the exact requirement, so it must lie
 * between the exact value and the reference value.
 */
function checkStepUp(name, r, { ret, stepUp, years }, referenceStepUp) {
  if (referenceStepUp === 0) {
    t.rupees(`${name} initial step-up SIP`, r.initialStepUpSipRequired, 0)
    return
  }
  const exact = solveInitialStepUpSip({ targetAmount: r.corpusFromSip, annualReturnPercent: ret, years, annualStepUpPercent: stepUp })
  const ours = r.initialStepUpSipRequired
  t.ok(`${name} step-up SIP reaches the goal, ≤0.1% above exact`, ours >= exact - 0.005 && ours <= exact * 1.0011 + 0.01, `${ours} vs exact ${exact}`)
  t.ok(`${name} step-up SIP not above reference ₹${referenceStepUp}`, Math.round(ours) <= referenceStepUp, `ours ${ours}`)
}

for (const [name, [ret, stepUp, lumpSumToday, presentValue, years, inflation], expected] of REFERENCE) {
  const r = calculateGoalPlanningResults({
    presentValue,
    years,
    inflationPercent: inflation,
    annualReturnPercent: ret,
    annualStepUpPercent: stepUp,
    lumpSumToday,
  })
  const [fv, lumpFv, corpus, fixed, step] = expected
  t.rupees(`${name} inflation-adjusted FV`, r.inflationAdjustedFutureValue, fv)
  t.rupees(`${name} lump sum FV`, r.lumpSumContributionFv, lumpFv)
  t.rupees(`${name} corpus from SIP`, r.corpusFromSip, corpus)
  t.rupees(`${name} fixed SIP`, r.fixedSipRequired, fixed)
  checkStepUp(name, r, { ret, stepUp, years }, step)
  t.ok(`${name} covered flag`, r.lumpSumCoversGoal === (corpus === 0))
}

checkStepUp('X3 TC1 x 1000', calculateGoalPlanningResults({ presentValue: 735000000, years: 13, inflationPercent: 6.3, annualReturnPercent: 11.7, annualStepUpPercent: 8.5 }), { ret: 11.7, stepUp: 8.5, years: 13 }, 3084877)
t.paise('TC1 fixed SIP to the paisa', calculateGoalPlanningResults({ presentValue: 735000, years: 13, inflationPercent: 6.3, annualReturnPercent: 11.7, annualStepUpPercent: 8.5 }).fixedSipRequired, 4644.45)

// Where the step-up never applies, the step-up SIP is the fixed SIP.
// The reference's search gives ₹4,887 at 0% step-up (5% above its own fixed SIP of ₹4,644).
const x2 = calculateGoalPlanningResults({ presentValue: 735000, years: 13, inflationPercent: 6.3, annualReturnPercent: 11.7, annualStepUpPercent: 0 })
t.paise('0% step-up equals fixed SIP', x2.initialStepUpSipRequired, x2.fixedSipRequired)
const oneYear = calculateGoalPlanningResults({ presentValue: 250000, years: 1, inflationPercent: 6, annualReturnPercent: 12, annualStepUpPercent: 10 })
t.paise('1-year goal: step-up SIP equals fixed SIP', oneYear.initialStepUpSipRequired, oneYear.fixedSipRequired)

// 0% return
const zero = calculateGoalPlanningResults({ presentValue: 600000, years: 5, inflationPercent: 0, annualReturnPercent: 0, annualStepUpPercent: 0 })
t.paise('0% return, 0% step-up: SIP = target / months', zero.fixedSipRequired, 10000)
t.paise('0% return, 0% step-up: step-up SIP', zero.initialStepUpSipRequired, 10000)

// Additional values: the step-up SIP reaches the corpus and sits just above the exact answer
const random = seededRandom(31)
for (let n = 0; n < 200; n++) {
  const presentValue = Math.round(50000 + random() * 20000000)
  const years = 2 + Math.floor(random() * 28)
  const inflationPercent = Math.round(random() * 900) / 100
  const annualReturnPercent = Math.round(random() * 1600) / 100
  const annualStepUpPercent = 1 + Math.round(random() * 1900) / 100
  const r = calculateGoalPlanningResults({ presentValue, years, inflationPercent, annualReturnPercent, annualStepUpPercent })
  const reached = simulateStepUpSip({ initialMonthlyAmount: r.initialStepUpSipRequired, annualReturnPercent, years, annualStepUpPercent }).balance
  const exact = solveInitialStepUpSip({ targetAmount: r.corpusFromSip, annualReturnPercent, years, annualStepUpPercent })
  t.ok(`random ${n}: step-up SIP reaches the goal`, reached >= r.corpusFromSip, `reached ${reached} of ${r.corpusFromSip}`)
  t.ok(`random ${n}: overshoot below the 0.1% tolerance`, reached - r.corpusFromSip < Math.max(0.001 * r.corpusFromSip, 1) + 1, `overshoot ${reached - r.corpusFromSip}`)
  t.ok(`random ${n}: step-up SIP ≤0.1% above exact`, r.initialStepUpSipRequired >= exact - 0.005 && r.initialStepUpSipRequired <= exact * 1.0011 + 0.01, `${r.initialStepUpSipRequired} vs exact ${exact}`)
  t.ok(`random ${n}: step-up SIP below fixed SIP`, r.initialStepUpSipRequired < r.fixedSipRequired)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const v = (values) => validateFields(values, goalPlanningSchema)
const valid = { presentValue: '500000', years: '8', inflation: '6', annualReturn: '12', annualStepUp: '10', lumpSumToday: '' }
t.equal('valid form', v(valid), {})
t.equal('0% inflation, return and step-up accepted', v({ ...valid, inflation: '0', annualReturn: '0', annualStepUp: '0' }), {})
t.equal('fractional years rejected', v({ ...valid, years: '2.5' }).years, 'Years from now must be a whole number')
t.equal('inflation required', v({ ...valid, inflation: '' }).inflation, 'Inflation rate is required')
t.equal('present value 0 rejected', v({ ...valid, presentValue: '0' }).presentValue, 'Present value of goal must be greater than zero')
