import {
  HiOutlineArrowTrendingUp,
  HiOutlineChartPie,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineSun,
} from 'react-icons/hi2'

/**
 * Services shown on the Services page.
 * Each item includes icon, description, benefits, and highlight bullets.
 */
export const servicesList = [
  {
    id: 'mutual-funds',
    title: 'Mutual Fund Distribution & Wealth Creation',
    description:
      'Navigate the mutual fund landscape with a portfolio matched to your risk profile — from aggressive equity growth to stable debt instruments.',
    icon: HiOutlineChartPie,
    benefits: 'Disciplined investing and strategic allocation so your money works as hard as you do.',
    highlights: [
      'SIP for long-term compounding through disciplined investing',
      'Lumpsum allocation of surplus funds for optimal returns',
      'Equity, debt, and hybrid options aligned to your goals',
    ],
  },
  {
    id: 'insurance',
    title: 'Comprehensive Insurance Solutions',
    description:
      'Protection is the foundation of every financial plan. Handpicked products safeguard your health and your family\'s future.',
    icon: HiOutlineShieldCheck,
    benefits: 'Medical bills and life\'s uncertainties should never erode the wealth you build.',
    highlights: [
      'Health plans for hospitalization, critical illness, and maternity',
      'Term insurance for high-cover life protection',
      'Accidental insurance for disability and income loss',
    ],
  },
  {
    id: 'child-education',
    title: 'Child Education Planning',
    description:
      'Rising education costs — in India and abroad — make early planning essential for every parent.',
    icon: HiOutlineAcademicCap,
    benefits: 'Goal-based savings ensure funds are ready when your child needs them most.',
    highlights: [
      'Future education costs calculated with inflation in mind',
      'Child-specific mutual funds and long-term equity mix',
      'Structured plans for school, college, and higher studies',
    ],
  },
  {
    id: 'retirement',
    title: 'Retirement Planning',
    description:
      'Retirement should be relaxation, not financial stress. Build a corpus that sustains your lifestyle without a monthly salary.',
    icon: HiOutlineSun,
    benefits: 'A "pension box" strategy for steady, inflation-protected post-retirement income.',
    highlights: [
      'Wealth accumulation during working years via tax-efficient vehicles',
      'Post-retirement income structuring for regular cash flow',
      'NPS and annuity guidance for long-term security',
    ],
  },
  {
    id: 'stockbroking',
    title: 'Stockbroking & Equity Advisory',
    description:
      'Direct market exposure with professional tools and insights to trade effectively and invest in quality businesses.',
    icon: HiOutlineArrowTrendingUp,
    benefits: 'Long-term wealth through informed equity decisions and active portfolio support.',
    highlights: [
      'Access to BSE and NSE through reputed broking partners',
      'Research-backed equity advisory for informed decisions',
      'Portfolio guidance for direct market participation',
    ],
  },
]

export const mutualFundDisclaimer =
  'Investments in Mutual Funds are subject to market risks. Read all scheme related documents carefully before investing. Mutual Fund schemes do not assure or guarantee any returns. Past performance may or may not be sustained in future. There is no guarantee that the investment objective of any suggested scheme shall be achieved. Check exit loads and TER before investing. We deal in Regular Plans only and earn trailing commission disclosed at the time of investment. Direct Plans are available with lower expense ratios; we do not deal in Direct Plans.'

export const advisorCredentials =
  'Bhushan S. Gajare — ARN-125256 | ARN validity: 30-Sep-2026'
