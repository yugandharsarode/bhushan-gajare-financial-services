import { suite } from './harness.mjs'
import { riskProfileQuestions } from '../../src/data/riskProfile.js'
import {
  calculateRiskProfile,
  getRiskProfileForScore,
  findUnansweredQuestions,
} from '../../src/utils/riskProfileCalculations.js'

const t = suite('Risk Profile Assessment')

// Option scores of the reference questionnaire, question by question, in option order A, B, C...
const REFERENCE_SCORES = [
  [1, 3, 5], [5, 4, 3, 2, 1], [5, 3, 1], [1, 2, 3, 4, 5], [5, 3, 1], [5, 3, 1],
  [1, 2, 3, 5], [1, 2, 3, 4, 5], [1, 2, 4, 5], [1, 2, 3, 5], [5, 4, 3, 2, 1],
]
t.equal('11 questions', riskProfileQuestions.length, 11)
riskProfileQuestions.forEach((question, i) => {
  t.equal(`Q${i + 1} option scores match the reference`, question.options.map((option) => option.score), REFERENCE_SCORES[i])
})

/** "1C 2B 3A ..." → { questionId: optionIndex } */
const answersFrom = (code) =>
  Object.fromEntries(
    code.split(' ').map((token) => {
      const questionIndex = Number(token.slice(0, -1)) - 1
      return [riskProfileQuestions[questionIndex].id, token.at(-1).charCodeAt(0) - 65]
    })
  )

const REFERENCE = [
  ['TC1', '1C 2B 3A 4D 5A 6B 7D 8D 9C 10D 11A', 49, 'Moderately Aggressive', [20, 70, 10]],
  ['TC2', '1A 2E 3B 4A 5B 6C 7A 8B 9A 10B 11C', 19, 'Conservative', [80, 10, 10]],
  ['TC3', '1B 2C 3B 4C 5B 6B 7B 8C 9B 10C 11B', 32, 'Balanced', [40, 50, 10]],
  ['TC4', '1B 2D 3A 4B 5A 6C 7B 8B 9B 10A 11C', 28, 'Moderately Conservative', [60, 30, 10]],
  ['TC5', '1C 2A 3A 4E 5A 6A 7D 8D 9D 10D 11B', 53, 'Aggressive', [10, 80, 10]],
  ['All minimum', '1A 2E 3C 4A 5C 6C 7A 8A 9A 10A 11E', 11, 'Conservative', [80, 10, 10]],
  ['All maximum', '1C 2A 3A 4E 5A 6A 7D 8E 9D 10D 11A', 55, 'Aggressive', [10, 80, 10]],
  ['Boundary 20 (set A)', '1C 2A 3C 4B 5C 6C 7A 8A 9A 10A 11E', 20, 'Conservative'],
  ['Boundary 20 (set B)', '1A 2E 3C 4A 5C 6C 7A 8A 9B 10D 11A', 20, 'Conservative'],
  ['Boundary 21 (set A)', '1C 2A 3B 4A 5C 6C 7A 8A 9A 10A 11E', 21, 'Moderately Conservative'],
  ['Boundary 21 (set B)', '1A 2E 3C 4A 5C 6C 7A 8B 9B 10D 11A', 21, 'Moderately Conservative'],
  ['Boundary 30 (set A)', '1C 2A 3A 4E 5B 6C 7B 8A 9A 10A 11E', 30, 'Moderately Conservative'],
  ['Boundary 30 (set B)', '1A 2E 3C 4B 5C 6C 7C 8E 9D 10D 11A', 30, 'Moderately Conservative'],
  ['Boundary 31 (set A)', '1C 2A 3A 4E 5A 6C 7A 8A 9A 10A 11E', 31, 'Balanced'],
  ['Boundary 31 (set B)', '1A 2E 3C 4A 5C 6C 7D 8E 9D 10D 11A', 31, 'Balanced'],
  ['Boundary 40 (set A)', '1C 2A 3A 4E 5A 6A 7D 8B 9A 10A 11E', 40, 'Balanced'],
  ['Boundary 40 (set B)', '1A 2E 3C 4B 5A 6A 7D 8E 9D 10D 11A', 40, 'Balanced'],
  ['Boundary 41 (set A)', '1C 2A 3A 4E 5A 6A 7D 8C 9A 10A 11E', 41, 'Moderately Aggressive'],
  ['Boundary 41 (set B)', '1A 2E 3C 4C 5A 6A 7D 8E 9D 10D 11A', 41, 'Moderately Aggressive'],
  ['Boundary 50 (set A)', '1C 2A 3A 4E 5A 6A 7D 8E 9D 10C 11D', 50, 'Moderately Aggressive'],
  ['Boundary 50 (set B)', '1A 2B 3A 4E 5A 6A 7D 8E 9D 10D 11A', 50, 'Moderately Aggressive'],
  ['Boundary 51 (set A)', '1C 2A 3A 4E 5A 6A 7D 8E 9D 10D 11E', 51, 'Aggressive'],
  ['Boundary 51 (set B)', '1A 2A 3A 4E 5A 6A 7D 8E 9D 10D 11A', 51, 'Aggressive'],
  ['FRESH1', '1C 2C 3C 4E 5B 6A 7C 8E 9C 10C 11D', 39, 'Balanced', [40, 50, 10]],
  ['FRESH2', '1C 2A 3A 4D 5C 6B 7D 8D 9D 10A 11B', 42, 'Moderately Aggressive', [20, 70, 10]],
]

