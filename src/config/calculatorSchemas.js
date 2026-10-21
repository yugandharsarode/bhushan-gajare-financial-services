/**
 * Input rules for every calculator form. Pages validate with these and the
 * calculation tests import them, so a rule only lives in one place.
 */

import {
  MAX_AMOUNT,
  isBlank,
  toNumericValues,
  validateFields,
  validateNumberField,
} from '../utils/calculatorValidation.js'

const amount = (label, extra = {}) => ({ label, max: MAX_AMOUNT, currency: true, ...extra })
const percent = (label, extra = {}) => ({ label, max: 100, unit: '%', ...extra })
const wholeYears = (label, max, extra = {}) => ({
  label,
  integer: true,
  min: 1,
  max,
  unit: ' years',
  ...extra,
})
const age = (label, min, max) => ({ label, required: true, allowZero: min === 0, integer: true, min, max, unit: ' years' })

const numeric = (value) => (isBlank(value) ? 0 : Number(value))

/** Only report a cross-field error when the fields involved are otherwise valid */
const fieldsValid = (fieldErrors, ...keys) => keys.every((key) => !fieldErrors[key])

// ---------------------------------------------------------------------------
// Value of Money & SIPs
// ---------------------------------------------------------------------------

export const sipSchema = {
  monthlyAmount: amount('Monthly SIP amount', { required: true, allowZero: true }),
  lumpSum: amount('Lump sum investment'),
  annualReturn: percent('Expected annual return', { required: true, allowZero: true }),
  years: wholeYears('Investment period', 100, { required: true }),
}

export function validateSipCross(values, fieldErrors) {
  if (
    fieldsValid(fieldErrors, 'monthlyAmount', 'lumpSum') &&
    numeric(values.monthlyAmount) === 0 &&
    numeric(values.lumpSum) === 0
  ) {
    return { monthlyAmount: 'Enter a monthly SIP amount or a lump sum investment' }
  }
  return {}
}

/** SIP to SWP Journey Planner, the optional mode of the SIP calculator (Build fields are the SIP fields) */
export const sipSwpJourneySchema = {
  monthlyAmount: amount('Monthly SIP amount', { required: true, allowZero: true }),
  lumpSum: amount('Lump sum investment'),
  annualReturn: percent('Expected annual return', { required: true, allowZero: true }),
  years: wholeYears('Build duration', 50, { required: true }),
  growReturn: percent('Expected return during growth', { allowZero: true }),
  growYears: wholeYears('Grow duration', 50, { required: true, allowZero: true, min: 0 }),
  monthlyWithdrawal: amount('Monthly withdrawal', { required: true }),
  withdrawReturn: percent('Expected return during withdrawals', { required: true, allowZero: true }),
  withdrawYears: wholeYears('Withdrawal duration', 50, { required: true }),
}

export function validateSipSwpJourneyCross(values, fieldErrors) {
  const errors = { ...validateSipCross(values, fieldErrors) }
  // The growth return only matters when there is a Grow stage
  if (
    fieldsValid(fieldErrors, 'growYears', 'growReturn') &&
    numeric(values.growYears) > 0 &&
    isBlank(values.growReturn)
  ) {
    errors.growReturn = 'Expected return during growth is required'
  }
  return errors
}

export const goalBasedSipSchema = {
  targetAmount: amount('Target goal amount', { required: true }),
  lumpSum: amount('Initial lump sum investment'),
  years: wholeYears('Investment period', 100, { required: true }),
  annualReturn: percent('Expected annual return', { required: true, allowZero: true }),
}

export const stepUpSipSchema = {
  initialMonthlyAmount: amount('Initial monthly SIP amount', { required: true, allowZero: true }),
  lumpSum: amount('Lump sum investment'),
  years: wholeYears('Investment period', 100, { required: true }),
  annualStepUp: percent('Annual step-up percentage', { required: true, allowZero: true }),
  annualReturn: percent('Expected annual return', { required: true, allowZero: true }),
}

export function validateStepUpSipCross(values, fieldErrors) {
  if (
    fieldsValid(fieldErrors, 'initialMonthlyAmount', 'lumpSum') &&
    numeric(values.initialMonthlyAmount) === 0 &&
    numeric(values.lumpSum) === 0
  ) {
    return { initialMonthlyAmount: 'Enter a monthly SIP amount or a lump sum investment' }
  }
  return {}
}

