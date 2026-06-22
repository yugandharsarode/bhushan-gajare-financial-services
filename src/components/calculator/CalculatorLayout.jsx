import { Link } from 'react-router-dom'
import { HiOutlineArrowLeft, HiOutlineCalculator } from 'react-icons/hi2'
import Container from '../Container'
import PageSection from '../PageSection'

/**
 * Shared layout shell for all calculator pages.
 * Pass title, description, icon, and children (form + results).
 */
function CalculatorLayout({
  title,
  description,
  tagline = 'Financial Calculator',
  icon: Icon = HiOutlineCalculator,
  backLink = '/calculators',
  backLabel = 'All Calculators',
  children,
}) {
  return (
    <>
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-brand-800" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_55%)]" aria-hidden="true" />

        <Container className="relative py-5 sm:py-6 lg:py-8">
          <Link
            to={backLink}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors duration-500 hover:text-[#d4af37]"
          >
            <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="page-kicker !text-white/75">
                {tagline}
              </p>
              <h1 className="page-hero-title !text-white sm:!text-4xl lg:!text-5xl">
                {title}
              </h1>
              {description && (
                <p className="page-hero-description !mt-2 !max-w-2xl !text-white/90">
                  {description}
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <PageSection className="consultation-pattern bg-brand-50">
        <Container>{children}</Container>
      </PageSection>
    </>
  )
}

export default CalculatorLayout
