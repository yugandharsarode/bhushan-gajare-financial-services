import { suite, seededRandom } from './harness.mjs'
import {
  calculateChildEducationResults,
  allocateLumpSumToGoals,
  calculateRequiredSipForCorpus,
  simulateStepUpSip,
  solveInitialStepUpSip,
} from '../../src/utils/financialCalculations.js'
import { validateChildEducationForm, toChildEducationInput } from '../../src/config/calculatorSchemas.js'

const t = suite('Child Education Planner')

const plan = (targetAge, presentCost, inflationPercent) => ({ targetAge, presentCost, inflationPercent })
const run = (annualReturnPercent, annualStepUpPercent, lumpSumToday, children) =>
  calculateChildEducationResults({ annualReturnPercent, annualStepUpPercent, lumpSumToday, children })

/** Our step-up SIP reaches the goal, is ≤0.1% above exact and not above the reference figure */
function checkStepUp(name, goal, { ret, stepUp }, referenceStepUp) {
  const exact = solveInitialStepUpSip({ targetAmount: goal.corpusViaSip, annualReturnPercent: ret, years: goal.yearsToGoal, annualStepUpPercent: stepUp })
  const ours = goal.initialStepUpSipRequired
  t.ok(`${name} step-up SIP reaches the goal, ≤0.1% above exact`, ours >= exact - 0.005 && ours <= exact * 1.0011 + 0.01, `${ours} vs exact ${exact}`)
  t.ok(`${name} step-up SIP not above reference ₹${referenceStepUp}`, Math.round(ours) <= referenceStepUp, `ours ${ours}`)
}

/** [futureValue, lumpSumFv, corpusViaSip, fixedSip, referenceStepUp] */
function checkGoal(name, goal, expected, rates) {
  const [fv, lumpFv, corpus, fixed, step] = expected
  t.rupees(`${name} future value`, goal.futureValue, fv)
  t.rupees(`${name} lump sum FV`, goal.lumpSumContributionFv, lumpFv)
  t.rupees(`${name} corpus via SIP`, goal.corpusViaSip, corpus)
  t.rupees(`${name} fixed SIP`, goal.fixedSipRequired, fixed)
  if (step === 0) t.rupees(`${name} step-up SIP`, goal.initialStepUpSipRequired, 0)
  else checkStepUp(name, goal, rates, step)
}

// calc.txt example (collected earlier from the reference)
{
  const r = run(12, 10, 35000, [{ name: 'Test 1', currentAge: 5, graduation: plan(21, 1000000, 4.5), postGraduation: plan(24, 2000000, 5.5) }])
  const rates = { ret: 12, stepUp: 10 }
  checkGoal('calc.txt graduation', r.childResults[0].graduation, [2022370, 214564, 1807806, 3312, 1848], rates)
  checkGoal('calc.txt post graduation', r.childResults[0].postGraduation, [5531294, 0, 5531294, 6830, 3482], rates)
}

// TC1: one child, no lump sum
{
  const r = run(11.35, 7.5, 0, [{ name: 'Aarav', currentAge: 7, graduation: plan(19, 1275000, 6.4), postGraduation: plan(23, 1850000, 7.1) }])
  const rates = { ret: 11.35, stepUp: 7.5 }
  checkGoal('TC1 Aarav graduation', r.childResults[0].graduation, [2684168, 0, 2684168, 9092, 6512], rates)
  checkGoal('TC1 Aarav post graduation', r.childResults[0].postGraduation, [5543745, 0, 5543745, 10783, 7021], rates)
}

// TC2: two children and a lump sum. The lump sum goes to the nearest goal only (Riya, 9 years).
// Before the fix, the same ₹4,35,000 was also applied to Kabir's graduation (SIP ₹1,984 instead of ₹6,379).
{
  const r = run(10.8, 9, 435000, [
    { name: 'Riya', currentAge: 9, graduation: plan(18, 840000, 5.9), postGraduation: plan(22, 1560000, 6.6) },
    { name: 'Kabir', currentAge: 3, graduation: plan(21, 1125000, 7.3), postGraduation: plan(24, 2100000, 7.3) },
  ])
  const rates = { ret: 10.8, stepUp: 9 }
  const [riya, kabir] = r.childResults
  checkGoal('TC2 Riya graduation (gets lump sum)', riya.graduation, [1407158, 1094831, 312327, 1752, 1287], rates)
  checkGoal('TC2 Riya post graduation', riya.postGraduation, [3580703, 0, 3580703, 10909, 6994], rates)
  checkGoal('TC2 Kabir graduation (no lump sum)', kabir.graduation, [3998964, 0, 3998964, 6379, 3539], rates)
  checkGoal('TC2 Kabir post graduation', kabir.postGraduation, [9221752, 0, 9221752, 10303, 5224], rates)
  t.rupees('TC2 lump sum counted once in total', r.totals.lumpSumAllocated, 435000)
  t.rupees('TC2 no lump sum left over', r.unallocatedLumpSum, 0)
}