export const swpSchema = {
  lumpSum: amount('Lump sum investment'),
  monthlySip: amount('Monthly SIP', { required: true, allowZero: true }),
  years: wholeYears('Investment duration', 100, { required: true }),
  accumulationReturn: percent('Expected return during investment', { required: true, allowZero: true }),
  monthlyWithdrawal: amount('Monthly withdrawal', { required: true }),
  annualStepUp: percent('Annual step-up on withdrawal', { required: true, allowZero: true }),
  swpReturn: percent('SWP return rate', { required: true, allowZero: true }),
}

export function validateSwpCross(values, fieldErrors) {
  if (
    fieldsValid(fieldErrors, 'monthlySip', 'lumpSum') &&
    numeric(values.monthlySip) === 0 &&
    numeric(values.lumpSum) === 0
  ) {
    return { monthlySip: 'Enter a monthly SIP or a lump sum investment to build the corpus' }
  }
  return {}
}

// ---------------------------------------------------------------------------
// Plan for Goals / Retirement
// ---------------------------------------------------------------------------

export const goalPlanningSchema = {
  presentValue: amount('Present value of goal', { required: true }),
  years: wholeYears('Years from now', 100, { required: true }),
  inflation: percent('Inflation rate', { required: true, allowZero: true }),
  annualReturn: percent('Assumed annual return', { required: true, allowZero: true }),
  annualStepUp: percent('Annual step-up percentage', { required: true, allowZero: true }),
  lumpSumToday: amount('Lump sum today'),
}

export const childEducationGlobalSchema = {
  annualReturn: percent('Assumed annual return', { required: true, allowZero: true }),
  annualStepUp: percent('Annual SIP step-up', { required: true, allowZero: true }),
  lumpSumToday: amount('Lump sum today'),
}

const childGoalSchema = (prefix) => ({
  Age: age(`${prefix} age`, 1, 60),
  PresentCost: amount(`${prefix} present cost`, { required: true }),
  InflationPercent: percent(`${prefix} inflation`, { required: true, allowZero: true }),
})

/**
 * Child Education form: { annualReturn, annualStepUp, lumpSumToday, children: [...] }
 * Each child's post-graduation plan is optional: leave all three fields blank to skip it.
 * Errors use keys like `child0_graduationAge`.
 */
export function validateChildEducationForm(form) {
  const errors = validateFields(form, childEducationGlobalSchema)

  form.children.forEach((child, index) => {
    const key = (field) => `child${index}_${field}`
    const currentAgeError = validateNumberField(child.currentAge, age("Child's current age", 0, 40))
    if (currentAgeError) errors[key('currentAge')] = currentAgeError

    const plans = [
      { field: 'graduation', label: 'Graduation', required: true },
      { field: 'postGraduation', label: 'Post graduation', required: false },
    ]

    for (const plan of plans) {
      const fieldNames = ['Age', 'PresentCost', 'InflationPercent']
      const values = fieldNames.map((name) => child[`${plan.field}${name}`])
      if (!plan.required && values.every(isBlank)) continue

      const schema = childGoalSchema(plan.label)
      fieldNames.forEach((name, i) => {
        const error = validateNumberField(values[i], schema[name])
        if (error) errors[key(`${plan.field}${name}`)] = error
      })

      const ageKey = key(`${plan.field}Age`)
      if (!errors[ageKey] && !errors[key('currentAge')]) {
        if (Number(child[`${plan.field}Age`]) <= Number(child.currentAge)) {
          errors[ageKey] = `${plan.label} age must be greater than the child's current age`
        }
      }
    }
  })

  return errors
}

