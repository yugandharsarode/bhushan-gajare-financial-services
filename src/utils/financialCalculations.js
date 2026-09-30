/**
 * Investment and planning calculator formulas.
 * Verified against the reference calculators by scripts/validate-calculations.mjs.
 *
 * Core conventions:
 * - Monthly rate: effective (1+r)^(1/12) - 1, not r/12
 * - SIP contributions: start of each month (annuity-due)
 * - Lump sum: annual compounding
 * - Step-up SIP: constant within a year, raised by the step-up % every 12 instalments
 * - Investment periods, ages and goal horizons are whole years
 * - SWP: withdrawal at the start of the month, returns on the remaining balance,
 *   withdrawal raised by the step-up % every 12 withdrawals
 * - Retirement corpus: value at retirement of expenses paid at the start of
 *   each retirement year (no withdrawal in the life-expectancy year)
 */

/** Effective monthly interest rate from annual percentage */
export function getMonthlyRate(annualReturnPercent) {
  return Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1
}

/** Periods are whole years; any fraction is dropped */
export function toWholeYears(years) {
  const value = Math.trunc(Number(years))
  return Number.isFinite(value) && value > 0 ? value : 0
}

/** Round a monthly SIP amount to paise */
export function roundToPaise(amount) {
  return Math.round(amount * 100) / 100
}

/** Inflation-adjusted future value of a present amount */
export function calculateInflationAdjustedValue(presentValue, inflationPercent, years) {
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

/** Monthly SIP (annuity due) that grows to `corpus` over whole `years` */
export function calculateRequiredSipForCorpus(corpus, annualReturnPercent, years) {
  const months = toWholeYears(years) * 12
  if (corpus <= 0 || months <= 0) return 0

  const i = getMonthlyRate(annualReturnPercent)
  const annuityDueFactor =
    i === 0 ? months : ((Math.pow(1 + i, months) - 1) / i) * (1 + i)
  return corpus / annuityDueFactor
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
  const wholeYears = toWholeYears(years)
  let balance = lumpSum
  let totalInvested = lumpSum
  let monthlySip = initialMonthlyAmount

  for (let year = 0; year < wholeYears; year++) {
    for (let month = 0; month < 12; month++) {
      balance = (balance + monthlySip) * (1 + monthlyRate)
      totalInvested += monthlySip
    }
    monthlySip *= 1 + annualStepUpPercent / 100
  }

  return { balance, totalInvested }
}

/**
 * Exact initial step-up SIP that reaches the target (bisection to convergence).
 * The planners use the reference search below instead; this is kept to measure
 * how far that search lands from the exact answer.
 */
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

/**
 * Search settings for the initial step-up SIP, taken from the reference planners.
 * Each planner bisects its own range and stops at a tolerance instead of the
 * exact root, which is why its answer sits slightly away from the exact value.
 *
 * - goalReached: stop at the first trial amount that reaches the corpus and
 *   overshoots it by less than the tolerance; round up to the paisa. The answer
 *   is never below the exact requirement and at most about 0.1% above it.
 *   (The reference Goal Planning and Child Education pages instead report the
 *   last upper bound of the search, which is usually 0.1-1.5% high but can be
 *   several times too high when the search stops early. That part is not copied.)
 * - mid: stop at the first trial amount within the tolerance, on either side, as
 *   the reference Retirement page does; round to the paisa.
 */
export const STEP_UP_SEARCH = {
  goalPlanning: {
    upperBound: (corpus, years) => (2 * corpus) / years,
    tolerance: (corpus) => Math.max(corpus * 0.001, 1),
    onConverge: 'goalReached',
  },
  childEducation: {
    upperBound: (corpus) => corpus,
    tolerance: (corpus) => Math.max(corpus * 0.001, 1),
    onConverge: 'goalReached',
  },
  retirement: {
    upperBound: (corpus, years) => (1.5 * corpus) / years,
    tolerance: (corpus) => Math.max(0.1, corpus * 0.0001),
    onConverge: 'mid',
    minWidth: 0.01,
  },
}

/** Initial step-up SIP for a corpus, using a planner's search settings */
export function searchInitialStepUpSip({
  corpus,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  search,
}) {
  const wholeYears = toWholeYears(years)
  if (corpus <= 0 || wholeYears <= 0) return 0

  const sipOnlyCorpus = (initialMonthlyAmount) =>
    simulateStepUpSip({
      initialMonthlyAmount,
      annualReturnPercent,
      years: wholeYears,
      annualStepUpPercent,
    }).balance

  let low = 0
  let high = search.upperBound(corpus, wholeYears)
  const tolerance = search.tolerance(corpus)

  for (let iteration = 0; iteration < 100; iteration++) {
    if (search.minWidth !== undefined && high - low <= search.minWidth) break
    const mid = (low + high) / 2
    const gap = sipOnlyCorpus(mid) - corpus
    const converged =
      search.onConverge === 'mid'
        ? Math.abs(gap) < tolerance
        : gap >= 0 && gap < tolerance
    if (converged) {
      high = mid
      break
    }
    if (gap < 0) low = mid
    else high = mid
  }

  return search.onConverge === 'goalReached'
    ? Math.ceil(high * 100) / 100
    : roundToPaise(high)
}

/**
 * Initial step-up SIP for a planner goal. When the step-up can never apply
 * (0% step-up or a one-year horizon) it is the fixed SIP.
 */
export function resolveInitialStepUpSip({
  corpus,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  fixedSip,
  search,
}) {
  if (corpus <= 0) return 0
  if (annualStepUpPercent <= 0 || toWholeYears(years) <= 1) return fixedSip
  return searchInitialStepUpSip({
    corpus,
    annualReturnPercent,
    years,
    annualStepUpPercent,
    search,
  })
}

/** Solve required fixed monthly SIP for a target, net of a lump sum */
export function solveRequiredFixedSip({
  targetAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    toWholeYears(years)
  )
  return calculateRequiredSipForCorpus(
    targetAmount - lumpSumFutureValue,
    annualReturnPercent,
    years
  )
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
  const wholeYears = toWholeYears(years)
  const months = wholeYears * 12
  const sipFutureValue = calculateSipFutureValue(
    monthlyAmount,
    annualReturnPercent,
    months
  )
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    wholeYears
  )
  const totalCorpus = sipFutureValue + lumpSumFutureValue
  const totalInvested = monthlyAmount * months + lumpSum

  return {
    totalInvested,
    sipFutureValue,
    lumpSumFutureValue,
    totalCorpus,
    estimatedProfit: totalCorpus - totalInvested,
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
  const wholeYears = toWholeYears(years)
  const months = wholeYears * 12
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    wholeYears
  )
  const lumpSumCoversGoal = lumpSumFutureValue >= targetAmount
  const requiredMonthlySip = lumpSumCoversGoal
    ? 0
    : calculateRequiredSipForCorpus(
        targetAmount - lumpSumFutureValue,
        annualReturnPercent,
        wholeYears
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
    lumpSumCoversGoal,
    sipFutureValue,
    totalCorpus,
    totalInvested,
    wealthGain: totalCorpus - totalInvested,
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
  const wholeYears = toWholeYears(years)
  const { balance, totalInvested } = simulateStepUpSip({
    initialMonthlyAmount,
    annualReturnPercent,
    years: wholeYears,
    annualStepUpPercent,
    lumpSum,
  })

  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    wholeYears
  )

  return {
    totalInvested,
    lumpSumFutureValue,
    sipFutureValue: balance - lumpSumFutureValue,
    totalCorpus: balance,
    estimatedProfit: balance - totalInvested,
  }
}

