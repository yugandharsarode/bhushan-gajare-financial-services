import Container from '../components/Container'
import PageSection from '../components/PageSection'
import CalculatorCategoryCard from '../components/CalculatorCategoryCard'
import { useConsultation } from '../context/ConsultationContext'
import {
  calculatorCategories,
  calculatorsPageContent,
  getCategoryCalculators,
} from '../data/calculators'

function Calculators() {
  const { openModal } = useConsultation()
  const { tagline, heading, description } = calculatorsPageContent

  return (
    <>
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-brand-800" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_55%)]" aria-hidden="true" />

        <Container className="relative py-5 sm:py-6 lg:py-8">
          <p className="page-kicker !text-white/75">
            {tagline}
          </p>
          <h1 className="page-hero-title !text-white">
            {heading}
          </h1>
          <p className="page-hero-description !mt-2 !text-white/90">
            {description}
          </p>
        </Container>
      </section>

      <PageSection className="consultation-pattern bg-brand-50">
        <Container>
          <div className="hydro-section-title">
            <h2>Calculator Categories</h2>
            <span className="line-bar">...</span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {calculatorCategories.map((category, index) => (
              <div
                key={category.id}
                className="hero-animate-in"
                style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
              >
                <CalculatorCategoryCard
                  title={category.title}
                  icon={category.icon}
                  calculators={getCategoryCalculators(category)}
                />
              </div>
            ))}
          </div>
        </Container>
      </PageSection>

      <section className="bg-brand-800 py-10 text-white sm:py-12 lg:py-14">
        <Container className="text-center">
          <div className="hydro-section-title !mb-4">
            <h2 className="!text-white">Need Personalized Financial Guidance?</h2>
            <span className="line-bar !text-white/30">...</span>
          </div>
          <p className="mx-auto max-w-xl text-sm text-white/90 sm:text-base">
            Our team can help you interpret results and build a plan tailored to
            your goals.
          </p>
          <button type="button" onClick={openModal} className="hydro-btn mt-8">
            Book Free Consultation
          </button>
        </Container>
      </section>
    </>
  )
}

export default Calculators
