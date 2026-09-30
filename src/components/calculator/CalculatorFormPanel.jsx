import { useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Full-width input panel for a calculator: header, grouped inputs and an
 * action bar with Reset and Calculate.
 *
 * After a submit that leaves errors, the first invalid field is brought into
 * view and focused.
 */
function CalculatorFormPanel({
  title = 'Investment Details',
  description,
  onSubmit,
  onReset,
  submitLabel = 'Calculate Returns',
  headerAside,
  footnote = 'Drag a slider or type an exact value. Results are illustrative and assume constant returns.',
  children,
}) {
  const formRef = useRef(null)

  const handleSubmit = (e) => {
    onSubmit(e)
    // Wait for React to render any error messages, then show the first one
    requestAnimationFrame(() => {
      const invalid = formRef.current?.querySelector('[aria-invalid="true"]')
      if (!invalid) return
      invalid.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
      invalid.focus({ preventScroll: true })
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="hero-animate-in hydro-card overflow-hidden rounded-2xl"
      style={{ animationDelay: '0.05s', opacity: 0 }}
      noValidate
    >
      <div className="flex flex-col gap-4 border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-white px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-9 w-1 shrink-0 rounded-full bg-[#d4af37]" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-brand-800">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
          </div>
        </div>
        {headerAside && <div className="shrink-0">{headerAside}</div>}
      </div>

      <div className="flex flex-col gap-8 px-5 py-6 sm:px-8 sm:py-7">{children}</div>

      <div className="flex flex-col gap-4 border-t border-brand-100 bg-brand-50/60 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="text-xs leading-relaxed text-slate-500">{footnote}</p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={onReset} className="hydro-btn-secondary !px-6 !py-3">
            Reset
          </button>
          <button type="submit" className="hydro-btn min-w-0 flex-1 !px-8 !py-3 md:flex-none">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

export default CalculatorFormPanel
