import {
  HiOutlineBanknotes,
  HiOutlineFlag,
  HiOutlineSun,
  HiOutlineShieldCheck,
  HiOutlineHomeModern,
  HiOutlineUserCircle,
} from 'react-icons/hi2'
import { calculatorRegistry } from '../config/calculatorRegistry'

/**
 * Resolve calculator list item: string (coming soon) or registry entry.
 */
function resolveCalculatorItem(item) {
  if (typeof item === 'string') {
    return { name: item, slug: null, available: false, path: null }
  }
  return item
}

/**
 * Calculator categories and items for the Calculators page.
 * Use slug keys from calculatorRegistry for live calculators.
 */
export const calculatorCategories = [
  {
    id: 'value-money-sips',
    title: 'Value of Money & SIPs',
    icon: HiOutlineBanknotes,
    calculators: ['sip', 'goal-based-sip', 'step-up-sip', 'swp'],
  },
  {
    id: 'plan-goals',
    title: 'Plan for Goals',
    icon: HiOutlineFlag,
    calculators: ['goal-planning', 'child-education'],
  },
  {
    id: 'plan-retirement',
    title: 'Plan for Retirement',
    icon: HiOutlineSun,
    calculators: ['retirement'],
  },
  {
    id: 'insurance-schemes',
    title: 'Insurance & Schemes',
    icon: HiOutlineShieldCheck,
    calculators: ['term-insurance'],
  },
  {
    id: 'loan-buy-rent',
    title: 'Loan & Buy vs Rent',
    icon: HiOutlineHomeModern,
    calculators: ['loan-emi', 'cash-vs-loan', 'rent-vs-buy'],
  },
  {
    id: 'understand-investor',
    title: 'Understand the Investor',
    icon: HiOutlineUserCircle,
    calculators: ['risk-profile'],
  },
]

/**
 * Normalize category calculators for display and navigation.
 */
export function getCategoryCalculators(category) {
  return category.calculators.map((item) => {
    if (typeof item === 'string') {
      // Registry slug key (e.g. 'sip')
      if (calculatorRegistry[item]) {
        const entry = calculatorRegistry[item]
        return {
          name: entry.name,
          slug: entry.id,
          available: entry.available,
          path: entry.path,
        }
      }

      const registryEntry = Object.values(calculatorRegistry).find(
        (c) => c.name === item
      )
      if (registryEntry) {
        return {
          name: registryEntry.name,
          slug: registryEntry.id,
          available: registryEntry.available,
          path: registryEntry.path,
        }
      }
      return resolveCalculatorItem(item)
    }

    const entry = calculatorRegistry[item]
    if (entry) {
      return {
        name: entry.name,
        slug: entry.id,
        available: entry.available,
        path: entry.path,
      }
    }
    return resolveCalculatorItem(item)
  })
}

export const calculatorsPageContent = {
  tagline: 'Smart Financial Planning Tools',
  heading: 'Financial Calculators for Better Decision Making',
  description:
    'Explore easy-to-use financial calculators designed to help you plan investments, insurance, retirement, loans, and future financial goals with confidence.',
}