// ---------------------------------------------------------------------------
// SWP Calculator
// ---------------------------------------------------------------------------

/** Longest withdrawal schedule simulated (50 years) */
export const SWP_MAX_MONTHS = 600

/** Build accumulation corpus before SWP withdrawals begin */
export function calculateSwpAccumulationCorpus({
  monthlySip,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const wholeYears = toWholeYears(years)
  const months = wholeYears * 12
  const sipFutureValue = calculateSipFutureValue(
    monthlySip,
    annualReturnPercent,
    months
  )
  const lumpSumFutureValue = calculateLumpSumFutureValue(
    lumpSum,
    annualReturnPercent,
    wholeYears
  )

  return {
    // The corpus is stated to the rupee and withdrawals start from that figure
    corpusForSwp: Math.round(sipFutureValue + lumpSumFutureValue),
    sipFutureValue,
    lumpSumFutureValue,
    totalInvested: monthlySip * months + lumpSum,
  }
}

/** Simulate SWP withdrawals until corpus is depleted or SWP_MAX_MONTHS pass */
export function simulateSwpWithdrawal({
  corpus,
  monthlyWithdrawal,
  annualStepUpPercent,
  swpReturnPercent,
  maxMonths = SWP_MAX_MONTHS,
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

  const corpusAtEnd = Math.max(0, balance)
  return {
    corpusLastsMonths: schedule.length,
    lastsBeyondSchedule: corpusAtEnd > 0,
    corpusAtEnd,
    totalWithdrawn: schedule.reduce((sum, row) => sum + row.withdrawal, 0),
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
    estimatedProfit: accumulation.corpusForSwp - accumulation.totalInvested,
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
  const wholeYears = toWholeYears(years)
  const inflationAdjustedFutureValue = calculateInflationAdjustedValue(
    presentValue,
    inflationPercent,
    wholeYears
  )
  const lumpSumContributionFv = calculateLumpSumFutureValue(
    lumpSumToday,
    annualReturnPercent,
    wholeYears
  )
  const corpusFromSip = Math.max(0, inflationAdjustedFutureValue - lumpSumContributionFv)

  const fixedSipRequired = roundToPaise(
    calculateRequiredSipForCorpus(corpusFromSip, annualReturnPercent, wholeYears)
  )
  const initialStepUpSipRequired = resolveInitialStepUpSip({
    corpus: corpusFromSip,
    annualReturnPercent,
    years: wholeYears,
    annualStepUpPercent,
    fixedSip: fixedSipRequired,
    search: STEP_UP_SEARCH.goalPlanning,
  })

  return {
    presentValue,
    years: wholeYears,
    inflationPercent,
    inflationAdjustedFutureValue,
    lumpSumContributionFv,
    corpusFromSip,
    lumpSumCoversGoal: corpusFromSip === 0,
    fixedSipRequired,
    initialStepUpSipRequired,
    totalCorpus: inflationAdjustedFutureValue,
  }
}

// ---------------------------------------------------------------------------
// Child Education Planner
// ---------------------------------------------------------------------------

/**
 * Share one lump sum across goals, nearest goal first. Each goal takes only
 * the part it needs; whatever is left moves on to the next goal. Goals with
 * the same horizon keep their input order.
 */
export function allocateLumpSumToGoals(goals, lumpSumToday, annualReturnPercent) {
  const allocations = goals.map(() => ({ lumpSumAllocated: 0, lumpSumContributionFv: 0 }))
  let remaining = lumpSumToday > 0 ? lumpSumToday : 0

  const order = goals
    .map((goal, index) => ({ index, years: goal.yearsToGoal }))
    .sort((a, b) => a.years - b.years || a.index - b.index)

  for (const { index, years } of order) {
    if (remaining <= 0) break
    const growth = Math.pow(1 + annualReturnPercent / 100, years)
    const presentValueNeeded = goals[index].futureValue / growth
    const allocated = Math.min(remaining, presentValueNeeded)
    allocations[index] = {
      lumpSumAllocated: allocated,
      lumpSumContributionFv: allocated * growth,
    }
    remaining -= allocated
  }

  return { allocations, unallocatedLumpSum: remaining }
}

/** One education goal: target, SIP corpus and the SIPs that reach it */
export function calculateEducationGoal({
  presentCost,
  inflationPercent,
  yearsToGoal,
  annualReturnPercent,
  annualStepUpPercent,
  lumpSumContributionFv = 0,
}) {
  const futureValue = calculateInflationAdjustedValue(presentCost, inflationPercent, yearsToGoal)
  const corpusViaSip = Math.max(0, futureValue - lumpSumContributionFv)
  const fixedSipRequired = roundToPaise(
    calculateRequiredSipForCorpus(corpusViaSip, annualReturnPercent, yearsToGoal)
  )
  const initialStepUpSipRequired = resolveInitialStepUpSip({
    corpus: corpusViaSip,
    annualReturnPercent,
    years: yearsToGoal,
    annualStepUpPercent,
    fixedSip: fixedSipRequired,
    search: STEP_UP_SEARCH.childEducation,
  })

  return {
    presentCost,
    inflationPercent,
    yearsToGoal,
    futureValue,
    lumpSumContributionFv,
    corpusViaSip,
    fixedSipRequired,
    initialStepUpSipRequired,
  }
}

/**
 * children: [{ name, currentAge, graduation: { targetAge, presentCost, inflationPercent },
 *              postGraduation: same shape or null }]
 */
export function calculateChildEducationResults({
  annualReturnPercent,
  annualStepUpPercent,
  lumpSumToday = 0,
  children,
}) {
  const goals = []
  children.forEach((child, childIndex) => {
    const plans = [
      ['graduation', child.graduation],
      ['postGraduation', child.postGraduation],
    ]
    for (const [type, plan] of plans) {
      if (!plan) continue
      const yearsToGoal = plan.targetAge - child.currentAge
      goals.push({
        childIndex,
        type,
        plan,
        yearsToGoal,
        futureValue: calculateInflationAdjustedValue(
          plan.presentCost,
          plan.inflationPercent,
          yearsToGoal
        ),
      })
    }
  })

  const { allocations, unallocatedLumpSum } = allocateLumpSumToGoals(
    goals,
    lumpSumToday,
    annualReturnPercent
  )

  const childResults = children.map((child) => ({
    name: child.name,
    currentAge: child.currentAge,
    graduation: null,
    postGraduation: null,
  }))

  const totals = {
    futureValue: 0,
    fixedSipRequired: 0,
    initialStepUpSipRequired: 0,
    lumpSumAllocated: 0,
  }

  goals.forEach((goal, index) => {
    const result = {
      ...calculateEducationGoal({
        presentCost: goal.plan.presentCost,
        inflationPercent: goal.plan.inflationPercent,
        yearsToGoal: goal.yearsToGoal,
        annualReturnPercent,
        annualStepUpPercent,
        lumpSumContributionFv: allocations[index].lumpSumContributionFv,
      }),
      lumpSumAllocated: allocations[index].lumpSumAllocated,
    }
    childResults[goal.childIndex][goal.type] = result
    totals.futureValue += result.futureValue
    totals.fixedSipRequired += result.fixedSipRequired
    totals.initialStepUpSipRequired += result.initialStepUpSipRequired
    totals.lumpSumAllocated += result.lumpSumAllocated
  })

  return { childResults, totals, unallocatedLumpSum }
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
  lumpSumSaved = 0,
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

  // Savings beyond the corpus leave nothing to fund; the excess is a surplus
  const shortfall = totalRetirementCorpusNeeded - futureValueOfCurrentSavings
  const additionalCorpusNeeded = Math.max(0, shortfall)
  const surplusAtRetirement = Math.max(0, -shortfall)

  const monthlySipRequiredFixed = roundToPaise(
    calculateRequiredSipForCorpus(
      additionalCorpusNeeded,
      preRetirementReturnPercent,
      yearsToRetirement
    )
  )

  const stepUpSipStartingAmount = resolveInitialStepUpSip({
    corpus: additionalCorpusNeeded,
    annualReturnPercent: preRetirementReturnPercent,
    years: yearsToRetirement,
    annualStepUpPercent: stepUpSipPercent,
    fixedSip: monthlySipRequiredFixed,
    search: STEP_UP_SEARCH.retirement,
  })

  return {
    yearsToRetirement,
    retirementYears,
    annualExpensesAtRetirement,
    totalRetirementCorpusNeeded,
    futureValueOfCurrentSavings,
    additionalCorpusNeeded,
    surplusAtRetirement,
    monthlySipRequiredFixed,
    stepUpSipStartingAmount,
  }
}

// ---------------------------------------------------------------------------
// Yearly projections
// ---------------------------------------------------------------------------

/** Interest Earned is the growth during that year only */
export function buildSipYearlyProjection({
  monthlyAmount,
  annualReturnPercent,
  years,
  lumpSum = 0,
}) {
  const rows = []
  const annualInvestment = monthlyAmount * 12
  let previousValue = lumpSum

  for (let year = 1; year <= toWholeYears(years); year++) {
    const portfolioValue =
      calculateSipFutureValue(monthlyAmount, annualReturnPercent, year * 12) +
      calculateLumpSumFutureValue(lumpSum, annualReturnPercent, year)

    rows.push({
      year,
      annualInvestment,
      cumulativeInvestment: annualInvestment * year + lumpSum,
      interestEarned: portfolioValue - previousValue - annualInvestment,
      portfolioValue,
    })
    previousValue = portfolioValue
  }

  return rows
}

/** Interest Earned is the growth during that year only */
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

  for (let year = 1; year <= toWholeYears(years); year++) {
    const sipAtYearStart = monthlySip
    const balanceAtYearStart = balance
    let annualInvestment = 0

    for (let month = 0; month < 12; month++) {
      balance = (balance + monthlySip) * (1 + monthlyRate)
      totalInvested += monthlySip
      annualInvestment += monthlySip
    }

    monthlySip *= 1 + annualStepUpPercent / 100

    rows.push({
      year,
      monthlySip: sipAtYearStart,
      annualInvestment,
      cumulativeInvestment: totalInvested,
      interestEarned: balance - balanceAtYearStart - annualInvestment,
      portfolioValue: balance,
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
