/**
 * Financial calculator formulas — validated against calc.txt examples.
 *
 * Core conventions:
 * - SIP accumulation: effective monthly rate (1+r)^(1/12)-1, annuity-due (month-start)
 * - Lump sum: annual compounding
 * - Step-up SIP: month-start investment, step-up applied after each year
 * - SWP withdrawal: returns on (balance − withdrawal), step-up after every 12 months
 * - Retirement corpus: PV of post-retirement expenses growing with inflation
 */

/** Effective monthly interest rate from annual percentage */
export function getMonthlyRate(annualReturnPercent) {
  return Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1
}

/** Inflation-adjusted future value of a present amount */
export function calculateInflationAdjustedValue(
  presentValue,
  inflationPercent,
  years
) {
  return presentValue * Math.pow(1 + inflationPercent / 100, years)
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

/** Simulate step-up SIP with month-start contributions */
export function simulateStepUpSip({
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

  return { balance, totalInvested }
}

/** Solve initial step-up SIP via binary search */
export function solveInitialStepUpSip({
  targetAmount,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  lumpSum = 0,
}) {
  if (targetAmount <= 0) return 0

  let low = 0
  let high = targetAmount

  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2
    const { balance } = simulateStepUpSip({
      initialMonthlyAmount: mid,
      annualReturnPercent,
      years,
      annualStepUpPercent,
      lumpSum,
    })

    if (balance < targetAmount) {
      low = mid
    } else {
      high = mid
    }
  }

  return (low + high) / 2
}

/** Solve required fixed monthly SIP for a target */
export function solveRequiredFixedSip({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const months = years * 12
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )
  const remainingTarget = targetAmount - lumpSumFutureValue

  if (remainingTarget <= 0) return 0

  const i = getMonthlyRate(annualReturnPercent)
  const growthFactor = Math.pow(1 + i, months)
  const annuityDueFactor =
    i === 0 ? months : ((growthFactor - 1) / i) * (1 + i)

  return remainingTarget / annuityDueFactor
}

// ---------------------------------------------------------------------------
// SIP Calculator (Value of Money & SIPs)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Goal Based SIP Calculator
// ---------------------------------------------------------------------------

export function calculateGoalBasedSipResults({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const requiredMonthlySip = solveRequiredFixedSip({
    targetAmount,
    annualReturnPercent,
    years,
    lumpSum,
  })
  const months = years * 12
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )
  const sipFutureValue = calculateSipFutureValue(
    requiredMonthlySip,
    annualReturnPercent,
    months
  )
  const totalCorpus = sipFutureValue + lumpSumFutureValue
  const totalInvested = requiredMonthlySip * months + lumpSum

  return {
    requiredMonthlySip,
    lumpSumFutureValue,
    sipFutureValue,
    totalCorpus,
    totalInvested,
    estimatedProfit: totalCorpus - totalInvested,
    wealthGain: totalCorpus - totalInvested,
    finalCorpus: totalCorpus,
  }
}

// ---------------------------------------------------------------------------
// Step-Up SIP Calculator
// ---------------------------------------------------------------------------

export function calculateStepUpSipResults({
  initialMonthlyAmount,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  lumpSum = 0,
}) {
  const { balance, totalInvested } = simulateStepUpSip({
    initialMonthlyAmount,
    annualReturnPercent,
    years,
    annualStepUpPercent,
    lumpSum,
  })

  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )
  const sipFutureValue = balance - lumpSumFutureValue
  const estimatedProfit = balance - totalInvested

  return {
    totalInvested,
    lumpSumFutureValue,
    sipFutureValue,
    totalCorpus: balance,
    estimatedProfit,
    wealthGain: estimatedProfit,
    finalCorpus: balance,
  }
}

// ---------------------------------------------------------------------------
// SWP Calculator
// ---------------------------------------------------------------------------

