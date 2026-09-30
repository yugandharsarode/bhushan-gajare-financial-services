import { suite, seededRandom } from './harness.mjs'
import { calculateHumanLifeValue, calculateNeedBasedCover } from '../../src/utils/termInsuranceCalculations.js'
import {
  humanLifeValueSchema,
  validateHumanLifeValueCross,
  validateNeedBasedForm,
  toNeedBasedInput,
} from '../../src/config/calculatorSchemas.js'
import { validateFields } from '../../src/utils/calculatorValidation.js'

const t = suite('Term Insurance Coverage')

// Human Life Value: [age, retirement age, income, hike%, discount%] → HLV, rows [year, income, pv]
const HLV = [
  ['H1', [33, 58, 735450, 6.3, 8.7], 13107573, 25, [[1, 735450, 676587], [2, 781783, 661648], [3, 831036, 647040], [25, 3186776, 395925]]],
  ['H2 hike above discount', [41, 62, 1248000, 9.5, 7.2], 30479969, 21, [[1, 1248000, 1164179], [2, 1366560, 1189157], [3, 1496383, 1214670], [21, 7664732, 1779945]]],
  ['H3 hike 0', [27, 60, 486250, 0, 9.3], 4950580, 33, [[1, 486250, 444876], [2, 486250, 407023], [3, 486250, 372391], [33, 486250, 25846]]],
  ['H4 hike equals discount', [45, 57, 2365700, 7.4, 7.4], 26432402, 12, [[1, 2365700, 2202700], [2, 2540762, 2202700], [12, 5188081, 2202700]]],
  ['Defaults', [30, 60, 1000000, 7, 8], 24351440, 30, [[1, 1000000, 925926], [30, 7114257, 706996]]],
  ['FT1 fresh', [36, 61, 876540, 5.8, 9.1], 14236994, 25, [[1, 876540, 803428], [25, 3391781, 384423]]],
]

for (const [name, [currentAge, retirementAge, annualIncome, salaryHikePercent, discountRatePercent], hlv, rowCount, rows] of HLV) {
  const r = calculateHumanLifeValue({ currentAge, retirementAge, annualIncome, salaryHikePercent, discountRatePercent })
  t.rupees(`${name} human life value`, r.humanLifeValue, hlv)
  t.equal(`${name} ${rowCount} yearly rows`, r.projection.length, rowCount)
  for (const [year, income, pv] of rows) {
    t.rupees(`${name} year ${year} income`, r.projection[year - 1].income, income)
    t.rupees(`${name} year ${year} present value`, r.projection[year - 1].presentValue, pv)
  }
}
t.rupees('T5 one year: income discounted one full year', calculateHumanLifeValue({ currentAge: 30, retirementAge: 31, annualIncome: 600000, salaryHikePercent: 7, discountRatePercent: 8 }).humanLifeValue, 555556)
t.rupees('T5c 0% hike and discount: plain sum', calculateHumanLifeValue({ currentAge: 30, retirementAge: 35, annualIncome: 600000, salaryHikePercent: 0, discountRatePercent: 0 }).humanLifeValue, 3000000)

