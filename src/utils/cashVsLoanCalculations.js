/**
 * Cash vs Loan: pay the full price in cash, or pay a down payment, borrow the
 * rest and invest the cash that was not spent.
 *
 * Conventions (match the reference calculator):
 * - Borrow & invest: the unspent cash (equal to the loan amount) is invested as
 *   a lump sum for the loan tenure, compounded annually
 * - Loan EMI uses the nominal monthly rate; EMIs are paid from other income
 * - Tax applies only to a positive investment gain
 * - Net result = post-tax investment gain - total loan interest
 * - The inflation-adjusted figure discounts the net result over the tenure
 */

import { calculateLoanSummary, summarizeScheduleByYear } from './loanCalculations.js'

export function calculateCashVsLoan({
  assetValue,
  downPayment = 0,
  loanRatePercent,
  tenureYears,
  investmentReturnPercent,
  taxOnGainsPercent = 0,
  inflationPercent = 0,
}) {
  const loanAmount = assetValue - downPayment
  const months = tenureYears * 12
  const loan = calculateLoanSummary({
    principal: loanAmount,
    annualRatePercent: loanRatePercent,
    months,
  })

  const investmentProjection = []
  let investmentValue = loanAmount
  for (let year = 1; year <= tenureYears; year++) {
    const openingValue = investmentValue
    const growth = openingValue * (investmentReturnPercent / 100)
    investmentValue = openingValue + growth
    investmentProjection.push({ year, openingValue, growth, closingValue: investmentValue })
  }

  const investmentGain = investmentValue - loanAmount
  const taxOnGains = investmentGain > 0 ? investmentGain * (taxOnGainsPercent / 100) : 0
  const postTaxGain = investmentGain - taxOnGains
  const netResult = postTaxGain - loan.totalInterest
  const inflationAdjustedNetResult =
    netResult / Math.pow(1 + inflationPercent / 100, tenureYears)

  let verdict = 'equal'
  if (Math.round(netResult) > 0) verdict = 'borrow'
  else if (Math.round(netResult) < 0) verdict = 'cash'

  return {
    loanAmount,
    emi: loan.emi,
    totalInterest: loan.totalInterest,
    totalLoanPayment: loan.totalPayment,
    initialInvestment: loanAmount,
    investmentFinalValue: investmentValue,
    investmentGain,
    taxOnGains,
    postTaxGain,
    netResult,
    inflationAdjustedNetResult,
    verdict,
    loanProjection: summarizeScheduleByYear(loan.schedule),
    investmentProjection,
  }
}