/** Build accumulation corpus before SWP withdrawals begin */
export function calculateSwpAccumulationCorpus({
  monthlySip,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const months = years * 12
  const sipFutureValue = calculateSipFutureValue(
    monthlySip,
    annualReturnPercent,
    months
  )
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    years
  )

  return {
    corpusForSwp: sipFutureValue + lumpSumFutureValue,
    sipFutureValue,
    lumpSumFutureValue,
    totalInvested: monthlySip * months + lumpSum,
  }
}

/** Simulate SWP withdrawals until corpus is depleted */
export function simulateSwpWithdrawal({
  corpus,
  monthlyWithdrawal,
  annualStepUpPercent,
  swpReturnPercent,
  maxMonths = 600,
}) {
  const monthlyRate = getMonthlyRate(swpReturnPercent)
  let balance = corpus
  let withdrawal = monthlyWithdrawal
  const schedule = []

  for (let month = 1; month <= maxMonths; month++) {
    if (balance <= 0) break

    const startBalance = balance
    const actualWithdrawal = Math.min(withdrawal, startBalance)
    const afterWithdrawal = startBalance - actualWithdrawal
    const returns = afterWithdrawal * monthlyRate
    balance = afterWithdrawal + returns

    schedule.push({
      month,
      startBalance,
      withdrawal: actualWithdrawal,
      returns,
      endBalance: Math.max(0, balance),
    })

    if (month % 12 === 0) {
      withdrawal *= 1 + annualStepUpPercent / 100
    }
  }

  return {
    corpusLastsMonths: schedule.length,
    corpusAtEnd: Math.max(0, balance),
    schedule,
  }
}

export function calculateSwpResults({
  monthlySip,
  accumulationReturnPercent,
  years,
  lumpSum = 0,
  monthlyWithdrawal,
  annualStepUpPercent,
  swpReturnPercent,
}) {
  const accumulation = calculateSwpAccumulationCorpus({
    monthlySip,
    annualReturnPercent: accumulationReturnPercent,
    years,
    lumpSum,
  })

  const withdrawal = simulateSwpWithdrawal({
    corpus: accumulation.corpusForSwp,
    monthlyWithdrawal,
    annualStepUpPercent,
    swpReturnPercent,
  })

  return {
    ...accumulation,
    ...withdrawal,
    futureValue: accumulation.corpusForSwp,
    estimatedProfit: accumulation.corpusForSwp - accumulation.totalInvested,
    wealthGain: accumulation.corpusForSwp - accumulation.totalInvested,
    finalCorpus: accumulation.corpusForSwp,
  }
}

// ---------------------------------------------------------------------------
// Goal Planning Calculator (Plan for Goals)
// ---------------------------------------------------------------------------

export function calculateGoalPlanningResults({
  presentValue,
  years,
  inflationPercent,
  annualReturnPercent,
  annualStepUpPercent,
  lumpSumToday = 0,
}) {
  const inflationAdjustedFutureValue = calculateInflationAdjustedValue(
    presentValue,
    inflationPercent,
    years
  )
  const lumpSumContributionFv = calculateLumpSumFutureValue(
    lumpSumToday,
    annualReturnPercent,
    years
  )

  const corpusFromSip = Math.max(
    0,
    inflationAdjustedFutureValue - lumpSumContributionFv
  )

  const fixedSipRequired =
    corpusFromSip > 0
      ? solveRequiredFixedSip({
          targetAmount: inflationAdjustedFutureValue,
          annualReturnPercent,
          years,
          lumpSum: lumpSumToday,
        })
      : 0

  const initialStepUpSipRequired =
    corpusFromSip > 0
      ? solveInitialStepUpSip({
          targetAmount: inflationAdjustedFutureValue,
          annualReturnPercent,
          years,
          annualStepUpPercent,
          lumpSum: lumpSumToday,
        })
      : 0

  return {
    presentValue,
    years,
    inflationPercent,
    inflationAdjustedFutureValue,
    lumpSumContributionFv,
    corpusFromSip,
    fixedSipRequired,
    initialStepUpSipRequired,
    totalCorpus: inflationAdjustedFutureValue,
    futureValue: inflationAdjustedFutureValue,
    estimatedProfit: inflationAdjustedFutureValue - lumpSumToday,
    wealthGain: inflationAdjustedFutureValue - lumpSumToday,
    finalCorpus: inflationAdjustedFutureValue,
  }
}

