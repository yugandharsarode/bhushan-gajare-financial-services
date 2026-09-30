import { suite, seededRandom } from './harness.mjs'
import {
  calculateStepUpSipResults,
  buildStepUpYearlyProjection,
  calculateSipResults,
} from '../../src/utils/financialCalculations.js'
import { stepUpSipSchema, validateStepUpSipCross } from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Step-Up SIP Calculator')

// [monthly, lumpSum, years, stepUp%, return%] → [invested, fvLump, fvSips, total, profit]
const REFERENCE = [
  ['TC1', [7350, 0, 13, 9.3, 11.7], [2064950, 0, 4047007, 4047007, 1982057]],
  ['TC2', [4275, 123456, 8, 6.5, 10.35], [640399, 271451, 764563, 1036014, 395615]],
  ['TC3', [12480, 55000, 17, 12, 13.2], [7375819, 452639, 18213572, 18666211, 11290392]],
  ['TC4 step-up 0', [2999, 0, 5, 0, 8.8], [179940, 0, 224615, 224615, 44675]],
  ['E3 lump sum only', [0, 100000, 3, 10, 12], [100000, 140493, 0, 140493, 40493]],
  ['E4', [1000, 100000, 1, 0, 12], [112000, 112000, 12766, 124766, 12766]],
  ['E8 0% return', [3333, 44444, 6, 0, 0], [284420, 44444, 239976, 284420, 0]],
  ['F1 fresh', [6180, 38250, 11, 8.4, 12.6], [1299332, 141109, 2375219, 2516328, 1216995]],
  ['F2 fresh', [15555, 0, 22, 5.5, 10.9], [7627732, 0, 23741043, 23741043, 16113311]],
]

for (const [name, [initialMonthlyAmount, lumpSum, years, annualStepUpPercent, annualReturnPercent], expected] of REFERENCE) {
  const r = calculateStepUpSipResults({ initialMonthlyAmount, lumpSum, years, annualStepUpPercent, annualReturnPercent })
  const [invested, fvLump, fvSips, total, profit] = expected
  t.rupees(`${name} invested`, r.totalInvested, invested)
  t.rupees(`${name} FV of lump sum`, r.lumpSumFutureValue, fvLump)
  t.rupees(`${name} FV of SIPs`, r.sipFutureValue, fvSips)
  t.rupees(`${name} total corpus`, r.totalCorpus, total)
  t.rupees(`${name} profit`, r.estimatedProfit, profit)
}

t.rupees('E1 one year at 12%', calculateStepUpSipResults({ initialMonthlyAmount: 10000, lumpSum: 0, years: 1, annualStepUpPercent: 10, annualReturnPercent: 12 }).totalCorpus, 127665)
t.rupees('E6 40 years', calculateStepUpSipResults({ initialMonthlyAmount: 5000, lumpSum: 250000, years: 40, annualStepUpPercent: 15, annualReturnPercent: 14 }).totalCorpus, 556317822)
const e7 = calculateStepUpSipResults({ initialMonthlyAmount: 8123, lumpSum: 0, years: 4, annualStepUpPercent: 7.75, annualReturnPercent: 9.6 })
t.rupees('E7 total', e7.totalCorpus, 526130)
t.rupees('E7 invested', e7.totalInvested, 437618)
t.rupees('E7 profit from unrounded values', e7.estimatedProfit, 88513)

// Reference table rows: [year, annual, cumulative, interestForYear, yearEnd]
const TABLES = [
  ['TC1', [7350, 0, 13, 9.3, 11.7], [[1, 88200, 88200, 5495, 93695], [2, 96403, 184603, 16969, 207066], [3, 105368, 289971, 30792, 343226], [13, 256396, 2064950, 411348, 4047007]]],
  ['TC2', [4275, 123456, 8, 6.5, 10.35], [[1, 51300, 174756, 15610, 190366], [2, 54635, 229391, 22720, 267721], [3, 58186, 287576, 30922, 356829], [8, 79720, 640399, 93682, 1036014]]],
  ['TC3', [12480, 55000, 17, 12, 13.2], [[1, 149760, 204760, 17765, 222525], [2, 167731, 372491, 41139, 431395], [3, 187859, 560350, 70122, 689376], [17, 918088, 7375819, 2126460, 18666211]]],
  ['TC4', [2999, 0, 5, 0, 8.8], [[1, 35988, 35988, 1693, 37681], [2, 35988, 71976, 5009, 78679], [3, 35988, 107964, 8617, 123284], [5, 35988, 179940, 16813, 224615]]],
  ['F1', [6180, 38250, 11, 8.4, 12.6], [[1, 74160, 112410, 9789, 122199], [11, 166136, 1299332, 272875, 2516328]]],
  ['F2', [15555, 0, 22, 5.5, 10.9], [[1, 186660, 186660, 10847, 197507], [22, 574583, 7627732, 2307063, 23741043]]],
]

