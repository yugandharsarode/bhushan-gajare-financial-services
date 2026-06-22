import { HiOutlineArrowDownTray } from 'react-icons/hi2'

/**
 * Download report button — UI placeholder for future PDF export.
 */
function DownloadReportButton({ className = '' }) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 shadow-sm transition-colors ${className}`}
    >
      <HiOutlineArrowDownTray className="h-4 w-4" aria-hidden="true" />
      Download Report
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Soon
      </span>
    </button>
  )
}

export default DownloadReportButton