// TC4: graduation only (reference also had a custom goal, which our planner does not include)
{
  const r = run(9.65, 12.5, 0, [{ name: 'Ishaan', currentAge: 6, graduation: plan(20, 1040000, 6.2), postGraduation: null }])
  checkGoal('TC4 Ishaan graduation', r.childResults[0].graduation, [2414219, 0, 2414219, 7015, 3481], { ret: 9.65, stepUp: 12.5 })
  t.equal('TC4 skipped post graduation stays empty', r.childResults[0].postGraduation, null)
}

// Fresh A (reference lump sum went to a custom goal, so run with no lump sum)
{
  const r = run(11.85, 9.5, 0, [
    { name: 'Anya', currentAge: 8, graduation: plan(19, 1450000, 6.7), postGraduation: plan(22, 980000, 7.4) },
    { name: 'Vihaan', currentAge: 14, graduation: plan(18, 620000, 8.8), postGraduation: null },
  ])
  const rates = { ret: 11.85, stepUp: 9.5 }
  checkGoal('Fresh A Anya graduation', r.childResults[0].graduation, [2959216, 0, 2959216, 11323, 7676], rates)
  checkGoal('Fresh A Anya post graduation', r.childResults[0].postGraduation, [2662478, 0, 2662478, 6515, 3981], rates)
  checkGoal('Fresh A Vihaan graduation', r.childResults[1].graduation, [868775, 0, 868775, 14281, 12620], rates)
}

// TC3 values the reference recorded for goals without a lump sum
{
  const r = run(12.6, 11, 0, [{ name: 'Meera', currentAge: 4, graduation: plan(21, 950000, 6.8), postGraduation: plan(23, 1400000, 6.8) }])
  const rates = { ret: 12.6, stepUp: 11 }
  checkGoal('TC3 Meera graduation', r.childResults[0].graduation, [2906932, 0, 2906932, 4388, 2240], rates)
  checkGoal('TC3 Meera post graduation', r.childResults[0].postGraduation, [4886319, 0, 4886319, 5635, 2693], rates)
}

// TC3 lump sum larger than the nearest goal needs. The reference gives Dev's graduation the whole
// ₹6,20,000 (FV ₹12,63,636 against a need of ₹11,71,349) and discards the surplus; we give that goal
// only what it needs and pass the rest to the next nearest goal (Meera's graduation).
{
  const r = run(12.6, 11, 620000, [
    { name: 'Meera', currentAge: 4, graduation: plan(21, 950000, 6.8), postGraduation: plan(23, 1400000, 6.8) },
    { name: 'Dev', currentAge: 12, graduation: plan(18, 730000, 8.2), postGraduation: null },
  ])
  const dev = r.childResults[1].graduation
  const meera = r.childResults[0].graduation
  const devNeed = dev.futureValue / Math.pow(1.126, 6)
  t.rupees('TC3 Dev graduation fully covered', dev.corpusViaSip, 0)
  t.rupees('TC3 Dev graduation lump sum FV equals its need', dev.lumpSumContributionFv, 1171349)
  t.rupees('TC3 Dev uses only what it needs', dev.lumpSumAllocated, Math.round(devNeed))
  t.rupees('TC3 surplus moves to Meera graduation', meera.lumpSumAllocated, Math.round(620000 - devNeed))
  t.rupees('TC3 Meera graduation SIP reflects the surplus', meera.fixedSipRequired, Math.round(calculateRequiredSipForCorpus(meera.futureValue - (620000 - devNeed) * Math.pow(1.126, 17), 12.6, 17)))
  t.rupees('TC3 Meera post graduation gets nothing', r.childResults[0].postGraduation.lumpSumAllocated, 0)
  t.rupees('TC3 whole lump sum used once', r.totals.lumpSumAllocated, 620000)
}

// Lump sum covers every goal: the rest is reported, not spread twice
{
  const r = run(10, 10, 5000000, [{ name: 'A', currentAge: 10, graduation: plan(18, 500000, 6), postGraduation: plan(21, 800000, 6) }])
  t.rupees('large lump sum: graduation corpus 0', r.childResults[0].graduation.corpusViaSip, 0)
  t.rupees('large lump sum: post graduation corpus 0', r.childResults[0].postGraduation.corpusViaSip, 0)
  t.ok('large lump sum: leftover reported', r.unallocatedLumpSum > 0 && Math.abs(r.totals.lumpSumAllocated + r.unallocatedLumpSum - 5000000) < 1e-6)
}