// ---------------------------------------------------------------------------
// Child Education Planner
// ---------------------------------------------------------------------------

export function calculateEducationGoal({
  presentCost,
  inflationPercent,
  yearsToGoal,
  annualReturnPercent,
  annualStepUpPercent,
  lumpSumToday = 0,
  applyLumpSum = true,
}) {
  const futureValue = calculateInflationAdjustedValue(
    presentCost,
    inflationPercent,
    yearsToGoal
  )

  const lumpSumUsed = applyLumpSum ? lumpSumToday : 0
  const lumpSumContributionFv = calculateLumpSumFutureValue(
    lumpSumUsed,
    annualReturnPercent,
    yearsToGoal
  )

  const corpusViaSip = Math.max(0, futureValue - lumpSumContributionFv)

  const fixedSipRequired =
    corpusViaSip > 0
      ? solveRequiredFixedSip({
          targetAmount: applyLumpSum ? futureValue : corpusViaSip,
          annualReturnPercent,
          years: yearsToGoal,
          lumpSum: lumpSumUsed,
        })
      : 0

  const initialStepUpSipRequired =
    corpusViaSip > 0
      ? solveInitialStepUpSip({
          targetAmount: futureValue,
          annualReturnPercent,
          years: yearsToGoal,
          annualStepUpPercent,
          lumpSum: lumpSumUsed,
        })
      : 0

  return {
    presentCost,
    inflationPercent,
    yearsToGoal,
    futureValue,
    lumpSumContributionFv,
    corpusViaSip,
    fixedSipRequired,
    initialStepUpSipRequired,
    futureValueTarget: futureValue,
    estimatedProfit: futureValue - lumpSumUsed,
    wealthGain: futureValue - lumpSumUsed,
    finalCorpus: futureValue,
  }
}

export function calculateChildEducationResults({
  annualReturnPercent,
  annualStepUpPercent,
  lumpSumToday,
  children,
}) {
  const childResults = children.map((child) => {
    const yearsToGraduation = child.graduationAge - child.currentAge
    const yearsToPostGraduation = child.postGraduationAge - child.currentAge

    const graduation = calculateEducationGoal({
      presentCost: child.graduationPresentCost,
      inflationPercent: child.graduationInflationPercent,
      yearsToGoal: yearsToGraduation,
      annualReturnPercent,
      annualStepUpPercent,
      lumpSumToday,
      applyLumpSum: true,
    })

    const postGraduation = calculateEducationGoal({
      presentCost: child.postGraduationPresentCost,
      inflationPercent: child.postGraduationInflationPercent,
      yearsToGoal: yearsToPostGraduation,
      annualReturnPercent,
      annualStepUpPercent,
      lumpSumToday: 0,
      applyLumpSum: false,
    })

    return {
      name: child.name,
      currentAge: child.currentAge,
      graduation,
      postGraduation,
    }
  })

  return { childResults }
}

// ---------------------------------------------------------------------------
// Retirement Planning Calculator
// ---------------------------------------------------------------------------

/** Annual expenses at retirement (year 1) */
export function calculateAnnualExpensesAtRetirement({
  currentAnnualExpenses,
  preRetirementInflationPercent,
  yearsToRetirement,
}) {
  return (
    currentAnnualExpenses *
    Math.pow(1 + preRetirementInflationPercent / 100, yearsToRetirement)
  )
}