for (const [name, code, score, profileName, allocation] of REFERENCE) {
  const r = calculateRiskProfile(answersFrom(code))
  t.ok(`${name} complete`, r.complete)
  t.equal(`${name} total score`, r.totalScore, score)
  t.equal(`${name} profile`, r.profile.name, profileName)
  if (allocation) {
    t.equal(`${name} allocation`, [r.profile.allocation.debt, r.profile.allocation.equity, r.profile.allocation.gold], allocation)
  }
  t.equal(`${name} echoes 11 answers`, r.responses.length, 11)
}

// Every total from 11 to 55 maps to the right band
const bandFor = (score) => (score <= 20 ? 'Conservative' : score <= 30 ? 'Moderately Conservative' : score <= 40 ? 'Balanced' : score <= 50 ? 'Moderately Aggressive' : 'Aggressive')
for (let score = 11; score <= 55; score++) {
  t.equal(`score ${score} band`, getRiskProfileForScore(score).name, bandFor(score))
}

// Every total from 11 to 55 is reachable
let reachable = new Set([0])
for (const question of riskProfileQuestions) {
  const next = new Set()
  for (const total of reachable) for (const option of question.options) next.add(total + option.score)
  reachable = next
}
t.equal('all totals 11-55 reachable', [...reachable].sort((a, b) => a - b), Array.from({ length: 45 }, (_, i) => i + 11))
t.equal('score range reported', calculateRiskProfile(answersFrom(REFERENCE[0][1])).scoreRange, { min: 11, max: 55 })

// Every allocation adds up to 100%
for (let score = 11; score <= 55; score += 10) {
  const { debt, equity, gold } = getRiskProfileForScore(score).allocation
  t.equal(`allocation for score ${score} totals 100%`, debt + equity + gold, 100)
}

// Unanswered questions: each one missing in turn, and nothing answered
const full = answersFrom(REFERENCE[0][1])
riskProfileQuestions.forEach((question, i) => {
  const partial = { ...full }
  delete partial[question.id]
  const r = calculateRiskProfile(partial)
  t.ok(`Q${i + 1} missing: not complete`, !r.complete && r.unanswered.length === 1 && r.unanswered[0].id === question.id)
})
t.equal('nothing answered: all 11 missing', findUnansweredQuestions({}).length, 11)
t.equal('out-of-range option index treated as unanswered', findUnansweredQuestions({ ...full, horizon: 7 }).map((q) => q.id), ['horizon'])
