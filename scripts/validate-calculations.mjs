/**
 * Validates financialCalculations.js against every example in calc.txt.
 * Run: node scripts/validate-calculations.mjs
 */
import {
  calculateSipResults,
  calculateGoalBasedSipResults,
  calculateStepUpSipResults,
} from '../src/utils/financialCalculations.js'

const TOLERANCE = 1 // allow ₹1 rounding difference

function assertClose(actual, expected, label) {
  const diff = Math.abs(Math.round(actual) - expected)
  if (diff > TOLERANCE) {
    throw new Error(`${label}: expected ${expected}, got ${Math.round(actual)} (diff ${diff})`)
  }
  console.log(`✓ ${label}: ${Math.round(actual)}`)
}

function assertCloseDecimal(actual, expected, label, decimals = 2) {
  const rounded = Number(actual.toFixed(decimals))
  if (rounded !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${rounded}`)
  }
  console.log(`✓ ${label}: ${rounded}`)
}

console.log('--- SIP Calculator ---')
const sip1 = calculateSipResults({ monthlyAmount: 10000, annualReturnPercent: 12, years: 10, lumpSum: 0 })
assertClose(sip1.totalInvested, 1200000, 'SIP Ex1 Total Invested')
assertClose(sip1.sipFutureValue, 2240359, 'SIP Ex1 SIP FV')
assertClose(sip1.totalCorpus, 2240359, 'SIP Ex1 Corpus')
assertClose(sip1.estimatedProfit, 1040359, 'SIP Ex1 Profit')

const sip2 = calculateSipResults({ monthlyAmount: 1239, annualReturnPercent: 11, years: 8, lumpSum: 0 })
assertClose(sip2.totalInvested, 118944, 'SIP Ex2 Total Invested')
assertClose(sip2.sipFutureValue, 186665, 'SIP Ex2 SIP FV')
assertClose(sip2.estimatedProfit, 67721, 'SIP Ex2 Profit')

const sip3 = calculateSipResults({ monthlyAmount: 87832, annualReturnPercent: 14, years: 9, lumpSum: 0 })
assertClose(sip3.totalInvested, 9485856, 'SIP Ex3 Total Invested')
assertClose(sip3.sipFutureValue, 18213624, 'SIP Ex3 SIP FV')
assertClose(sip3.estimatedProfit, 8727768, 'SIP Ex3 Profit')

console.log('\n--- Goal Based SIP Calculator ---')
const g1 = calculateGoalBasedSipResults({ targetAmount: 5000000, annualReturnPercent: 12, years: 10, lumpSum: 0 })
assertCloseDecimal(g1.requiredMonthlySip, 22317.85, 'Goal Ex1 Required SIP')
assertClose(g1.totalCorpus, 5000000, 'Goal Ex1 Corpus')

const g2 = calculateGoalBasedSipResults({ targetAmount: 400000, annualReturnPercent: 13, years: 11, lumpSum: 25000 })
assertCloseDecimal(g2.requiredMonthlySip, 1086.62, 'Goal Ex2 Required SIP')
assertClose(g2.lumpSumFutureValue, 95897, 'Goal Ex2 Lump FV')
assertClose(g2.sipFutureValue, 304103, 'Goal Ex2 SIP FV')
assertClose(g2.totalCorpus, 400000, 'Goal Ex2 Corpus')

const g3 = calculateGoalBasedSipResults({ targetAmount: 1200000, annualReturnPercent: 13, years: 10, lumpSum: 26589 })
assertCloseDecimal(g3.requiredMonthlySip, 4696.10, 'Goal Ex3 Required SIP')
assertClose(g3.lumpSumFutureValue, 90258, 'Goal Ex3 Lump FV')
assertClose(g3.sipFutureValue, 1109742, 'Goal Ex3 SIP FV')
assertClose(g3.totalCorpus, 1200000, 'Goal Ex3 Corpus')

console.log('\n--- Step-Up SIP Calculator ---')
const su1 = calculateStepUpSipResults({ initialMonthlyAmount: 10000, annualReturnPercent: 12, years: 10, annualStepUpPercent: 10, lumpSum: 50000 })
assertClose(su1.totalInvested, 1962491, 'Step-Up Ex1 Invested')
assertClose(su1.lumpSumFutureValue, 155292, 'Step-Up Ex1 Lump FV')
assertClose(su1.sipFutureValue, 3268898, 'Step-Up Ex1 SIP FV')
assertClose(su1.totalCorpus, 3424191, 'Step-Up Ex1 Corpus')
assertClose(su1.estimatedProfit, 1461700, 'Step-Up Ex1 Profit')

const su2 = calculateStepUpSipResults({ initialMonthlyAmount: 5000, annualReturnPercent: 11, years: 8, annualStepUpPercent: 9.5, lumpSum: 100000 })
assertClose(su2.totalInvested, 773812, 'Step-Up Ex2 Invested')
assertClose(su2.lumpSumFutureValue, 230454, 'Step-Up Ex2 Lump FV')
assertClose(su2.sipFutureValue, 1006416, 'Step-Up Ex2 SIP FV')
assertClose(su2.totalCorpus, 1236870, 'Step-Up Ex2 Corpus')
assertClose(su2.estimatedProfit, 463058, 'Step-Up Ex2 Profit')

const su3 = calculateStepUpSipResults({ initialMonthlyAmount: 12767, annualReturnPercent: 9, years: 7, annualStepUpPercent: 3.5, lumpSum: 40000 })
assertClose(su3.totalInvested, 1231836, 'Step-Up Ex3 Invested')
assertClose(su3.lumpSumFutureValue, 73122, 'Step-Up Ex3 Lump FV')
assertClose(su3.sipFutureValue, 1622560, 'Step-Up Ex3 SIP FV')
assertClose(su3.totalCorpus, 1695681, 'Step-Up Ex3 Corpus')
assertClose(su3.estimatedProfit, 463845, 'Step-Up Ex3 Profit')

console.log('\nAll calc.txt examples passed!')
