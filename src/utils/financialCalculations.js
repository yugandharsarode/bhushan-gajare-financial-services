/**
 * Financial calculator formulas — validated against calc.txt examples.
 *
 * SIP & Goal-Based SIP use effective monthly rate with annuity-due (beginning-of-month):
 *   i = (1 + annual/100)^(1/12) - 1
 *   FV = P × [((1+i)^n - 1) / i] × (1+i)
 *
 * Lump sum uses annual compounding:
 *   FV = LS × (1 + annual/100)^years
 *
 * Step-Up SIP compounds monthly (effective rate), invests at month start,
 * and increases SIP by step-up % after each year.
 */

/** Effective monthly interest rate from annual percentage */
export function getMonthlyRate(annualReturnPercent) {
  return Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1
}

/** Future value of a constant monthly SIP (annuity due) */
export function calculateSipFutureValue(monthlyAmount, annualReturnPercent, months) {
  if (months <= 0 || monthlyAmount <= 0) return 0

  const i = getMonthlyRate(annualReturnPercent)
  if (i === 0) return monthlyAmount * months

  const growthFactor = Math.pow(1 + i, months)
  return monthlyAmount * ((growthFactor - 1) / i) * (1 + i)
}

/** Future value of lump sum with annual compounding */
export function calculateLumpSumFutureValue(lumpSum, annualReturnPercent, years) {
  if (!lumpSum || years <= 0) return lumpSum || 0
  return lumpSum * Math.pow(1 + annualReturnPercent / 100, years)
}

/** SIP Calculator — matches calc.txt SIP examples */
export function calculateSipResults({
  monthlyAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const months = years * 12
  const sipFutureValue = calculateSipFutureValue(
    monthlyAmount,
    annualReturnPercent,
    months
  )
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )
  const totalCorpus = sipFutureValue + lumpSumFutureValue
  const totalInvested = monthlyAmount * months + lumpSum
  const estimatedProfit = totalCorpus - totalInvested

  return {
    totalInvested,
    sipFutureValue,
    lumpSumFutureValue,
    totalCorpus,
    estimatedProfit,
    wealthGain: estimatedProfit,
    finalCorpus: totalCorpus,
  }
}

/** Solve required monthly SIP for a target goal */
export function calculateRequiredMonthlySip({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const months = years * 12
  const i = getMonthlyRate(annualReturnPercent)
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )
  const remainingTarget = targetAmount - lumpSumFutureValue

  if (remainingTarget <= 0) {
    return {
      requiredMonthlySip: 0,
      lumpSumFutureValue,
      sipFutureValue: 0,
      totalCorpus: lumpSumFutureValue,
    }
  }

  const growthFactor = Math.pow(1 + i, months)
  const annuityDueFactor = i === 0 ? months : ((growthFactor - 1) / i) * (1 + i)
  const requiredMonthlySip = remainingTarget / annuityDueFactor
  const sipFutureValue = calculateSipFutureValue(
    requiredMonthlySip,
    annualReturnPercent,
    months
  )

  return {
    requiredMonthlySip,
    lumpSumFutureValue,
    sipFutureValue,
    totalCorpus: sipFutureValue + lumpSumFutureValue,
  }
}

/** Goal Based SIP Calculator — matches calc.txt goal examples */
export function calculateGoalBasedSipResults({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const result = calculateRequiredMonthlySip({
    targetAmount,
    annualReturnPercent,
    years,
    lumpSum,
  })

  return {
    requiredMonthlySip: result.requiredMonthlySip,
    lumpSumFutureValue: result.lumpSumFutureValue,
    sipFutureValue: result.sipFutureValue,
    totalCorpus: result.totalCorpus,
    totalInvested: result.requiredMonthlySip * years * 12 + lumpSum,
    estimatedProfit: result.totalCorpus - (result.requiredMonthlySip * years * 12 + lumpSum),
    wealthGain: result.totalCorpus - (result.requiredMonthlySip * years * 12 + lumpSum),
    finalCorpus: result.totalCorpus,
  }
}

/** Step-Up SIP — matches calc.txt step-up examples */
export function calculateStepUpSipResults({
  initialMonthlyAmount,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  lumpSum = 0,
}) {
  const monthlyRate = getMonthlyRate(annualReturnPercent)
  let balance = lumpSum
  let totalInvested = lumpSum
  let monthlySip = initialMonthlyAmount

  for (let year = 0; year < years; year++) {
    for (let month = 0; month < 12; month++) {
      balance = (balance + monthlySip) * (1 + monthlyRate)
      totalInvested += monthlySip
    }
    monthlySip *= 1 + annualStepUpPercent / 100
  }

  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )
  const sipFutureValue = balance - lumpSumFutureValue
  const totalCorpus = balance
  const estimatedProfit = totalCorpus - totalInvested

  return {
    totalInvested,
    lumpSumFutureValue,
    sipFutureValue,
    totalCorpus,
    estimatedProfit,
    wealthGain: estimatedProfit,
    finalCorpus: totalCorpus,
  }
}

/** Yearly projection for standard SIP */
export function buildSipYearlyProjection({
  monthlyAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const rows = []

  for (let year = 1; year <= years; year++) {
    const months = year * 12
    const annualInvestment = monthlyAmount * 12
    const cumulativeInvestment = monthlyAmount * months + lumpSum
    const sipFutureValue = calculateSipFutureValue(
      monthlyAmount,
      annualReturnPercent,
      months
    )
    const lumpSumFutureValue = calculateLumpSumFutureValue(
      lumpSum,
      annualReturnPercent,
      year
    )
    const portfolioValue = sipFutureValue + lumpSumFutureValue
    const interestEarned = portfolioValue - cumulativeInvestment

    rows.push({
      year,
      annualInvestment,
      cumulativeInvestment,
      interestEarned,
      portfolioValue,
    })
  }

  return rows
}

/** Yearly projection for step-up SIP */
export function buildStepUpYearlyProjection({
  initialMonthlyAmount,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  lumpSum = 0,
}) {
  const monthlyRate = getMonthlyRate(annualReturnPercent)
  let balance = lumpSum
  let totalInvested = lumpSum
  let monthlySip = initialMonthlyAmount
  const rows = []

  for (let year = 1; year <= years; year++) {
    const sipAtYearStart = monthlySip
    let annualInvestment = 0

    for (let month = 0; month < 12; month++) {
      balance = (balance + monthlySip) * (1 + monthlyRate)
      totalInvested += monthlySip
      annualInvestment += monthlySip
    }

    monthlySip *= 1 + annualStepUpPercent / 100

    const lumpSumFutureValue = calculateLumpSumFutureValue(
      lumpSum,
      annualReturnPercent,
      year
    )
    const sipFutureValue = balance - lumpSumFutureValue

    rows.push({
      year,
      monthlySip: sipAtYearStart,
      annualInvestment,
      cumulativeInvestment: totalInvested,
      sipFutureValue,
      lumpSumFutureValue,
      portfolioValue: balance,
      interestEarned: balance - totalInvested,
    })
  }

  return rows
}

/** Yearly projection for goal-based SIP */
export function buildGoalBasedYearlyProjection({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const { requiredMonthlySip } = calculateRequiredMonthlySip({
    targetAmount,
    annualReturnPercent,
    years,
    lumpSum,
  })

  return buildSipYearlyProjection({
    monthlyAmount: requiredMonthlySip,
    annualReturnPercent,
    years,
    lumpSum,
  })
}
