/**
 * Reusable form panel wrapper for calculator inputs.
 */
function CalculatorFormPanel({
  title = 'Investment Details',
  description,
  onSubmit,
  onReset,
  submitLabel = 'Calculate Returns',
  children,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="hero-animate-in hydro-card rounded-xl p-6 sm:p-8"
      style={{ animationDelay: '0.05s', opacity: 0 }}
      noValidate
    >
      <h2 className="text-lg font-medium text-brand-800">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-[#334155]">{description}</p>
      )}

      <div className="mt-6 flex flex-col gap-5">{children}</div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="hydro-btn flex-1">
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="hydro-btn-secondary flex-1"
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default CalculatorFormPanel
