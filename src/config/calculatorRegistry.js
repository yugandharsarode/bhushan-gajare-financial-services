import { lazy } from 'react'
import {
  HiOutlineBanknotes,
  HiOutlineFlag,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'

/**
 * Central registry for calculator routes and metadata.
 * Add new calculators here to plug into routing and the Calculators page.
 */
export const calculatorRegistry = {
  sip: {
    id: 'sip',
    name: 'SIP Calculator',
    path: '/calculators/sip',
    categoryId: 'value-money-sips',
    icon: HiOutlineBanknotes,
    tagline: 'Investment Calculator',
    description:
      'Estimate how your monthly SIP and optional lump sum can grow over time with compound returns.',
    available: true,
    component: lazy(() => import('../pages/calculators/SipCalculator')),
  },
  'goal-based-sip': {
    id: 'goal-based-sip',
    name: 'Goal Based SIP Calculator',
    path: '/calculators/goal-based-sip',
    categoryId: 'value-money-sips',
    icon: HiOutlineFlag,
    tagline: 'Goal Planning Calculator',
    description:
      'Find the monthly SIP amount needed to reach your financial goal, accounting for an optional initial lump sum.',
    available: true,
    component: lazy(() => import('../pages/calculators/GoalBasedSipCalculator')),
  },
  'step-up-sip': {
    id: 'step-up-sip',
    name: 'Step-Up SIP Calculator',
    path: '/calculators/step-up-sip',
    categoryId: 'value-money-sips',
    icon: HiOutlineArrowTrendingUp,
    tagline: 'Step-Up Investment Calculator',
    description:
      'Project wealth growth when you increase your SIP annually, with optional lump sum investment.',
    available: true,
    component: lazy(() => import('../pages/calculators/StepUpSipCalculator')),
  },
}

export function getCalculatorBySlug(slug) {
  return calculatorRegistry[slug] ?? null
}

export function getAvailableCalculators() {
  return Object.values(calculatorRegistry).filter((c) => c.available)
}

export function getCalculatorPath(slug) {
  return calculatorRegistry[slug]?.path ?? null
}
