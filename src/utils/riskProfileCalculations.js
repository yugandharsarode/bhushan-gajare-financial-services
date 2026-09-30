/**
 * Risk profile scoring: plain sum of the chosen option scores (11 to 55),
 * mapped to a profile by score band (<=20, <=30, <=40, <=50, above 50).
 */

import { riskProfileQuestions, riskProfiles } from '../data/riskProfile.js'

/** answers: { [questionId]: optionIndex } */
export function findUnansweredQuestions(answers, questions = riskProfileQuestions) {
  return questions.filter((question) => {
    const index = answers[question.id]
    return !Number.isInteger(index) || !question.options[index]
  })
}

export function getRiskProfileForScore(totalScore) {
  return riskProfiles.find((profile) => totalScore <= profile.maxScore) ?? riskProfiles.at(-1)
}

export function calculateRiskProfile(answers, questions = riskProfileQuestions) {
  const unanswered = findUnansweredQuestions(answers, questions)
  if (unanswered.length > 0) {
    return { complete: false, unanswered }
  }

  const responses = questions.map((question) => {
    const option = question.options[answers[question.id]]
    return { questionId: question.id, question: question.text, answer: option.label, score: option.score }
  })
  const totalScore = responses.reduce((sum, response) => sum + response.score, 0)
  const scoreRange = questions.reduce(
    (range, question) => {
      const scores = question.options.map((option) => option.score)
      return { min: range.min + Math.min(...scores), max: range.max + Math.max(...scores) }
    },
    { min: 0, max: 0 }
  )

  return {
    complete: true,
    totalScore,
    scoreRange,
    profile: getRiskProfileForScore(totalScore),
    responses,
  }
}
