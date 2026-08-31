import { lazy } from 'react'
import {
  HiOutlineBanknotes,
  HiOutlineFlag,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowDownCircle,
  HiOutlineAcademicCap,
  HiOutlineSun,
} from 'react-icons/hi2'

/**
 * Central registry for calculator routes and metadata.
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
    tagline: 'Target SIP Calculator',
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
  swp: {
    id: 'swp',
    name: 'SWP Calculator',
    path: '/calculators/swp',
    categoryId: 'value-money-sips',
    icon: HiOutlineArrowDownCircle,
    tagline: 'Withdrawal Planning Calculator',
    description:
      'Build a retirement corpus with SIP, then plan systematic withdrawals with annual step-up.',
    available: true,
    component: lazy(() => import('../pages/calculators/SwpCalculator')),
  },
  'goal-planning': {
    id: 'goal-planning',
    name: 'Goal Planning Calculator',
    path: '/calculators/goal-planning',
    categoryId: 'plan-goals',
    icon: HiOutlineFlag,
    tagline: 'Inflation-Adjusted Goal Planner',
    description:
      'Plan for financial goals by accounting for inflation and calculating required SIP amounts.',
    available: true,
    component: lazy(() => import('../pages/calculators/GoalPlanningCalculator')),
  },
  'child-education': {
    id: 'child-education',
    name: 'Child Education Planner',
    path: '/calculators/child-education',
    categoryId: 'plan-goals',
    icon: HiOutlineAcademicCap,
    tagline: 'Education Goal Planner',
    description:
      'Plan for your child\'s graduation and post-graduation expenses with inflation-adjusted projections.',
    available: true,
    component: lazy(() => import('../pages/calculators/ChildEducationPlanner')),
  },
  retirement: {
    id: 'retirement',
    name: 'Retirement Planning Calculator',
    path: '/calculators/retirement',
    categoryId: 'plan-retirement',
    icon: HiOutlineSun,
    tagline: 'Retirement Corpus Planner',
    description:
      'Calculate the retirement corpus you need and the monthly SIP required to achieve it.',
    available: true,
    component: lazy(() => import('../pages/calculators/RetirementPlanningCalculator')),
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
