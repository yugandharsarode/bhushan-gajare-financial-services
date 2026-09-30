import { useEffect, useRef } from 'react'

/**
 * Calculator page body: the input panel across the full width, results below.
 * Whenever `resultsKey` changes to a new truthy value (a fresh calculation),
 * the results are scrolled into view.
 */
function CalculatorPageShell({ formPanel, resultsPanel, resultsKey }) {
  const resultsRef = useRef(null)

  useEffect(() => {
    if (!resultsKey || !resultsRef.current) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    resultsRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [resultsKey])

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <div className="min-w-0">{formPanel}</div>
      <div ref={resultsRef} className="min-w-0 scroll-mt-28">
        {resultsPanel}
      </div>
    </div>
  )
}

export default CalculatorPageShell
