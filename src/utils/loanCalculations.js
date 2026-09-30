/**
 * Loan formulas shared by the Loan EMI, Cash vs Loan and Rent vs Buy calculators.
 *
 * Conventions (match the reference loan calculators):
 * - Monthly rate is nominal: annual % / 12 (not the effective rate used for SIPs)
 * - EMI is paid at the end of each month and is not rounded
 * - The final instalment repays exactly the remaining balance
 * - A 0% loan is repaid in equal instalments of principal / months
 */

export function getNominalMonthlyRate(annualRatePercent) {
  return annualRatePercent / 12 / 100
}

/** Equated monthly instalment for a reducing-balance loan */
export function calculateEmi(principal, annualRatePercent, months) {
  if (principal <= 0 || months <= 0) return 0
  const rate = getNominalMonthlyRate(annualRatePercent)
  if (rate === 0) return principal / months
  const growth = Math.pow(1 + rate, months)
  return (principal * rate * growth) / (growth - 1)
}

/** Month-by-month amortization schedule */
export function buildAmortizationSchedule(principal, annualRatePercent, months) {
  const rate = getNominalMonthlyRate(annualRatePercent)
  const emi = calculateEmi(principal, annualRatePercent, months)
  const rows = []
  let balance = principal

  for (let month = 1; month <= months && balance > 0; month++) {
    const openingBalance = balance
    const interest = openingBalance * rate
    const principalPaid =
      month === months ? openingBalance : Math.min(emi - interest, openingBalance)
    balance = openingBalance - principalPaid

    rows.push({
      month,
      openingBalance,
      payment: interest + principalPaid,
      interest,
      principal: principalPaid,
      balance,
    })
  }

  return rows
}

/** Loan summary: EMI, totals and the monthly schedule */
export function calculateLoanSummary({ principal, annualRatePercent, months }) {
  const emi = calculateEmi(principal, annualRatePercent, months)
  const schedule = buildAmortizationSchedule(principal, annualRatePercent, months)
  const totalPayment = emi * months

  return {
    principal,
    months,
    emi,
    totalPayment,
    totalInterest: totalPayment - principal,
    schedule,
  }
}

/**
 * Group a monthly schedule into loan years (12 instalments each, counted from
 * the first EMI). Years after the loan closes are not included.
 */
export function summarizeScheduleByYear(schedule) {
  const years = []
  for (let start = 0; start < schedule.length; start += 12) {
    const block = schedule.slice(start, start + 12)
    years.push({
      year: start / 12 + 1,
      openingBalance: block[0].openingBalance,
      payment: block.reduce((sum, row) => sum + row.payment, 0),
      principal: block.reduce((sum, row) => sum + row.principal, 0),
      interest: block.reduce((sum, row) => sum + row.interest, 0),
      closingBalance: block[block.length - 1].balance,
    })
  }
  return years
}
