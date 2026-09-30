/**
 * Rent vs Buy: two comparisons over the same period.
 *
 * 1. Buy outright vs invest the same money instead.
 * 2. Buy with a loan vs rent and invest what buying would have cost each year.
 *
 * Method (as in the reference calculator):
 * - Property value compounds annually at the appreciation rate
 * - Buyer net worth = property value - costs paid (and, with a loan, minus the
 *   outstanding loan). The purchase price itself is not counted as a cost when
 *   buying outright.
 * - Invest alternative: price + upfront + renovation invested as a lump sum
 * - Rent & invest: each year, (EMI + tax + maintenance - rent) is invested at the
 *   start of the year; years where rent is higher add nothing
 * - Selling brokerage is deducted from the property value in the final summary
 * - Loan EMI uses the nominal monthly rate (see loanCalculations.js)
 *
 * Corrections to the reference:
 * - Both summaries use year N (the reference loan summary used year N - 1)
 * - Year 1 property tax and maintenance are the amounts entered; they grow
 *   from year 2, like rent (the reference already raised them in year 1)
 * - A 0% loan is repaid in equal instalments instead of producing no result
 */

import { buildAmortizationSchedule } from './loanCalculations.js'

function compareOutcomes(buyValue, alternativeValue) {
  const difference = buyValue - alternativeValue
  if (Math.abs(difference) < 0.5) return { winner: 'equal', difference: 0 }
  return {
    winner: difference > 0 ? 'buy' : 'alternative',
    difference: Math.abs(difference),
  }
}

export function calculateRentVsBuy({
  comparisonYears,
  propertyAppreciationPercent,
  monthlyRent,
  annualRentIncreasePercent,
  propertyPrice,
  upfrontCosts = 0,
  renovationCosts = 0,
  annualPropertyTax = 0,
  propertyTaxIncreasePercent = 0,
  annualMaintenance = 0,
  maintenanceIncreasePercent = 0,
  sellingBrokeragePercent = 0,
  investmentReturnPercent,
  downPayment,
  loanRatePercent,
  loanTenureYears,
  processingFees = 0,
  otherLoanFees = 0,
}) {
  const years = comparisonYears
  const growth = (percent, periods) => Math.pow(1 + percent / 100, periods)
  const propertyValue = (year) => propertyPrice * growth(propertyAppreciationPercent, year)
  const ongoingCosts = (year) =>
    year === 0
      ? 0
      : annualPropertyTax * growth(propertyTaxIncreasePercent, year - 1) +
        annualMaintenance * growth(maintenanceIncreasePercent, year - 1)

  // Scenario 1: buy outright vs invest instead
  const outrightInitialCosts = upfrontCosts + renovationCosts
  const investedInstead = propertyPrice + outrightInitialCosts
  const outrightRows = []
  let outrightCumulativeCosts = outrightInitialCosts

  for (let year = 0; year <= years; year++) {
    const annualOngoingCosts = ongoingCosts(year)
    outrightCumulativeCosts += annualOngoingCosts
    const value = propertyValue(year)
    outrightRows.push({
      year,
      propertyValue: value,
      annualOngoingCosts,
      cumulativeCosts: outrightCumulativeCosts,
      netWorth: value - outrightCumulativeCosts,
      investmentValue: investedInstead * growth(investmentReturnPercent, year),
    })
  }

  // Scenario 2: buy with loan vs rent and invest
  const loanAmount = propertyPrice - downPayment
  const loanMonths = loanAmount > 0 ? loanTenureYears * 12 : 0
  const schedule = buildAmortizationSchedule(loanAmount, loanRatePercent, loanMonths)
  const loanInitialCosts =
    downPayment + upfrontCosts + renovationCosts + processingFees + otherLoanFees

  const loanRows = []
  const rentRows = []
  let loanCumulativeCosts = loanInitialCosts
  let rentInvestmentValue = 0

  for (let year = 0; year <= years; year++) {
    const value = propertyValue(year)
    const annualOngoingCosts = ongoingCosts(year)

    const yearMonths =
      year === 0 ? [] : schedule.slice((year - 1) * 12, year * 12)
    const annualPrincipal = yearMonths.reduce((sum, row) => sum + row.principal, 0)
    const annualInterest = yearMonths.reduce((sum, row) => sum + row.interest, 0)
    const annualEmi = annualPrincipal + annualInterest
    const lastMonth = Math.min(year * 12, schedule.length)
    const loanOutstanding = lastMonth === 0 ? loanAmount : schedule[lastMonth - 1].balance

    loanCumulativeCosts += annualEmi + annualOngoingCosts
    loanRows.push({
      year,
      propertyValue: value,
      annualEmi,
      annualPrincipal,
      annualInterest,
      annualOngoingCosts,
      cumulativeCosts: loanCumulativeCosts,
      loanOutstanding,
      netWorth: value - loanOutstanding - loanCumulativeCosts,
    })

    const currentMonthlyRent =
      year === 0 ? 0 : monthlyRent * growth(annualRentIncreasePercent, year - 1)
    const annualRent = currentMonthlyRent * 12
    const moneySaved = year === 0 ? 0 : annualEmi + annualOngoingCosts - annualRent
    if (year > 0) {
      rentInvestmentValue =
        (rentInvestmentValue + Math.max(0, moneySaved)) * growth(investmentReturnPercent, 1)
    }
    rentRows.push({
      year,
      monthlyRent: currentMonthlyRent,
      annualRent,
      moneySaved,
      investmentValue: rentInvestmentValue,
    })
  }

  const sellingCosts = (sellingBrokeragePercent / 100) * propertyValue(years)
  const finalOutright = outrightRows[years]
  const finalLoan = loanRows[years]

  const outright = {
    buyNetWorth: finalOutright.netWorth - sellingCosts,
    investValue: finalOutright.investmentValue,
  }
  const withLoan = {
    buyNetWorth: finalLoan.netWorth - sellingCosts,
    rentInvestValue: rentRows[years].investmentValue,
  }

  return {
    comparisonYears: years,
    sellingCosts,
    loanAmount,
    monthlyEmi: schedule.length > 0 ? schedule[0].payment : 0,
    outright: {
      ...outright,
      ...compareOutcomes(outright.buyNetWorth, outright.investValue),
      rows: outrightRows,
    },
    withLoan: {
      ...withLoan,
      ...compareOutcomes(withLoan.buyNetWorth, withLoan.rentInvestValue),
      loanRows,
      rentRows,
    },
  }
}