/** Total retirement corpus needed (PV of growing post-retirement expenses) */
export function calculateRetirementCorpusNeeded({
  annualExpensesAtRetirement,
  postRetirementReturnPercent,
  postRetirementInflationPercent,
  retirementYears,
}) {
  let total = 0

  for (let year = 0; year < retirementYears; year++) {
    const expense =
      annualExpensesAtRetirement *
      Math.pow(1 + postRetirementInflationPercent / 100, year)
    total += expense / Math.pow(1 + postRetirementReturnPercent / 100, year)
  }

  return total
}

export function calculateRetirementResults({
  currentAnnualExpenses,
  preRetirementInflationPercent,
  currentAge,
  retirementAge,
  lifeExpectancy,
  preRetirementReturnPercent,
  stepUpSipPercent,
  lumpSumSaved,
  postRetirementReturnPercent,
  postRetirementInflationPercent,
}) {
  const yearsToRetirement = retirementAge - currentAge
  const retirementYears = lifeExpectancy - retirementAge

  const annualExpensesAtRetirement = calculateAnnualExpensesAtRetirement({
    currentAnnualExpenses,
    preRetirementInflationPercent,
    yearsToRetirement,
  })

  const totalRetirementCorpusNeeded = calculateRetirementCorpusNeeded({
    annualExpensesAtRetirement,
    postRetirementReturnPercent,
    postRetirementInflationPercent,
    retirementYears,
  })

  const futureValueOfCurrentSavings = calculateLumpSumFutureValue(
    lumpSumSaved,
    preRetirementReturnPercent,
    yearsToRetirement
  )

  const additionalCorpusNeeded =
    totalRetirementCorpusNeeded - futureValueOfCurrentSavings

  const monthlySipRequiredFixed = solveRequiredFixedSip({
    targetAmount: totalRetirementCorpusNeeded,
    annualReturnPercent: preRetirementReturnPercent,
    years: yearsToRetirement,
    lumpSum: lumpSumSaved,
  })

  const stepUpSipStartingAmount = solveInitialStepUpSip({
    targetAmount: totalRetirementCorpusNeeded,
    annualReturnPercent: preRetirementReturnPercent,
    years: yearsToRetirement,
    annualStepUpPercent: stepUpSipPercent,
    lumpSum: lumpSumSaved,
  })

  return {
    annualExpensesAtRetirement,
    totalRetirementCorpusNeeded,
    futureValueOfCurrentSavings,
    additionalCorpusNeeded,
    monthlySipRequiredFixed,
    stepUpSipStartingAmount,
    totalInvested: lumpSumSaved,
    futureValue: totalRetirementCorpusNeeded,
    estimatedProfit: totalRetirementCorpusNeeded - lumpSumSaved,
    wealthGain: totalRetirementCorpusNeeded - lumpSumSaved,
    finalCorpus: totalRetirementCorpusNeeded,
  }
}

// ---------------------------------------------------------------------------
// Yearly projections
// ---------------------------------------------------------------------------

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

    rows.push({
      year,
      annualInvestment,
      cumulativeInvestment,
      interestEarned: portfolioValue - cumulativeInvestment,
      portfolioValue,
    })
  }

  return rows
}

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

    rows.push({
      year,
      monthlySip: sipAtYearStart,
      annualInvestment,
      cumulativeInvestment: totalInvested,
      sipFutureValue: balance - lumpSumFutureValue,
      lumpSumFutureValue,
      portfolioValue: balance,
      interestEarned: balance - totalInvested,
    })
  }

  return rows
}

export function buildGoalBasedYearlyProjection({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const { requiredMonthlySip } = calculateGoalBasedSipResults({
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

/** @deprecated alias */
export function calculateRequiredMonthlySip(params) {
  return solveRequiredFixedSip({
    targetAmount: params.targetAmount,
    annualReturnPercent: params.annualReturnPercent,
    years: params.years,
    lumpSum: params.lumpSum,
  })
}