// Need-based: goals use their own inflation when given (null = general inflation)
const goal = (description, presentCost, years, inflationPercent = null) => ({ description, presentCost, years, inflationPercent })
const NEED = [
  {
    name: 'N1 one goal',
    input: { spouseAge: 31, annualFamilyExpenses: 735450, inflationPercent: 6.3, returnPercent: 8.1, outstandingLoans: 2345000, goals: [goal('College', 1500000, 13, 9.5)] },
    total: 29805006, pvExpenses: 25686876, goals: [1773131], rowCount: 59,
    rows: [[1, 735450, 680342], [2, 781783, 669014], [3, 831036, 657874], [59, 25437973, 256901]],
  },
  {
    name: 'N2 no goals, no loans',
    input: { spouseAge: 40, annualFamilyExpenses: 486250, inflationPercent: 5.7, returnPercent: 7.4, outstandingLoans: 0, goals: [] },
    total: 15722048, pvExpenses: 15722048, goals: [], rowCount: 50,
    rows: [[1, 486250, 452747], [2, 513966, 445580], [3, 543262, 438527], [50, 7354176, 207167]],
  },
  {
    name: 'N3 return equals inflation, blank goal inflation',
    input: { spouseAge: 27, annualFamilyExpenses: 987600, inflationPercent: 6.8, returnPercent: 6.8, outstandingLoans: 550000, goals: [goal('College', 1200000, 16, 10), goal('Wedding', 800000, 22)] },
    total: 61531831, pvExpenses: 58257303, goals: [1924528, 800000], rowCount: 63,
    rows: [[1, 987600, 924719], [2, 1054757, 924719], [63, 58344342, 924719]],
  },
  {
    name: 'N4 two short goals, large loans',
    input: { spouseAge: 44, annualFamilyExpenses: 1234560, inflationPercent: 7.2, returnPercent: 9.6, outstandingLoans: 4800000, goals: [goal('Home', 2575000, 7, 8.3), goal('Car', 935000, 3, 4.1)] },
    total: 40832842, pvExpenses: 32862999, goals: [2368659, 801184], rowCount: 46,
    rows: [[1, 1234560, 1126423], [2, 1323448, 1101757], [3, 1418737, 1077631], [46, 28201846, 415903]],
  },
  {
    name: 'Defaults',
    input: { spouseAge: 28, annualFamilyExpenses: 600000, inflationPercent: 6, returnPercent: 8, outstandingLoans: 2000000, goals: [] },
    total: 22585179, pvExpenses: 20585179, goals: [], rowCount: 62,
    rows: [[1, 600000, 555556], [62, 20980171, 177638]],
  },
  {
    name: 'FT2 fresh, explicit 0% and blank goal inflation',
    input: { spouseAge: 35, annualFamilyExpenses: 654320, inflationPercent: 5.9, returnPercent: 7.7, outstandingLoans: 3125000, goals: [goal('Daughter PG', 1850000, 14, 8.8), goal('Zero-infl', 500000, 6, 0), goal('Blank-infl', 300000, 9)] },
    total: 27801379, pvExpenses: 21965384, goals: [2132831, 320388, 257777], rowCount: 55,
    rows: [[55, 14460125, 244517]],
  },
]

for (const { name, input, total, pvExpenses, goals, rowCount, rows } of NEED) {
  const r = calculateNeedBasedCover(input)
  t.rupees(`${name} total cover`, r.totalCover, total)
  t.rupees(`${name} PV of living expenses`, r.presentValueOfLivingExpenses, pvExpenses)
  goals.forEach((pv, i) => t.rupees(`${name} goal ${i + 1} PV`, r.goals[i].presentValue, pv))
  t.equal(`${name} ${rowCount} yearly rows`, r.projection.length, rowCount)
  for (const [year, expense, pv] of rows) {
    t.rupees(`${name} year ${year} expense`, r.projection[year - 1].expense, expense)
    t.rupees(`${name} year ${year} present value`, r.projection[year - 1].presentValue, pv)
  }
}

t.rupees('T7 spouse 89: one year of expenses', calculateNeedBasedCover({ spouseAge: 89, annualFamilyExpenses: 600000, inflationPercent: 6, returnPercent: 8, outstandingLoans: 1000000 }).totalCover, 1555556)
t.rupees('T8 blank goal inflation uses general inflation', calculateNeedBasedCover({ spouseAge: 60, annualFamilyExpenses: 600000, inflationPercent: 6, returnPercent: 8, goals: [goal('Edu', 1000000, 10)] }).goals[0].presentValue, 829509)
t.rupees('T17 goal PV (7.5 years)', calculateNeedBasedCover({ spouseAge: 60, annualFamilyExpenses: 600000, inflationPercent: 6, returnPercent: 8, goals: [goal('F', 1000000, 7.5)] }).goals[0].presentValue, 869192)
t.rupees('T18 goal beyond the expense horizon still counted', calculateNeedBasedCover({ spouseAge: 60, annualFamilyExpenses: 600000, inflationPercent: 6, returnPercent: 8, goals: [goal('Late', 1000000, 45)] }).goals[0].presentValue, 431216)

