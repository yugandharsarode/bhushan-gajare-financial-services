/**
 * Validates financialCalculations.js against every example in calc.txt.
 * Run: npm run validate:calculations
 */
import {
  calculateSwpResults,
  calculateGoalPlanningResults,
  calculateChildEducationResults,
  calculateRetirementResults,
} from '../src/utils/financialCalculations.js'

const TOLERANCE = 1

function assertClose(actual, expected, label, tolerance = TOLERANCE) {
  const diff = Math.abs(Math.round(actual) - expected)
  if (diff > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${Math.round(actual)} (diff ${diff})`)
  }
  console.log(`✓ ${label}: ${Math.round(actual)}`)
}

function assertCloseDecimal(actual, expected, label, decimals = 2, tolerance = 0.05) {
  const rounded = Number(actual.toFixed(decimals))
  if (Math.abs(rounded - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${rounded}`)
  }
  console.log(`✓ ${label}: ${rounded}`)
}

function assertMonths(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected} months, got ${actual}`)
  }
  console.log(`✓ ${label}: ${actual} months`)
}

console.log('--- SWP Calculator ---')

const swp1 = calculateSwpResults({
  monthlySip: 1500,
  accumulationReturnPercent: 11,
  years: 10,
  lumpSum: 100000,
  monthlyWithdrawal: 50000,
  annualStepUpPercent: 6,
  swpReturnPercent: 8,
})
assertClose(swp1.corpusForSwp, 602587, 'SWP Ex1 Corpus')

const swp2 = calculateSwpResults({
  monthlySip: 2653,
  accumulationReturnPercent: 9.3,
  years: 8,
  lumpSum: 56000,
  monthlyWithdrawal: 20000,
  annualStepUpPercent: 7,
  swpReturnPercent: 8,
})
assertClose(swp2.corpusForSwp, 486642, 'SWP Ex2 Corpus')
assertMonths(swp2.corpusLastsMonths, 26, 'SWP Ex2 Corpus Lasts')
assertClose(swp2.schedule[0].startBalance, 486642, 'SWP Ex2 M1 Start')
assertClose(swp2.schedule[0].withdrawal, 20000, 'SWP Ex2 M1 Withdrawal')
assertClose(swp2.schedule[0].returns, 3002, 'SWP Ex2 M1 Returns')
assertClose(swp2.schedule[0].endBalance, 469644, 'SWP Ex2 M1 End')

const swp3 = calculateSwpResults({
  monthlySip: 677,
  accumulationReturnPercent: 7.93,
  years: 9,
  lumpSum: 97579,
  monthlyWithdrawal: 2982,
  annualStepUpPercent: 4,
  swpReturnPercent: 7,
})
assertClose(swp3.corpusForSwp, 299373, 'SWP Ex3 Corpus')
assertMonths(swp3.corpusLastsMonths, 117, 'SWP Ex3 Corpus Lasts')
assertClose(swp3.schedule[0].returns, 1676, 'SWP Ex3 M1 Returns')

console.log('\n--- Goal Planning Calculator ---')

const gp1 = calculateGoalPlanningResults({
  presentValue: 2222,
  years: 4,
  inflationPercent: 3.4,
  annualReturnPercent: 12,
  annualStepUpPercent: 10,
  lumpSumToday: 10000,
})
assertClose(gp1.inflationAdjustedFutureValue, 2540, 'Goal Plan Ex1 Infl FV')
assertClose(gp1.lumpSumContributionFv, 15735, 'Goal Plan Ex1 Lump FV')
assertClose(gp1.fixedSipRequired, 0, 'Goal Plan Ex1 Fixed SIP')
assertClose(gp1.initialStepUpSipRequired, 0, 'Goal Plan Ex1 Step SIP')

const gp2 = calculateGoalPlanningResults({
  presentValue: 1500,
  years: 8,
  inflationPercent: 4.6,
  annualReturnPercent: 8.4,
  annualStepUpPercent: 5,
  lumpSumToday: 55000,
})
assertClose(gp2.inflationAdjustedFutureValue, 2150, 'Goal Plan Ex2 Infl FV')
assertClose(gp2.lumpSumContributionFv, 104857, 'Goal Plan Ex2 Lump FV')

const gp3 = calculateGoalPlanningResults({
  presentValue: 20000,
  years: 7,
  inflationPercent: 3.2,
  annualReturnPercent: 11.4,
  annualStepUpPercent: 15,
  lumpSumToday: 122000,
})
assertClose(gp3.inflationAdjustedFutureValue, 24934, 'Goal Plan Ex3 Infl FV')
assertClose(gp3.lumpSumContributionFv, 259750, 'Goal Plan Ex3 Lump FV')

console.log('\n--- Child Education Planner ---')

const child = calculateChildEducationResults({
  annualReturnPercent: 12,
  annualStepUpPercent: 10,
  lumpSumToday: 35000,
  children: [
    {
      name: 'Test 1',
      currentAge: 5,
      graduationAge: 21,
      graduationPresentCost: 1000000,
      graduationInflationPercent: 4.5,
      postGraduationAge: 24,
      postGraduationPresentCost: 2000000,
      postGraduationInflationPercent: 5.5,
    },
  ],
})

const grad = child.childResults[0].graduation
const post = child.childResults[0].postGraduation

assertClose(grad.futureValue, 2022370, 'Child Grad FV')
assertClose(grad.lumpSumContributionFv, 214564, 'Child Grad Lump FV')
assertClose(grad.corpusViaSip, 1807806, 'Child Grad SIP Corpus')
assertClose(grad.fixedSipRequired, 3312, 'Child Grad Fixed SIP')
assertClose(grad.initialStepUpSipRequired, 1848, 'Child Grad Step SIP', 15)

assertClose(post.futureValue, 5531294, 'Child PostGrad FV')
assertClose(post.corpusViaSip, 5531294, 'Child PostGrad SIP Corpus')
assertClose(post.fixedSipRequired, 6830, 'Child PostGrad Fixed SIP')
assertClose(post.initialStepUpSipRequired, 3482, 'Child PostGrad Step SIP', 15)

console.log('\n--- Retirement Planning Calculator ---')

const ret1 = calculateRetirementResults({
  currentAnnualExpenses: 1200000,
  preRetirementInflationPercent: 6,
  currentAge: 35,
  retirementAge: 55,
  lifeExpectancy: 100,
  preRetirementReturnPercent: 12,
  stepUpSipPercent: 10,
  lumpSumSaved: 10000,
  postRetirementReturnPercent: 7,
  postRetirementInflationPercent: 5,
})
assertClose(ret1.annualExpensesAtRetirement, 3848563, 'Ret Ex1 Expenses at Ret')
assertClose(ret1.totalRetirementCorpusNeeded, 117813333, 'Ret Ex1 Total Corpus')
assertClose(ret1.futureValueOfCurrentSavings, 96463, 'Ret Ex1 FV Savings')
assertClose(ret1.additionalCorpusNeeded, 117716870, 'Ret Ex1 Additional')
assertClose(ret1.monthlySipRequiredFixed, 127973, 'Ret Ex1 Fixed SIP')
assertClose(ret1.stepUpSipStartingAmount, 63182, 'Ret Ex1 Step SIP')

const ret2 = calculateRetirementResults({
  currentAnnualExpenses: 340000,
  preRetirementInflationPercent: 6,
  currentAge: 28,
  retirementAge: 48,
  lifeExpectancy: 80,
  preRetirementReturnPercent: 12.8,
  stepUpSipPercent: 5,
  lumpSumSaved: 5000,
  postRetirementReturnPercent: 6,
  postRetirementInflationPercent: 7,
})
assertClose(ret2.annualExpensesAtRetirement, 1090426, 'Ret Ex2 Expenses at Ret')
assertClose(ret2.totalRetirementCorpusNeeded, 40512099, 'Ret Ex2 Total Corpus')
assertClose(ret2.futureValueOfCurrentSavings, 55610, 'Ret Ex2 FV Savings')
assertClose(ret2.additionalCorpusNeeded, 40456489, 'Ret Ex2 Additional')
assertClose(ret2.monthlySipRequiredFixed, 39917, 'Ret Ex2 Fixed SIP')
assertClose(ret2.stepUpSipStartingAmount, 29076, 'Ret Ex2 Step SIP', 5)

console.log('\nAll calc.txt examples passed!')
