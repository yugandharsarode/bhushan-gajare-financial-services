/**
 * Standard content area below PageHeader.
 * Uses modest top padding so the gap under the hero stays tight.
 */
function PageSection({ children, className = '' }) {
  return (
    <section
      className={`pt-5 pb-8 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12 ${className}`}
    >
      {children}
    </section>
  )
}

export default PageSection