for (const [name, [initialMonthlyAmount, lumpSum, years, annualStepUpPercent, annualReturnPercent], rows] of TABLES) {
  const table = buildStepUpYearlyProjection({ initialMonthlyAmount, lumpSum, years, annualStepUpPercent, annualReturnPercent })
  for (const [year, annual, cumulative, interest, yearEnd] of rows) {
    const row = table[year - 1]
    t.rupees(`${name} row ${year} annual investment`, row.annualInvestment, annual)
    t.rupees(`${name} row ${year} cumulative investment`, row.cumulativeInvestment, cumulative)
    t.rupees(`${name} row ${year} interest for the year`, row.interestEarned, interest)
    t.rupees(`${name} row ${year} year-end value`, row.portfolioValue, yearEnd)
  }
}

const e2 = buildStepUpYearlyProjection({ initialMonthlyAmount: 10000, lumpSum: 0, years: 3, annualStepUpPercent: 50, annualReturnPercent: 0 })
t.equal('E2 step-up applies after every 12 instalments', e2.map((row) => Math.round(row.annualInvestment)), [120000, 180000, 270000])
const e9 = buildStepUpYearlyProjection({ initialMonthlyAmount: 10000, lumpSum: 0, years: 2, annualStepUpPercent: 10, annualReturnPercent: 12 })
t.rupees('E9 interest column is for that year only', e9[1].interestEarned, 23751)

// Fractional years: summary and table both use whole years (previously 2.5 years ran 3 years of SIPs)
const e5 = calculateStepUpSipResults({ initialMonthlyAmount: 5000, lumpSum: 0, years: 2.5, annualStepUpPercent: 10, annualReturnPercent: 12 })
t.rupees('E5 2.5 years treated as 2: invested', e5.totalInvested, 126000)
t.rupees('E5 2.5 years treated as 2: total', e5.totalCorpus, 141708)
const x1 = calculateStepUpSipResults({ initialMonthlyAmount: 2500, lumpSum: 100000, years: 2.9, annualStepUpPercent: 10, annualReturnPercent: 12 })
t.rupees('X1 2.9 years: lump sum grows 2 years', x1.lumpSumFutureValue, 125440)
t.rupees('X1 2.9 years: total', x1.totalCorpus, 196294)
const x1Table = buildStepUpYearlyProjection({ initialMonthlyAmount: 2500, lumpSum: 100000, years: 2.9, annualStepUpPercent: 10, annualReturnPercent: 12 })
t.close('X1 table last row equals summary', x1Table.at(-1).portfolioValue, x1.totalCorpus, 1e-6)

// Additional values
const random = seededRandom(99)
for (let n = 0; n < 50; n++) {
  const initialMonthlyAmount = Math.round(500 + random() * 50000)
  const lumpSum = random() < 0.5 ? 0 : Math.round(random() * 2000000)
  const years = 1 + Math.floor(random() * 35)
  const annualReturnPercent = Math.round(random() * 1600) / 100
  const annualStepUpPercent = Math.round(random() * 2000) / 100

  const r = calculateStepUpSipResults({ initialMonthlyAmount, lumpSum, years, annualStepUpPercent, annualReturnPercent })
  const table = buildStepUpYearlyProjection({ initialMonthlyAmount, lumpSum, years, annualStepUpPercent, annualReturnPercent })
  t.close(`random ${n}: table last row equals summary`, table.at(-1).portfolioValue, r.totalCorpus, 1e-6 * r.totalCorpus)
  t.close(`random ${n}: yearly interest adds up to profit`, table.reduce((sum, row) => sum + row.interestEarned, 0), r.estimatedProfit, 1e-4 * r.totalCorpus)

  const flat = calculateStepUpSipResults({ initialMonthlyAmount, lumpSum, years, annualStepUpPercent: 0, annualReturnPercent })
  const plain = calculateSipResults({ monthlyAmount: initialMonthlyAmount, lumpSum, years, annualReturnPercent })
  t.close(`random ${n}: 0% step-up equals a plain SIP`, flat.totalCorpus, plain.totalCorpus, 1e-6 * plain.totalCorpus)
  t.ok(`random ${n}: step-up never lowers the corpus`, r.totalCorpus >= flat.totalCorpus - 1e-6)
  t.finite(`random ${n}: no NaN/Infinity`, { r, table })
}

// Validation
const v = (values) => {
  const fieldErrors = validateFields(values, stepUpSipSchema)
  return { ...validateStepUpSipCross(values, fieldErrors), ...fieldErrors }
}
const valid = { initialMonthlyAmount: '5000', lumpSum: '', years: '10', annualStepUp: '10', annualReturn: '12' }
t.equal('valid form', v(valid), {})
t.equal('0% step-up accepted', v({ ...valid, annualStepUp: '0' }), {})
t.equal('negative step-up rejected', v({ ...valid, annualStepUp: '-5' }).annualStepUp, 'Annual step-up percentage cannot be negative')
t.equal('blank step-up rejected', v({ ...valid, annualStepUp: '' }).annualStepUp, 'Annual step-up percentage is required')
t.equal('blank return rejected', v({ ...valid, annualReturn: '' }).annualReturn, 'Expected annual return is required')
t.equal('fractional years rejected', v({ ...valid, years: '2.5' }).years, 'Investment period must be a whole number')
t.equal('no SIP and no lump sum', v({ ...valid, initialMonthlyAmount: '0' }).initialMonthlyAmount, 'Enter a monthly SIP amount or a lump sum investment')
