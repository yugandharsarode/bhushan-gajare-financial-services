import Container from '../components/Container'
import PageHeader from '../components/PageHeader'
import PageSection from '../components/PageSection'
import Card from '../components/Card'

function DematServices() {
  const services = [
    {
      title: 'Demat Account Opening',
      description:
        'Assistance with opening demat accounts across leading depositories and brokers.',
    },
    {
      title: 'Account Transfer & Closure',
      description:
        'Smooth transfer of holdings and hassle-free account closure support.',
    },
    {
      title: 'Nomination & KYC Updates',
      description:
        'Help with nominee registration, KYC updates, and document verification.',
    },
    {
      title: 'Corporate Actions Support',
      description:
        'Guidance on dividends, bonus issues, splits, and other corporate actions.',
    },
  ]

  return (
    <>
      <PageHeader
        title="Demat Services"
        subtitle="End-to-end demat account support — from opening to ongoing maintenance and corporate actions."
      />
      <PageSection className="bg-brand-50">
        <Container>
          <p className="max-w-3xl text-[#334155]">
          Open your Demat account with expert assistance and begin your investment journey with confidence. We provide smooth account opening support, guidance for stock market investing, and personalized assistance for selecting suitable investment options.
          </p>
          <div className="mt-6 grid gap-6 sm:mt-8 sm:grid-cols-2">
            {services.map((service) => (
              <Card
                key={service.title}
                title={service.title}
                description={service.description}
                accentHover
              />
            ))}
          </div>
        </Container>
      </PageSection>
    </>
  )
}

export default DematServices
