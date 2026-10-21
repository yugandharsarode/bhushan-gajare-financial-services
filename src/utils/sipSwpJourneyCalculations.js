/**
 * SIP to SWP Journey Planner: Build (monthly SIP) → Grow (no new money) →
 * Withdraw (monthly SWP).
 *
 * Uses the same conventions as the SIP and SWP calculators, so the stages agree
 * with those calculators exactly:
 * - Effective monthly rate (1+r)^(1/12) - 1 in every stage
 * - SIP instalments at the start of each month; lump sum at the start of Build
 * - Withdrawals at the start of each month; the remaining balance then earns
 *   that month's return
 * - Stage durations are whole years
 */

import {
  buildSipYearlyProjection,
  calculateSipResults,
  getMonthlyRate,
  simulateSwpWithdrawal,
  toWholeYears,
} from './financialCalculations.js'

/** A withdrawal short by less than half a paisa is rounding noise, not a missed payment */
const PAISA_TOLERANCE = 0.005

export const JOURNEY_STAGES = {
  build: 'Build',
  grow: 'Grow',
  withdraw: 'Withdraw',
}

/**
 * Present value, at the start of withdrawals, of ₹1 withdrawn at the start of
 * each month for `months` months (annuity due).
 */
function withdrawalAnnuityFactor(annualReturnPercent, months) {
  if (months <= 0) return 0
  const i = getMonthlyRate(annualReturnPercent)
  if (i === 0) return months
  return ((1 - Math.pow(1 + i, -months)) / i) * (1 + i)
}

/** Split a month count into whole years and leftover months */
export function splitMonths(totalMonths) {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 }
}

export function calculateSipSwpJourney({
  monthlySip,
  lumpSum = 0,
  buildReturnPercent,
  buildYears,
  growReturnPercent,
  growYears,
  monthlyWithdrawal,
  withdrawReturnPercent,
  withdrawYears,
}) {
  const build = toWholeYears(buildYears)
  const grow = toWholeYears(growYears)
  const withdraw = toWholeYears(withdrawYears)
  const withdrawMonths = withdraw * 12

  // Stage 1 – Build: identical to the SIP calculator
  const sip = calculateSipResults({
    monthlyAmount: monthlySip,
    annualReturnPercent: buildReturnPercent,
    years: build,
    lumpSum,
  })
  const corpusAfterBuild = sip.totalCorpus

  // Stage 2 – Grow: 12 × grow months at the effective monthly rate = whole years at the annual rate
  const corpusAfterGrow = corpusAfterBuild * Math.pow(1 + growReturnPercent / 100, grow)

  // Stage 3 – Withdraw: the SWP calculator's withdrawal schedule, no step-up
  const swp = simulateSwpWithdrawal({
    corpus: corpusAfterGrow,
    monthlyWithdrawal,
    annualStepUpPercent: 0,
    swpReturnPercent: withdrawReturnPercent,
    maxMonths: withdrawMonths,
  })

  const shortMonth = swp.schedule.find(
    (row) => row.withdrawal < monthlyWithdrawal - PAISA_TOLERANCE
  )
  // Months paid in full; the schedule also stops early if the corpus hits exactly zero
  const monthsFullyFunded = shortMonth ? shortMonth.month - 1 : swp.schedule.length
  const sufficient = monthsFullyFunded >= withdrawMonths
  const remainingCorpus = sufficient ? swp.corpusAtEnd : 0
  const totalWithdrawn = swp.totalWithdrawn

  const factor = withdrawalAnnuityFactor(withdrawReturnPercent, withdrawMonths)
  const requiredCorpus = monthlyWithdrawal * factor

  const monthsBeforeWithdrawals = (build + grow) * 12
  // The month of the whole journey in which the corpus can no longer pay in full
  const runOutJourneyMonth = sufficient ? null : monthsBeforeWithdrawals + monthsFullyFunded + 1

  return {
    stageYears: { build, grow, withdraw },
    totalYears: build + grow + withdraw,

    // Build
    totalSipInvested: monthlySip * build * 12,
    lumpSum,
    totalInvested: sip.totalInvested,
    corpusAfterBuild,
    buildGrowth: corpusAfterBuild - sip.totalInvested,

    // Grow
    corpusAfterGrow,
    growGrowth: corpusAfterGrow - corpusAfterBuild,
    estimatedGrowth: corpusAfterGrow - sip.totalInvested,

    // Withdraw
    monthlyWithdrawal,
    plannedWithdrawals: monthlyWithdrawal * withdrawMonths,
    totalWithdrawn,
    withdrawalShortfall: Math.max(0, monthlyWithdrawal * withdrawMonths - totalWithdrawn),
    withdrawReturns: totalWithdrawn + remainingCorpus - corpusAfterGrow,
    remainingCorpus,
    sufficient,
    monthsFullyFunded,
    lastsFor: splitMonths(monthsFullyFunded),
    runOutJourneyYear: runOutJourneyMonth ? Math.ceil(runOutJourneyMonth / 12) : null,

    // What would make the plan last the full withdrawal period
    requiredCorpus,
    additionalCorpusNeeded: Math.max(0, requiredCorpus - corpusAfterGrow),
    sustainableMonthlyWithdrawal: factor > 0 ? corpusAfterGrow / factor : 0,

    schedule: swp.schedule,
  }
}

/**
 * One row per year of the journey:
 * { year, stage, invested, withdrawn, growth, corpus }
 * where opening corpus + invested − withdrawn + growth = corpus.
 */
export function buildJourneyYearlyRows(inputs, result) {
  const { build, grow, withdraw } = result.stageYears
  const rows = []

  const sipRows = buildSipYearlyProjection({
    monthlyAmount: inputs.monthlySip,
    annualReturnPercent: inputs.buildReturnPercent,
    years: build,
    lumpSum: inputs.lumpSum ?? 0,
  })
  for (const row of sipRows) {
    rows.push({
      year: row.year,
      stage: JOURNEY_STAGES.build,
      // The lump sum is invested at the start of year 1
      invested: row.annualInvestment + (row.year === 1 ? inputs.lumpSum ?? 0 : 0),
      withdrawn: 0,
      growth: row.interestEarned,
      corpus: row.portfolioValue,
    })
  }

  let corpus = result.corpusAfterBuild
  const growFactor = 1 + inputs.growReturnPercent / 100
  for (let y = 1; y <= grow; y++) {
    const next = corpus * growFactor
    rows.push({
      year: build + y,
      stage: JOURNEY_STAGES.grow,
      invested: 0,
      withdrawn: 0,
      growth: next - corpus,
      corpus: next,
    })
    corpus = next
  }

  for (let y = 1; y <= withdraw; y++) {
    const months = result.schedule.slice((y - 1) * 12, y * 12)
    const withdrawn = months.reduce((sum, row) => sum + row.withdrawal, 0)
    const growth = months.reduce((sum, row) => sum + row.returns, 0)
    rows.push({
      year: build + grow + y,
      stage: JOURNEY_STAGES.withdraw,
      invested: 0,
      withdrawn,
      growth,
      // Once the corpus runs out the schedule stops, so later years stay at zero
      corpus: months.length ? months[months.length - 1].endBalance : 0,
    })
  }

  return rows
}