// Ties go to the first goal in input order
{
  const { allocations } = allocateLumpSumToGoals(
    [{ yearsToGoal: 7, futureValue: 1e9 }, { yearsToGoal: 7, futureValue: 1e9 }],
    100000,
    10
  )
  t.ok('tie: first goal gets the lump sum', allocations[0].lumpSumAllocated === 100000 && allocations[1].lumpSumAllocated === 0)
}

// Additional values: allocation never exceeds the lump sum and SIPs reach every goal
const random = seededRandom(555)
for (let n = 0; n < 40; n++) {
  const children = Array.from({ length: 1 + Math.floor(random() * 3) }, (_, i) => {
    const currentAge = Math.floor(random() * 15)
    return {
      name: `Child ${i + 1}`,
      currentAge,
      graduation: plan(currentAge + 2 + Math.floor(random() * 12), 200000 + Math.round(random() * 3000000), Math.round(random() * 1000) / 100),
      postGraduation: random() < 0.5 ? null : plan(currentAge + 15 + Math.floor(random() * 8), 300000 + Math.round(random() * 4000000), Math.round(random() * 1000) / 100),
    }
  })
  const ret = Math.round(random() * 1500) / 100
  const stepUp = Math.round(random() * 1500) / 100
  const lump = random() < 0.3 ? 0 : Math.round(random() * 3000000)
  const r = run(ret, stepUp, lump, children)
  t.close(`random ${n}: lump sum used + left = lump sum`, r.totals.lumpSumAllocated + r.unallocatedLumpSum, lump, 1e-6)
  for (const child of r.childResults) {
    for (const goal of [child.graduation, child.postGraduation].filter(Boolean)) {
      const i = Math.pow(1 + ret / 100, 1 / 12) - 1
      let fixedBalance = 0
      for (let m = 0; m < goal.yearsToGoal * 12; m++) fixedBalance = (fixedBalance + goal.fixedSipRequired) * (1 + i)
      t.close(`random ${n}: fixed SIP reaches corpus`, fixedBalance, goal.corpusViaSip, Math.max(1, 1e-4 * goal.corpusViaSip))
      const stepBalance = simulateStepUpSip({ initialMonthlyAmount: goal.initialStepUpSipRequired, annualReturnPercent: ret, years: goal.yearsToGoal, annualStepUpPercent: stepUp }).balance
      t.ok(`random ${n}: step-up SIP reaches corpus`, stepBalance >= goal.corpusViaSip - 1, `${stepBalance} < ${goal.corpusViaSip}`)
    }
  }
  t.finite(`random ${n}: no NaN/Infinity`, r)
}

// Validation
const child = (overrides = {}) => ({
  name: '',
  currentAge: '5',
  graduationAge: '21',
  graduationPresentCost: '1000000',
  graduationInflationPercent: '6',
  postGraduationAge: '',
  postGraduationPresentCost: '',
  postGraduationInflationPercent: '',
  ...overrides,
})
const form = (children, overrides = {}) => ({ annualReturn: '12', annualStepUp: '10', lumpSumToday: '', children, ...overrides })

t.equal('valid form, post graduation skipped', validateChildEducationForm(form([child()])), {})
t.equal('newborn (age 0) accepted', validateChildEducationForm(form([child({ currentAge: '0' })])), {})
t.equal('0% return, step-up and inflation accepted', validateChildEducationForm(form([child({ graduationInflationPercent: '0' })], { annualReturn: '0', annualStepUp: '0' })), {})
t.equal('graduation age not after current age', validateChildEducationForm(form([child({ graduationAge: '5' })])).child0_graduationAge, "Graduation age must be greater than the child's current age")
t.equal('partly filled post graduation', Object.keys(validateChildEducationForm(form([child({ postGraduationAge: '24' })]))).sort(), ['child0_postGraduationInflationPercent', 'child0_postGraduationPresentCost'])
t.equal('fractional age rejected', validateChildEducationForm(form([child({ currentAge: '5.5' })])).child0_currentAge, "Child's current age must be a whole number")
t.equal('second child errors are keyed by index', Object.keys(validateChildEducationForm(form([child(), child({ graduationPresentCost: '' })]))), ['child1_graduationPresentCost'])
t.equal('missing return', validateChildEducationForm(form([child()], { annualReturn: '' })).annualReturn, 'Assumed annual return is required')

const input = toChildEducationInput(form([child({ name: '  ' }), child({ name: 'Riya', postGraduationAge: '24', postGraduationPresentCost: '2000000', postGraduationInflationPercent: '5' })], { lumpSumToday: '' }))
t.equal('blank name becomes Child 1', input.children[0].name, 'Child 1')
t.equal('blank post graduation becomes null', input.children[0].postGraduation, null)
t.equal('filled post graduation parsed', input.children[1].postGraduation, { targetAge: 24, presentCost: 2000000, inflationPercent: 5 })
t.equal('blank lump sum is 0', input.lumpSumToday, 0)
