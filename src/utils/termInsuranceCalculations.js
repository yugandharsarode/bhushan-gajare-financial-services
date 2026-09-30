/**
 * Term insurance cover: Human Life Value and Need-Based methods.
 *
 * Conventions (match the reference calculator):
 * - Year k cash flow is today's amount grown for (k - 1) years, so year 1 is
 *   today's income or expense
 * - Each year's cash flow is discounted from the end of that year: / (1 + r)^k
 * - Need-based living expenses are covered until the spouse reaches age 90
 * - A goal's own inflation is used when given, otherwise the general inflation
 */

export const NEED_BASED_SUPPORT_UNTIL_AGE = 90

/** Present value of a yearly stream that starts at `amount` and grows each year */
export function buildGrowingStreamProjection({ amount, growthPercent, discountPercent, years }) {
  const rows = []
  let totalPresentValue = 0

  for (let year = 1; year <= years; year++) {
    const cashFlow = amount * Math.pow(1 + growthPercent / 100, year - 1)
    const presentValue = cashFlow / Math.pow(1 + discountPercent / 100, year)
    totalPresentValue += presentValue
    rows.push({ year, cashFlow, presentValue })
  }

  return { rows, totalPresentValue }
}

export function calculateHumanLifeValue({
  currentAge,
  retirementAge,
  annualIncome,
  salaryHikePercent,
  discountRatePercent,
}) {
  const workingYears = Math.max(0, retirementAge - currentAge)
  const { rows, totalPresentValue } = buildGrowingStreamProjection({
    amount: annualIncome,
    growthPercent: salaryHikePercent,
    discountPercent: discountRatePercent,
    years: workingYears,
  })

  return {
    workingYears,
    humanLifeValue: totalPresentValue,
    projection: rows.map(({ year, cashFlow, presentValue }) => ({
      year,
      income: cashFlow,
      presentValue,
    })),
  }
}

/** goals: [{ description, presentCost, years, inflationPercent (null = general inflation) }] */
export function calculateNeedBasedCover({
  spouseAge,
  annualFamilyExpenses,
  inflationPercent,
  returnPercent,
  outstandingLoans = 0,
  goals = [],
}) {
  const supportYears = Math.max(0, NEED_BASED_SUPPORT_UNTIL_AGE - spouseAge)
  const { rows, totalPresentValue } = buildGrowingStreamProjection({
    amount: annualFamilyExpenses,
    growthPercent: inflationPercent,
    discountPercent: returnPercent,
    years: supportYears,
  })

  const goalResults = goals.map((goal) => {
    const goalInflation = goal.inflationPercent ?? inflationPercent
    const futureValue = goal.presentCost * Math.pow(1 + goalInflation / 100, goal.years)
    return {
      description: goal.description,
      presentCost: goal.presentCost,
      years: goal.years,
      inflationPercent: goalInflation,
      futureValue,
      presentValue: futureValue / Math.pow(1 + returnPercent / 100, goal.years),
    }
  })

  const totalGoalsPresentValue = goalResults.reduce((sum, goal) => sum + goal.presentValue, 0)

  return {
    supportYears,
    presentValueOfLivingExpenses: totalPresentValue,
    goals: goalResults,
    totalGoalsPresentValue,
    outstandingLoans,
    totalCover: totalPresentValue + totalGoalsPresentValue + outstandingLoans,
    projection: rows.map(({ year, cashFlow, presentValue }) => ({
      year,
      expense: cashFlow,
      presentValue,
    })),
  }
}
