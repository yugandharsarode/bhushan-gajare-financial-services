import { suite, seededRandom } from './harness.mjs'
import {
  calculateSipResults,
  calculateSwpResults,
  getMonthlyRate,
} from '../../src/utils/financialCalculations.js'
import {
  calculateSipSwpJourney,
  buildJourneyYearlyRows,
} from '../../src/utils/sipSwpJourneyCalculations.js'
import { sipSwpJourneySchema, validateSipSwpJourneyCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('SIP to SWP Journey Planner')

const journey = (overrides) => {
  const inputs = {
    monthlySip: 10000,
    lumpSum: 0,
    buildReturnPercent: 12,
    buildYears: 10,
    growReturnPercent: 10,
    growYears: 5,
    monthlyWithdrawal: 20000,
    withdrawReturnPercent: 8,
    withdrawYears: 25,
    ...overrides,
  }
  return { inputs, result: calculateSipSwpJourney(inputs) }
}

/*
 * Independent closed forms for the Withdraw stage (start-of-month withdrawals,
 * effective monthly rate i, opening corpus C, withdrawal W):
 *   balance after k months  B(k) = C(1+i)^k − W(1+i)((1+i)^k − 1)/i
 *   months paid in full     the largest k ≤ N with B(k) ≥ 0
 *                           = floor( ln(A / (A − C)) / ln(1+i) ),  A = W(1+i)/i, when C < A
 *   at 0% return            B(k) = C − kW,  months = floor(C / W)
 */
function closedFormBalance(C, W, annualPercent, k) {
  const i = getMonthlyRate(annualPercent)
  if (i === 0) return C - k * W
  const g = Math.pow(1 + i, k)
  return C * g - (W * (1 + i) * (g - 1)) / i
}

function closedFormMonthsFunded(C, W, annualPercent, N) {
  const i = getMonthlyRate(annualPercent)
  if (i === 0) return Math.min(N, Math.floor(C / W))
  const A = (W * (1 + i)) / i
  if (C >= A) return N // returns cover every withdrawal; the corpus never falls
  return Math.min(N, Math.floor(Math.log(A / (A - C)) / Math.log(1 + i)))
}

// --- Stage 1 matches the SIP calculator exactly -----------------------------
{
  const { result } = journey({})
  t.rupees('Build corpus equals the SIP calculator (10,000 × 10 yrs @ 12%)', result.corpusAfterBuild, 2240359)
  const sip = calculateSipResults({ monthlyAmount: 25600, lumpSum: 0, years: 22, annualReturnPercent: 8.15 })
  const j = calculateSipSwpJourney({
    monthlySip: 25600, lumpSum: 0, buildReturnPercent: 8.15, buildYears: 22,
    growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 1000, withdrawReturnPercent: 0, withdrawYears: 1,
  })
  t.rupees('Build corpus equals SIP reference TC4', j.corpusAfterBuild, 18115244)
  t.equal('Build corpus is the SIP total to the paisa', j.corpusAfterBuild, sip.totalCorpus)
}

// --- Stage 2: whole years of growth with no new money ------------------------
{
  const { result } = journey({})
  t.close('Grow: corpus × 1.10^5', result.corpusAfterGrow, result.corpusAfterBuild * 1.1 ** 5, 1e-6)
  t.rupees('Grow corpus (10,000 SIP → 5 yrs @ 10%)', result.corpusAfterGrow, 3608120)
  const i = getMonthlyRate(10)
  let monthly = result.corpusAfterBuild
  for (let m = 0; m < 60; m++) monthly *= 1 + i
  t.close('Grow: monthly compounding at the effective rate agrees', result.corpusAfterGrow, monthly, 1e-4)

  const noGrow = journey({ growYears: 0, growReturnPercent: 25 }).result
  t.equal('Grow 0 years: corpus unchanged', noGrow.corpusAfterGrow, noGrow.corpusAfterBuild)
  t.equal('Grow 0 years: growth is zero', noGrow.growGrowth, 0)
}

// --- Scenario A: sufficient corpus that still declines -------------------------
{
  const { inputs, result } = journey({ monthlySip: 25000, monthlyWithdrawal: 65000 })
  const C = result.corpusAfterGrow
  t.ok('A: corpus is sufficient', result.sufficient)
  t.equal('A: every month funded', result.monthsFullyFunded, 300)
  t.rupees('A: total withdrawn = 65,000 × 300', result.totalWithdrawn, 19500000)
  t.close('A: remaining corpus matches closed form', result.remainingCorpus, closedFormBalance(C, 65000, 8, 300), 1e-3)
  t.rupees('A: corpus at withdrawal start', C, 9020301)
  t.rupees('A: remaining corpus', result.remainingCorpus, 2310745)
  t.ok('A: corpus declines over the withdrawals', result.remainingCorpus < C)
  t.equal('A: no run-out year', result.runOutJourneyYear, null)
  t.equal('A: no shortfall', result.withdrawalShortfall, 0)
  t.equal('A: no additional corpus needed', result.additionalCorpusNeeded, 0)
  t.rupees('A: total invested', result.totalInvested, 3000000)
  t.close('A: growth = corpus at withdrawal start − invested', result.estimatedGrowth, C - 3000000, 1e-6)
  t.close('A: money in = money out', result.totalInvested + result.estimatedGrowth + result.withdrawReturns, result.totalWithdrawn + result.remainingCorpus, 1e-3)
  t.ok('A: sustainable withdrawal is above the planned one', result.sustainableMonthlyWithdrawal > 65000)
  t.equal('A: yearly rows cover 40 years', buildJourneyYearlyRows(inputs, result).length, 40)
}

// --- Scenario B: corpus runs out early ---------------------------------------
{
  const { inputs, result } = journey({ monthlyWithdrawal: 50000, withdrawReturnPercent: 7 })
  const C = result.corpusAfterGrow
  const expectedMonths = closedFormMonthsFunded(C, 50000, 7, 300)
  t.ok('B: corpus is not sufficient', !result.sufficient)
  t.equal('B: months funded matches closed form', result.monthsFullyFunded, expectedMonths)
  t.equal('B: months funded = 92', result.monthsFullyFunded, 92)
  t.equal('B: lasts 7 years 8 months', result.lastsFor, { years: 7, months: 8 })
  t.equal('B: runs out in year 23 of the journey', result.runOutJourneyYear, 23)
  t.equal('B: remaining corpus is zero', result.remainingCorpus, 0)
  const lastFull = closedFormBalance(C, 50000, 7, expectedMonths)
  // B(k) already includes month k's return, so it is exactly what the final partial withdrawal takes
  t.close('B: total withdrawn = full months + final partial month', result.totalWithdrawn, expectedMonths * 50000 + lastFull, 1e-3)
  t.rupees('B: total withdrawn', result.totalWithdrawn, 4615043)
  t.close('B: shortfall = planned − withdrawn', result.withdrawalShortfall, 50000 * 300 - result.totalWithdrawn, 1e-6)
  t.ok('B: needs more corpus', result.additionalCorpusNeeded > 0)
  t.close('B: required corpus = W × annuity-due factor', result.requiredCorpus, 50000 * ((1 - (1 + getMonthlyRate(7)) ** -300) / getMonthlyRate(7)) * (1 + getMonthlyRate(7)), 1e-3)
  t.ok('B: sustainable withdrawal is below the planned one', result.sustainableMonthlyWithdrawal < 50000)
  const rows = buildJourneyYearlyRows(inputs, result)
  t.equal('B: corpus is zero in the run-out year', rows[22].corpus, 0)
  t.ok('B: nothing withdrawn after the run-out year', rows.slice(23).every((row) => row.withdrawn === 0 && row.corpus === 0))
}

// --- Scenario C: zero returns in every stage (exact arithmetic) --------------
{
  const zero = { buildReturnPercent: 0, growReturnPercent: 0, withdrawReturnPercent: 0 }
  const short = journey({ ...zero, monthlyWithdrawal: 10000 }).result
  t.equal('C: 0% build corpus = 12,00,000', short.corpusAfterBuild, 1200000)
  t.equal('C: 0% grow leaves it unchanged', short.corpusAfterGrow, 1200000)
  t.equal('C: estimated growth is zero', short.estimatedGrowth, 0)
  t.ok('C: 25 yrs of ₹10,000 from ₹12 lakh is not sufficient', !short.sufficient)
  t.equal('C: lasts exactly 120 months', short.monthsFullyFunded, 120)
  t.equal('C: lasts 10 years 0 months', short.lastsFor, { years: 10, months: 0 })
  t.equal('C: runs out in year 26 of the journey', short.runOutJourneyYear, 26)
  t.equal('C: withdrew the whole corpus', short.totalWithdrawn, 1200000)
  t.equal('C: required corpus = 300 × 10,000', short.requiredCorpus, 3000000)
  t.equal('C: sustainable withdrawal = 12,00,000 / 300', short.sustainableMonthlyWithdrawal, 4000)

  const exact = journey({ ...zero, monthlyWithdrawal: 10000, withdrawYears: 10 }).result
  t.ok('C: 10 yrs of ₹10,000 from ₹12 lakh is exactly sufficient', exact.sufficient)
  t.equal('C: nothing remains', exact.remainingCorpus, 0)
  t.equal('C: no run-out year', exact.runOutJourneyYear, null)
}

// --- Edge cases ---------------------------------------------------------------
{
  const first = calculateSipSwpJourney({
    monthlySip: 0, lumpSum: 100000, buildReturnPercent: 0, buildYears: 1,
    growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 150000, withdrawReturnPercent: 6, withdrawYears: 1,
  })
  t.ok('withdrawal larger than corpus: not sufficient', !first.sufficient)
  t.equal('withdrawal larger than corpus: no month paid in full', first.monthsFullyFunded, 0)
  t.equal('withdrawal larger than corpus: everything withdrawn in month 1', first.totalWithdrawn, 100000)
  t.equal('withdrawal larger than corpus: runs out in year 2 of the journey', first.runOutJourneyYear, 2)

  // A corpus exactly equal to the required corpus lasts the full period (no float false alarm)
  for (const rate of [0, 4.5, 8, 12.75]) {
    const probe = calculateSipSwpJourney({
      monthlySip: 0, lumpSum: 1, buildReturnPercent: 0, buildYears: 1,
      growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 37500, withdrawReturnPercent: rate, withdrawYears: 20,
    })
    const exact = calculateSipSwpJourney({
      monthlySip: 0, lumpSum: probe.requiredCorpus, buildReturnPercent: 0, buildYears: 1,
      growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 37500, withdrawReturnPercent: rate, withdrawYears: 20,
    })
    t.ok(`required corpus at ${rate}% lasts the full 20 years`, exact.sufficient)
    t.close(`required corpus at ${rate}% leaves about ₹0`, exact.remainingCorpus, 0, 0.5)

    const sustainable = calculateSipSwpJourney({
      monthlySip: 0, lumpSum: 5000000, buildReturnPercent: 0, buildYears: 1,
      growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 1, withdrawReturnPercent: rate, withdrawYears: 20,
    }).sustainableMonthlyWithdrawal
    const atSustainable = calculateSipSwpJourney({
      monthlySip: 0, lumpSum: 5000000, buildReturnPercent: 0, buildYears: 1,
      growReturnPercent: 0, growYears: 0, monthlyWithdrawal: sustainable, withdrawReturnPercent: rate, withdrawYears: 20,
    })
    t.ok(`sustainable withdrawal at ${rate}% lasts the full 20 years`, atSustainable.sufficient)
    t.close(`sustainable withdrawal at ${rate}% leaves about ₹0`, atSustainable.remainingCorpus, 0, 0.5)
  }

  // Returns that exceed withdrawals: the corpus keeps growing
  const growing = journey({ monthlyWithdrawal: 5000 }).result
  t.ok('small withdrawal: sufficient', growing.sufficient)
  t.ok('small withdrawal: corpus ends higher than it started', growing.remainingCorpus > growing.corpusAfterGrow)

  // Lump sum only, and lump sum + SIP
  const lump = journey({ monthlySip: 0, lumpSum: 500000 }).result
  t.close('lump sum only: build corpus = lump × 1.12^10', lump.corpusAfterBuild, 500000 * 1.12 ** 10, 1e-6)
  const both = journey({ lumpSum: 200000 }).result
  t.equal('SIP + lump sum: total invested', both.totalInvested, 1400000)
  t.equal('SIP + lump sum: SIP part', both.totalSipInvested, 1200000)
}

// --- Agrees with the SWP calculator when there is no Grow stage --------------
{
  const inputs = { monthlySip: 15000, lumpSum: 250000, buildReturnPercent: 11, buildYears: 15, growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 45000, withdrawReturnPercent: 7.5, withdrawYears: 30 }
  const j = calculateSipSwpJourney(inputs)
  const swp = calculateSwpResults({
    monthlySip: 15000, accumulationReturnPercent: 11, years: 15, lumpSum: 250000,
    monthlyWithdrawal: 45000, annualStepUpPercent: 0, swpReturnPercent: 7.5,
  })
  // The SWP calculator states the corpus to the rupee, so allow for that rounding
  t.close('matches SWP calculator: corpus at withdrawal start', j.corpusAfterGrow, swp.corpusForSwp, 0.5)
  t.equal('matches SWP calculator: months the corpus lasts', j.monthsFullyFunded, Math.min(swp.corpusLastsMonths - (swp.schedule.at(-1).withdrawal < 45000 ? 1 : 0), 360))
}

// --- Random cases: closed forms, yearly table identities, no NaN -------------
const random = seededRandom(20261021)
let sufficientCount = 0
for (let n = 0; n < 1500; n++) {
  const inputs = {
    monthlySip: Math.round(random() * 100000),
    lumpSum: random() < 0.5 ? 0 : Math.round(random() * 5000000),
    buildReturnPercent: Math.round(random() * 2000) / 100,
    buildYears: 1 + Math.floor(random() * 35),
    growReturnPercent: Math.round(random() * 1500) / 100,
    growYears: Math.floor(random() * 15),
    monthlyWithdrawal: 1000 + Math.round(random() * 300000),
    withdrawReturnPercent: random() < 0.1 ? 0 : Math.round(random() * 1200) / 100,
    withdrawYears: 1 + Math.floor(random() * 40),
  }
  if (inputs.monthlySip === 0 && inputs.lumpSum === 0) inputs.monthlySip = 500
  const r = calculateSipSwpJourney(inputs)
  const N = inputs.withdrawYears * 12
  const C = r.corpusAfterGrow
  const W = inputs.monthlyWithdrawal
  if (r.sufficient) sufficientCount++

  // Closed-form month count, skipping cases that sit within float noise of a month boundary
  const expectedMonths = closedFormMonthsFunded(C, W, inputs.withdrawReturnPercent, N)
  const nearBoundary = Math.abs(closedFormBalance(C, W, inputs.withdrawReturnPercent, expectedMonths)) < 1e-6 * Math.max(1, C)
  if (!nearBoundary) {
    t.equal(`random ${n}: months funded matches closed form`, r.monthsFullyFunded, expectedMonths)
    t.equal(`random ${n}: sufficiency matches closed form`, r.sufficient, closedFormBalance(C, W, inputs.withdrawReturnPercent, N) >= 0)
  }
  if (r.sufficient) {
    t.close(`random ${n}: remaining corpus matches closed form`, r.remainingCorpus, closedFormBalance(C, W, inputs.withdrawReturnPercent, N), 1e-7 * Math.max(1, C, r.remainingCorpus))
    t.close(`random ${n}: sufficient ⇒ withdrew W × N`, r.totalWithdrawn, W * N, 1e-6 * W * N)
  } else {
    t.ok(`random ${n}: insufficient ⇒ withdrew less than planned`, r.totalWithdrawn < W * N)
    t.equal(`random ${n}: run-out year is inside the journey`, r.runOutJourneyYear > (inputs.buildYears + inputs.growYears) && r.runOutJourneyYear <= r.totalYears, true)
  }

  const rows = buildJourneyYearlyRows(inputs, r)
  t.equal(`random ${n}: one row per year`, rows.length, r.totalYears)
  let opening = 0
  let identityOk = true
  for (const row of rows) {
    const expected = opening + row.invested - row.withdrawn + row.growth
    if (Math.abs(expected - row.corpus) > 1e-6 * Math.max(1, row.corpus, opening)) identityOk = false
    opening = row.corpus
  }
  t.ok(`random ${n}: opening + invested − withdrawn + growth = closing, every year`, identityOk)
  t.close(`random ${n}: rows add up to total invested`, rows.reduce((s, row) => s + row.invested, 0), r.totalInvested, 1e-6 * Math.max(1, r.totalInvested))
  t.close(`random ${n}: rows add up to total withdrawn`, rows.reduce((s, row) => s + row.withdrawn, 0), r.totalWithdrawn, 1e-6 * Math.max(1, r.totalWithdrawn))
  t.close(`random ${n}: stage-end rows match stage corpus`, rows[inputs.buildYears + inputs.growYears - 1].corpus, C, 1e-6 * Math.max(1, C))
  t.close(`random ${n}: last row is the remaining corpus`, rows.at(-1).corpus, r.remainingCorpus, 1e-6 * Math.max(1, C))
  t.finite(`random ${n}: no NaN/Infinity`, { r: { ...r, schedule: undefined }, rows })
}
t.ok(`random cases include both outcomes (${sufficientCount} sufficient of 1500)`, sufficientCount > 200 && sufficientCount < 1300)

// --- Extreme inputs stay finite -------------------------------------------------
{
  const big = calculateSipSwpJourney({
    monthlySip: 1e12, lumpSum: 1e12, buildReturnPercent: 100, buildYears: 50,
    growReturnPercent: 100, growYears: 50, monthlyWithdrawal: 1e12, withdrawReturnPercent: 100, withdrawYears: 50,
  })
  t.finite('maximum inputs: no NaN/Infinity', { ...big, schedule: undefined })
  t.ok('maximum inputs: sufficient', big.sufficient)
  const tiny = calculateSipSwpJourney({
    monthlySip: 1, lumpSum: 0, buildReturnPercent: 0, buildYears: 1,
    growReturnPercent: 0, growYears: 0, monthlyWithdrawal: 1e12, withdrawReturnPercent: 0, withdrawYears: 50,
  })
  t.equal('tiny corpus, huge withdrawal: withdrew the ₹12 corpus', tiny.totalWithdrawn, 12)
  t.equal('tiny corpus, huge withdrawal: sustainable withdrawal = 12 / 600', tiny.sustainableMonthlyWithdrawal, 0.02)
}

// --- Validation -------------------------------------------------------------------
const v = (values) => {
  const fieldErrors = validateFields(values, sipSwpJourneySchema)
  return { ...validateSipSwpJourneyCross(values, fieldErrors), ...fieldErrors }
}
const valid = {
  monthlyAmount: '10000', lumpSum: '', annualReturn: '12', years: '10',
  growReturn: '10', growYears: '5', monthlyWithdrawal: '50000', withdrawReturn: '7', withdrawYears: '25',
}
t.equal('valid journey form', v(valid), {})
t.equal('blank form: required fields flagged',
  Object.keys(v({ monthlyAmount: '', lumpSum: '', annualReturn: '', years: '', growReturn: '', growYears: '', monthlyWithdrawal: '', withdrawReturn: '', withdrawYears: '' })).sort(),
  ['annualReturn', 'growYears', 'monthlyAmount', 'monthlyWithdrawal', 'withdrawReturn', 'withdrawYears', 'years'])
t.equal('grow 0 years is allowed', v({ ...valid, growYears: '0' }), {})
t.equal('grow 0 years: growth return can be blank', v({ ...valid, growYears: '0', growReturn: '' }), {})
t.equal('grow years > 0: growth return required', v({ ...valid, growReturn: '' }).growReturn, 'Expected return during growth is required')
t.equal('0% returns are allowed', v({ ...valid, annualReturn: '0', growReturn: '0', withdrawReturn: '0' }), {})
t.equal('withdrawal of zero rejected', v({ ...valid, monthlyWithdrawal: '0' }).monthlyWithdrawal, 'Monthly withdrawal must be greater than zero')
t.equal('negative withdrawal rejected', v({ ...valid, monthlyWithdrawal: '-100' }).monthlyWithdrawal, 'Monthly withdrawal cannot be negative')
t.equal('build 0 years rejected', v({ ...valid, years: '0' }).years, 'Build duration must be greater than zero')
t.equal('withdrawal 0 years rejected', v({ ...valid, withdrawYears: '0' }).withdrawYears, 'Withdrawal duration must be greater than zero')
t.equal('fractional grow years rejected', v({ ...valid, growYears: '2.5' }).growYears, 'Grow duration must be a whole number')
t.equal('negative grow years rejected', v({ ...valid, growYears: '-1' }).growYears, 'Grow duration cannot be negative')
t.equal('withdrawal over 50 years rejected', v({ ...valid, withdrawYears: '51' }).withdrawYears, 'Withdrawal duration must be at most 50 years')
t.equal('build over 50 years rejected', v({ ...valid, years: '60' }).years, 'Build duration must be at most 50 years')
t.equal('return over 100% rejected', v({ ...valid, withdrawReturn: '120' }).withdrawReturn, 'Expected return during withdrawals must be at most 100%')
t.equal('SIP and lump sum both zero rejected', v({ ...valid, monthlyAmount: '0' }).monthlyAmount, 'Enter a monthly SIP amount or a lump sum investment')
t.equal('lump sum only is valid', v({ ...valid, monthlyAmount: '0', lumpSum: '500000' }), {})
t.equal('non-numeric withdrawal rejected', v({ ...valid, monthlyWithdrawal: 'abc' }).monthlyWithdrawal, 'Please enter a valid monthly withdrawal')
