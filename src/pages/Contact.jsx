import Container from '../components/Container'
import PageHeader from '../components/PageHeader'
import PageSection from '../components/PageSection'
import ConsultationForm from '../components/ConsultationForm'
import { siteInfo } from '../data/navigation'

function Contact() {
  return (
    <>
      <PageHeader
        title="Contact"
        subtitle="Get in touch for demat services, consultations, or general inquiries."
      />
      <PageSection className="relative bg-brand-50">
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-5 lg:items-start lg:gap-12">
            <div className="space-y-6 lg:col-span-2">
              <div className="hydro-section-title !mb-0 !text-left">
                <h2>Get in touch</h2>
                <span className="line-bar !ml-0">...</span>
              </div>
              <p className="text-sm text-[#334155] sm:text-base">
                Reach out for demat accounts, mutual funds, insurance, or
                personalized financial planning. Fill in the form and our team
                will respond shortly.
              </p>
              <ul className="space-y-3 text-sm sm:space-y-4 sm:text-base">
                <li className="premium-interactive-card group px-4 py-3">
                  <span className="font-semibold text-white transition-colors duration-300 group-hover:text-brand-900">Email: </span>
                  {siteInfo.email}
                </li>
                <li className="premium-interactive-card group px-4 py-3">
                  <span className="font-semibold text-white transition-colors duration-300 group-hover:text-brand-900">Phone: </span>
                  {siteInfo.phone}
                </li>
                <li className="premium-interactive-card group px-4 py-3">
                  <span className="font-semibold text-white transition-colors duration-300 group-hover:text-brand-900">Location: </span>
                  {siteInfo.address}
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <ConsultationForm variant="section" />
            </div>
          </div>
        </Container>
      </PageSection>
    </>
  )
}

export default Contact
