/**
 * Risk profile questionnaire. Every option scores 1 (least risk-tolerant) to
 * 5 (most risk-tolerant); some questions skip values on purpose.
 */
export const riskProfileQuestions = [
  {
    id: 'horizon',
    text: 'What is your preferred investment time horizon?',
    options: [
      { label: 'Up to 5 years', score: 1 },
      { label: '5 to 10 years', score: 3 },
      { label: 'More than 10 years', score: 5 },
    ],
  },
  {
    id: 'shortfall',
    text: 'How would you view ending up 20% short of your target corpus?',
    options: [
      { label: 'Acceptable', score: 5 },
      { label: 'Somewhat acceptable', score: 4 },
      { label: 'Not sure', score: 3 },
      { label: 'Somewhat unacceptable', score: 2 },
      { label: 'Not acceptable', score: 1 },
    ],
  },
  {
    id: 'shortTermGoals',
    text: 'Can your current savings and investments meet your short-term goals?',
    options: [
      { label: 'Yes, comfortably', score: 5 },
      { label: 'Not sure', score: 3 },
      { label: 'Not adequately', score: 1 },
    ],
  },
  {
    id: 'withdrawals',
    text: 'Will you need to withdraw more than 5% of your corpus each year to meet your living expenses?',
    options: [
      { label: 'Agree', score: 1 },
      { label: 'Somewhat agree', score: 2 },
      { label: 'Not sure', score: 3 },
      { label: 'Somewhat disagree', score: 4 },
      { label: 'Disagree', score: 5 },
    ],
  },
  {
    id: 'protection',
    text: 'Do you have life insurance, health insurance and an emergency fund covering 6 to 12 months of expenses?',
    options: [
      { label: 'Yes, all of them', score: 5 },
      { label: 'Some of them', score: 3 },
      { label: 'None of them', score: 1 },
    ],
  },
  {
    id: 'backupIncome',
    text: 'Do you have other income or assets that could meet your obligations if your main income stopped?',
    options: [
      { label: 'Yes', score: 5 },
      { label: 'To some extent', score: 3 },
      { label: 'Not adequately', score: 1 },
    ],
  },
  {
    id: 'volatility',
    text: 'How would you feel if your portfolio fell 15% because of market volatility?',
    options: [
      { label: 'Worried', score: 1 },
      { label: 'Somewhat concerned', score: 2 },
      { label: 'Neutral', score: 3 },
      { label: 'Optimistic about the long term', score: 5 },
    ],
  },
  {
    id: 'riskAppetite',
    text: 'How much risk are you willing to take to achieve your desired returns?',
    options: [
      { label: 'Safety first', score: 1 },
      { label: 'Mostly safe', score: 2 },
      { label: 'Balanced', score: 3 },
      { label: 'Moderately high', score: 4 },
      { label: 'High', score: 5 },
    ],
  },
  {
    id: 'experience',
    text: 'How long have you invested in stocks or mutual funds?',
    options: [
      { label: 'Less than 1 year', score: 1 },
      { label: '1 to 3 years', score: 2 },
      { label: '3 to 5 years', score: 4 },
      { label: 'More than 5 years', score: 5 },
    ],
  },
  {
    id: 'informationSource',
    text: 'Which source of investment information do you rely on most?',
    options: [
      { label: 'Friends and family', score: 1 },
      { label: 'News and media', score: 2 },
      { label: 'Social media influencers', score: 3 },
      { label: 'Financial advisors', score: 5 },
    ],
  },
  {
    id: 'marketView',
    text: 'Do you agree that the stock market is volatile in the short term but rewarding over the long term?',
    options: [
      { label: 'Strongly agree', score: 5 },
      { label: 'Agree', score: 4 },
      { label: 'Not sure', score: 3 },
      { label: 'Disagree', score: 2 },
      { label: 'Strongly disagree', score: 1 },
    ],
  },
]

/** Profiles by highest total score (inclusive) */
export const riskProfiles = [
  {
    id: 'conservative',
    name: 'Conservative',
    maxScore: 20,
    description:
      'You put protecting your capital ahead of growth and are uncomfortable with market swings. A portfolio built mainly on debt, such as fixed deposits, government securities and high-quality bonds, suits you.',
    allocation: { debt: 80, equity: 10, gold: 10 },
  },
  {
    id: 'moderately-conservative',
    name: 'Moderately Conservative',
    maxScore: 30,
    description:
      'You can accept a small amount of risk for somewhat better returns, but you still value stability. Debt should remain the core of your portfolio, with a modest share of equity.',
    allocation: { debt: 60, equity: 30, gold: 10 },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    maxScore: 40,
    description:
      'You want a balance between growth and stability and can handle moderate market ups and downs. A diversified mix of equity and debt suits you.',
    allocation: { debt: 40, equity: 50, gold: 10 },
  },
  {
    id: 'moderately-aggressive',
    name: 'Moderately Aggressive',
    maxScore: 50,
    description:
      'You are comfortable with sizeable market swings in pursuit of higher long-term growth. Equity can form the major part of your portfolio.',
    allocation: { debt: 20, equity: 70, gold: 10 },
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    maxScore: 55,
    description:
      'You accept high volatility in pursuit of the highest long-term returns and have a long investment horizon. Your portfolio can be weighted heavily towards equity.',
    allocation: { debt: 10, equity: 80, gold: 10 },
  },
]
