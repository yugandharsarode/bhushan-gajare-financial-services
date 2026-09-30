/**
 * Heading that separates groups of inputs inside a calculator form.
 */
function FieldGroupHeading({ children, note }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="h-4 w-1 shrink-0 rounded-full bg-[#d4af37]" aria-hidden="true" />
      <p className="text-sm font-semibold text-brand-800">
        {children}
        {note && <span className="ml-1.5 font-normal text-slate-400">{note}</span>}
      </p>
      <span className="h-px flex-1 bg-brand-100" aria-hidden="true" />
    </div>
  )
}

export default FieldGroupHeading