/** Build the calculation input for a validated Child Education form */
export function toChildEducationInput(form) {
  const global = toNumericValues(form, childEducationGlobalSchema)
  const plan = (child, field) => {
    const values = ['Age', 'PresentCost', 'InflationPercent'].map((name) => child[`${field}${name}`])
    if (values.every(isBlank)) return null
    return {
      targetAge: Number(values[0]),
      presentCost: Number(values[1]),
      inflationPercent: Number(values[2]),
    }
  }

  return {
    annualReturnPercent: global.annualReturn,
    annualStepUpPercent: global.annualStepUp,
    lumpSumToday: global.lumpSumToday,
    children: form.children.map((child, index) => ({
      name: child.name.trim() || `Child ${index + 1}`,
      currentAge: Number(child.currentAge),
      graduation: plan(child, 'graduation'),
      postGraduation: plan(child, 'postGraduation'),
    })),
  }
}

export const retirementSchema = {
  currentAnnualExpenses: amount('Current annual expenses', { required: true }),
  preRetirementInflation: percent('Pre-retirement inflation rate', { required: true, allowZero: true }),
  currentAge: age('Current age', 1, 100),
  retirementAge: age('Retirement age', 1, 110),
  lifeExpectancy: age('Life expectancy', 1, 120),
  preRetirementReturn: percent('Pre-retirement return rate', { required: true, allowZero: true }),
  stepUpSipPercent: percent('Step-up SIP increase rate', { required: true, allowZero: true }),
  lumpSumSaved: amount('Lump sum already saved'),
  postRetirementReturn: percent('Post-retirement return rate', { required: true, allowZero: true }),
  postRetirementInflation: percent('Post-retirement inflation rate', { required: true, allowZero: true }),
}

export function validateRetirementCross(values, fieldErrors) {
  const errors = {}
  if (
    fieldsValid(fieldErrors, 'currentAge', 'retirementAge') &&
    Number(values.retirementAge) <= Number(values.currentAge)
  ) {
    errors.retirementAge = 'Retirement age must be greater than current age'
  }
  if (
    fieldsValid(fieldErrors, 'retirementAge', 'lifeExpectancy') &&
    !errors.retirementAge &&
    Number(values.lifeExpectancy) <= Number(values.retirementAge)
  ) {
    errors.lifeExpectancy = 'Life expectancy must be greater than retirement age'
  }
  return errors
}

// ---------------------------------------------------------------------------
// Insurance
// ---------------------------------------------------------------------------

export const humanLifeValueSchema = {
  currentAge: age('Current age', 18, 100),
  retirementAge: age('Retirement age', 18, 100),
  annualIncome: amount('Current annual income', { required: true }),
  salaryHike: percent('Expected annual salary hike', { required: true, allowZero: true }),
  discountRate: percent('Discount rate', { required: true, allowZero: true }),
}

export function validateHumanLifeValueCross(values, fieldErrors) {
  if (
    fieldsValid(fieldErrors, 'currentAge', 'retirementAge') &&
    Number(values.retirementAge) <= Number(values.currentAge)
  ) {
    return { retirementAge: 'Retirement age must be greater than current age' }
  }
  return {}
}

export const needBasedSchema = {
  spouseAge: age('Spouse age', 0, 89),
  annualFamilyExpenses: amount('Current annual family expenses', { required: true }),
  inflation: percent('Expected inflation rate', { required: true, allowZero: true }),
  returnRate: percent('Return on corpus', { required: true, allowZero: true }),
  outstandingLoans: amount('Outstanding loans'),
}

const needGoalSchema = {
  presentCost: amount('Goal amount needed today', { required: true }),
  years: wholeYears('Years from now', 100, { required: true }),
  inflationPercent: percent('Goal inflation'),
}

/** Goal rows left completely blank are ignored. Errors use keys like `goal0_years`. */
export function validateNeedBasedForm(form) {
  const errors = validateFields(form, needBasedSchema)
  form.goals.forEach((goal, index) => {
    const touched = ['description', 'presentCost', 'years', 'inflationPercent'].some(
      (field) => !isBlank(goal[field])
    )
    if (!touched) return
    for (const [field, rule] of Object.entries(needGoalSchema)) {
      const error = validateNumberField(goal[field], rule)
      if (error) errors[`goal${index}_${field}`] = error
    }
  })
  return errors
}

