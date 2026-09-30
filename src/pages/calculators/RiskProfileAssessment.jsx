import { useState } from 'react'
import CalculatorLayout from '../../components/calculator/CalculatorLayout'
import CalculatorPageShell from '../../components/calculator/CalculatorPageShell'
import CalculatorFormPanel from '../../components/calculator/CalculatorFormPanel'
import CalculatorEmptyState from '../../components/calculator/CalculatorEmptyState'
import WealthPieChart from '../../components/calculator/WealthPieChart'
import DownloadReportButton from '../../components/calculator/DownloadReportButton'
import { calculatorRegistry } from '../../config/calculatorRegistry'
import { riskProfileQuestions, riskProfiles } from '../../data/riskProfile'
import { calculateRiskProfile } from '../../utils/riskProfileCalculations'

const meta = calculatorRegistry['risk-profile']

const ALLOCATION_LABELS = [
  { key: 'debt', label: 'Debt' },
  { key: 'equity', label: 'Equity' },
  { key: 'gold', label: 'Gold / Alternatives' },
]

function ScoreMeter({ totalScore, scoreRange, profileId }) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-1">
        {riskProfiles.map((profile, index) => {
          const from = index === 0 ? scoreRange.min : riskProfiles[index - 1].maxScore + 1
          const active = profile.id === profileId
          return (
            <div key={profile.id} className="min-w-0">
              <div className={`h-2.5 rounded-full ${active ? 'bg-brand-600' : 'bg-brand-100'}`} />
              <p className={`mt-1.5 truncate text-[11px] ${active ? 'font-semibold text-brand-800' : 'text-slate-500'}`}>
                {from}–{Math.min(profile.maxScore, scoreRange.max)}
              </p>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Score {totalScore} on a scale of {scoreRange.min} to {scoreRange.max}
      </p>
    </div>
  )
}

function AnswerProgress({ answered, total }) {
  const percent = (answered / total) * 100
  return (
    <div className="w-full min-w-[12rem] md:w-56" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs font-medium text-slate-600">
        <span>Progress</span>
        <span className="tabular-nums text-brand-800">
          {answered} of {total} answered
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-[#d4af37] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function RiskProfileAssessment() {
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [results, setResults] = useState(null)

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    setErrors((prev) => {
      if (!prev[questionId]) return prev
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const outcome = calculateRiskProfile(answers)
    if (!outcome.complete) {
      setErrors(
        Object.fromEntries(outcome.unanswered.map((question) => [question.id, 'Please choose an answer']))
      )
      setResults(null)
      return
    }
    setErrors({})
    setResults(outcome)
  }

  const handleReset = () => {
    setAnswers({})
    setErrors({})
    setResults(null)
  }

  const answeredCount = riskProfileQuestions.filter((question) =>
    Number.isInteger(answers[question.id])
  ).length
  const unansweredCount = Object.keys(errors).length

  return (
    <CalculatorLayout title={meta.name} description={meta.description} tagline={meta.tagline} icon={meta.icon}>
      <CalculatorPageShell
        resultsKey={results}
        formPanel={
          <CalculatorFormPanel
            title="Risk Questionnaire"
            description="Answer all 11 questions honestly for the most accurate profile."
            onSubmit={handleSubmit}
            onReset={handleReset}
            submitLabel="Get My Risk Profile"
            headerAside={<AnswerProgress answered={answeredCount} total={riskProfileQuestions.length} />}
            footnote={
              unansweredCount > 0 ? (
                <span className="font-medium text-red-600" role="alert">
                  Please answer all questions before submitting ({unansweredCount} remaining).
                </span>
              ) : (
                'Choose the answer that fits you best. There are no right or wrong answers.'
              )
            }
          >
            <div className="grid gap-5 lg:grid-cols-2">
              {riskProfileQuestions.map((question, questionIndex) => {
                const error = errors[question.id]
                const selectedIndex = answers[question.id]
                return (
                  <fieldset
                    key={question.id}
                    id={`question-${question.id}`}
                    className={`min-w-0 rounded-2xl border p-5 transition-colors ${
                      error
                        ? 'border-red-300 bg-red-50/40 ring-2 ring-red-100'
                        : Number.isInteger(selectedIndex)
                          ? 'border-brand-200 bg-brand-50/40'
                          : 'border-slate-200 bg-white'
                    }`}
                    aria-describedby={error ? `question-${question.id}-error` : undefined}
                  >
                    <legend className="sr-only">{question.text}</legend>
                    <div className="flex items-start gap-3" aria-hidden="true">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                        {questionIndex + 1}
                      </span>
                      <p className="pt-0.5 text-sm font-medium leading-relaxed text-brand-800">{question.text}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 sm:pl-10">
                      {question.options.map((option, optionIndex) => {
                        const selected = selectedIndex === optionIndex
                        return (
                          <label
                            key={option.label}
                            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-300 ${
                              selected
                                ? 'border-brand-600 bg-brand-600 font-medium text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={optionIndex}
                              checked={selected}
                              onChange={() => selectAnswer(question.id, optionIndex)}
                              className="sr-only"
                              aria-invalid={Boolean(error)}
                            />
                            {option.label}
                          </label>
                        )
                      })}
                    </div>
                    {error && (
                      <p id={`question-${question.id}-error`} className="mt-3 text-xs font-medium text-red-600 sm:pl-10" role="alert">
                        {error}
                      </p>
                    )}
                  </fieldset>
                )
              })}
            </div>
          </CalculatorFormPanel>
        }
        resultsPanel={
          results ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Your Risk Profile</h2>
                <DownloadReportButton />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="hero-animate-in hydro-card flex flex-col rounded-2xl p-6 sm:p-8" style={{ animationDelay: '0.1s', opacity: 0 }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Risk Profile</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{results.profile.name}</p>
                  <p className="mt-1 text-sm text-slate-600">Total score: {results.totalScore}</p>
                  <div className="mt-6">
                    <ScoreMeter totalScore={results.totalScore} scoreRange={results.scoreRange} profileId={results.profile.id} />
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-slate-700">{results.profile.description}</p>
                </div>

                <WealthPieChart
                  title="Suggested Asset Allocation"
                  subtitle="A starting point to discuss with your advisor"
                  slices={ALLOCATION_LABELS.map(({ key, label }) => ({ name: label, value: results.profile.allocation[key] }))}
                  valueFormatter={(value) => `${value}%`}
                  showShare={false}
                />
              </div>

              <div className="hero-animate-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <h3 className="text-base font-semibold text-slate-900">Your Answers</h3>
                <ol className="mt-3 grid gap-x-10 text-sm lg:grid-cols-2">
                  {results.responses.map((response, index) => (
                    <li key={response.questionId} className="grid gap-1 border-b border-slate-100 py-2.5 sm:grid-cols-[1fr_auto] sm:gap-4">
                      <span className="text-slate-600">{index + 1}. {response.question}</span>
                      <span className="font-medium text-brand-800 sm:text-right">{response.answer}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                * Your profile is based on the total of your answers. It is a starting point for
                discussion, not a recommendation to buy or sell any investment.
              </p>
            </div>
          ) : (
            <CalculatorEmptyState
              title="Your risk profile will appear here"
              description="Answer all 11 questions above and click Get My Risk Profile to see your profile and a suggested asset allocation."
            />
          )
        }
      />
    </CalculatorLayout>
  )
}

export default RiskProfileAssessment