// Additional values: closed-form growing annuity, 0% return, finiteness
const random = seededRandom(1618)
for (let n = 0; n < 60; n++) {
  const I = Math.round(200000 + random() * 5000000)
  const h = Math.round(random() * 1200) / 100
  const d = Math.round(random() * 1200) / 100
  const currentAge = 20 + Math.floor(random() * 40)
  const years = 1 + Math.floor(random() * 40)
  const r = calculateHumanLifeValue({ currentAge, retirementAge: currentAge + years, annualIncome: I, salaryHikePercent: h, discountRatePercent: d })
  const ratio = (1 + h / 100) / (1 + d / 100)
  const closedForm = Math.abs(ratio - 1) < 1e-12 ? (I * years) / (1 + d / 100) : ((I / (1 + d / 100)) * (1 - Math.pow(ratio, years))) / (1 - ratio)
  t.close(`random ${n}: HLV equals growing-annuity formula`, r.humanLifeValue, closedForm, 1e-6 * closedForm)
  t.finite(`random ${n}: no NaN/Infinity`, r)
}
const zeroReturn = calculateNeedBasedCover({ spouseAge: 70, annualFamilyExpenses: 500000, inflationPercent: 0, returnPercent: 0, outstandingLoans: 100000, goals: [goal('G', 200000, 5)] })
t.rupees('0% return and inflation: undiscounted total', zeroReturn.totalCover, 20 * 500000 + 200000 + 100000)

// Validation
const hlv = (values) => {
  const fieldErrors = validateFields(values, humanLifeValueSchema)
  return { ...validateHumanLifeValueCross(values, fieldErrors), ...fieldErrors }
}
const validHlv = { currentAge: '30', retirementAge: '60', annualIncome: '1000000', salaryHike: '7', discountRate: '8' }
t.equal('HLV valid', hlv(validHlv), {})
t.equal('HLV 0% hike accepted', hlv({ ...validHlv, salaryHike: '0' }), {})
t.equal('HLV retirement not after current age', hlv({ ...validHlv, retirementAge: '30' }).retirementAge, 'Retirement age must be greater than current age')
t.equal('HLV age under 18', hlv({ ...validHlv, currentAge: '16' }).currentAge, 'Current age must be at least 18 years')
t.equal('HLV income required', hlv({ ...validHlv, annualIncome: '' }).annualIncome, 'Current annual income is required')

const needForm = (goals, overrides = {}) => ({ spouseAge: '28', annualFamilyExpenses: '600000', inflation: '6', returnRate: '8', outstandingLoans: '', goals, ...overrides })
const blankGoal = { description: '', presentCost: '', years: '', inflationPercent: '' }
t.equal('Need valid with a blank goal row', validateNeedBasedForm(needForm([blankGoal])), {})
t.equal('Need spouse age 90 rejected', validateNeedBasedForm(needForm([], { spouseAge: '90' })).spouseAge, 'Spouse age must be at most 89 years')
t.equal('Need partly filled goal', Object.keys(validateNeedBasedForm(needForm([{ ...blankGoal, description: 'College' }]))).sort(), ['goal0_presentCost', 'goal0_years'])
t.equal('Need goal years must be at least 1', validateNeedBasedForm(needForm([{ ...blankGoal, presentCost: '100000', years: '0' }])).goal0_years, 'Years from now must be greater than zero')
const parsed = toNeedBasedInput(needForm([blankGoal, { description: '', presentCost: '500000', years: '6', inflationPercent: '0' }, { description: 'Wedding', presentCost: '800000', years: '10', inflationPercent: '' }]))
t.equal('blank rows dropped', parsed.goals.length, 2)
t.equal('explicit 0% goal inflation kept', parsed.goals[0].inflationPercent, 0)
t.equal('blank goal inflation means general inflation', parsed.goals[1].inflationPercent, null)
t.equal('blank loans are 0', parsed.outstandingLoans, 0)
