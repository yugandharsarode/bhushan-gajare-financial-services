/**
 * Two-column responsive layout shared by all calculator pages.
 */
function CalculatorPageShell({ formPanel, resultsPanel }) {
  return (
    <div className="grid gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5 xl:col-span-4">{formPanel}</div>
      <div className="lg:col-span-7 xl:col-span-8">{resultsPanel}</div>
    </div>
  )
}

export default CalculatorPageShell
