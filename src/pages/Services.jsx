import Container from '../components/Container'
import PageHeader from '../components/PageHeader'
import PageSection from '../components/PageSection'
import ServiceCard from '../components/ServiceCard'
import ConsultationCta from '../components/ConsultationCta'
import {
  servicesList,
  mutualFundDisclaimer,
  advisorCredentials,
} from '../data/services'

function Services() {
  return (
    <>
      <PageHeader
        title="Services"
        subtitle="True wealth management is a roadmap for every stage of life — combining 13+ years of market expertise with a client-centric approach."
      />
      <PageSection className="bg-brand-50">
        <Container>
          <div className="hydro-section-title">
            <h2>Our Services</h2>
            <span className="line-bar">...</span>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-[#334155] sm:text-base">
              Specialized financial solutions in investments, insurance, education
              planning, retirement, and equity advisory — tailored to your goals.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {servicesList.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                benefits={service.benefits}
                highlights={service.highlights}
                icon={service.icon}
              />
            ))}
          </div>

          <div className="mt-12 space-y-4 rounded-xl border border-brand-100 bg-white p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Important Disclosure
            </p>
            <p className="text-xs leading-relaxed text-[#334155] sm:text-sm">
              {mutualFundDisclaimer}
            </p>
            <p className="text-sm font-medium text-brand-800">{advisorCredentials}</p>
          </div>
        </Container>
      </PageSection>

      <ConsultationCta />
    </>
  )
}

export default Services