export function toNeedBasedInput(form) {
  const values = toNumericValues(form, needBasedSchema)
  const goals = form.goals
    .filter((goal) => !isBlank(goal.presentCost) || !isBlank(goal.years))
    .map((goal, index) => ({
      description: goal.description.trim() || `Goal ${index + 1}`,
      presentCost: Number(goal.presentCost),
      years: Number(goal.years),
      inflationPercent: isBlank(goal.inflationPercent) ? null : Number(goal.inflationPercent),
    }))

  return {
    spouseAge: values.spouseAge,
    annualFamilyExpenses: values.annualFamilyExpenses,
    inflationPercent: values.inflation,
    returnPercent: values.returnRate,
    outstandingLoans: values.outstandingLoans,
    goals,
  }
}

// ---------------------------------------------------------------------------
// Loan & Buy vs Rent
// ---------------------------------------------------------------------------

export const loanEmiSchema = {
  loanAmount: amount('Loan amount', { required: true }),
  interestRate: percent('Annual interest rate', { required: true, allowZero: true, max: 50 }),
  tenureYears: { label: 'Tenure (years)', integer: true, max: 40, unit: ' years' },
  tenureMonths: { label: 'Tenure (months)', integer: true, max: 11, unit: ' months' },
}

export function validateLoanEmiCross(values, fieldErrors) {
  if (
    fieldsValid(fieldErrors, 'tenureYears', 'tenureMonths') &&
    numeric(values.tenureYears) * 12 + numeric(values.tenureMonths) < 1
  ) {
    return { tenureYears: 'Enter a loan tenure of at least 1 month' }
  }
  return {}
}

export const cashVsLoanSchema = {
  assetValue: amount('Asset purchase value', { required: true }),
  downPayment: amount('Down payment'),
  loanRate: percent('Loan interest rate', { required: true, allowZero: true, max: 50 }),
  tenureYears: wholeYears('Loan tenure', 40, { required: true }),
  investmentReturn: percent('Expected investment return', { required: true, allowZero: true }),
  taxOnGains: percent('Tax on investment gains'),
  inflation: percent('Expected inflation rate'),
}

export function validateCashVsLoanCross(values, fieldErrors) {
  if (
    fieldsValid(fieldErrors, 'assetValue', 'downPayment') &&
    numeric(values.downPayment) >= numeric(values.assetValue)
  ) {
    return {
      downPayment: 'Down payment must be less than the asset value, otherwise there is no loan to compare',
    }
  }
  return {}
}

export const rentVsBuySchema = {
  comparisonYears: wholeYears('Comparison period', 50, { required: true }),
  propertyAppreciation: percent('Annual property appreciation', { required: true, allowZero: true }),
  monthlyRent: amount('Initial monthly rent', { required: true }),
  rentIncrease: percent('Annual rent increase', { required: true, allowZero: true }),
  propertyPrice: amount('Property price', { required: true }),
  upfrontCosts: amount('Upfront buying costs'),
  renovationCosts: amount('Initial renovation / furnishing'),
  annualPropertyTax: amount('Annual property tax'),
  propertyTaxIncrease: percent('Annual property tax increase'),
  annualMaintenance: amount('Annual maintenance'),
  maintenanceIncrease: percent('Annual maintenance increase'),
  sellingBrokerage: percent('Selling brokerage'),
  investmentReturn: percent('Assumed annual investment return', { required: true, allowZero: true }),
  downPayment: amount('Down payment', { required: true, allowZero: true }),
  loanRate: percent('Loan interest rate', { required: true, allowZero: true, max: 50 }),
  loanTenure: wholeYears('Loan tenure', 40),
  processingFees: amount('Loan processing fees'),
  otherLoanFees: amount('Other loan-related fees'),
}

export function validateRentVsBuyCross(values, fieldErrors) {
  const errors = {}
  const hasLoan =
    fieldsValid(fieldErrors, 'propertyPrice', 'downPayment') &&
    numeric(values.downPayment) < numeric(values.propertyPrice)

  if (
    fieldsValid(fieldErrors, 'propertyPrice', 'downPayment') &&
    numeric(values.downPayment) > numeric(values.propertyPrice)
  ) {
    errors.downPayment = 'Down payment cannot be more than the property price'
  }
  if (hasLoan && !fieldErrors.loanTenure && isBlank(values.loanTenure)) {
    errors.loanTenure = 'Loan tenure is required when a loan is taken'
  }
  return errors
}
