import Container from '../components/Container'
import Hero from '../components/Hero'
import Card from '../components/Card'
import ConsultationSection from '../components/ConsultationSection'
import { useConsultation } from '../context/ConsultationContext'

function Home() {
  const { openModal } = useConsultation()

  const highlights = [
    {
      title: 'Demat Account Services',
      description:
        'Open, manage, and optimize your demat accounts with expert guidance.',
    },
    {
      title: 'Investment Advisory',
      description:
        'Personalized strategies aligned with your risk profile and financial goals.',
    },
    {
      title: 'Business Consulting',
      description:
        'Practical financial planning and compliance support for growing businesses.',
    },
  ]

  return (
    <>
      <Hero />

      <section className="bg-brand-50 py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="hydro-section-title">
            <h2>What We Offer</h2>
            <span className="line-bar">...</span>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[#334155] sm:text-base">
              Comprehensive financial services designed for individuals and
              businesses.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:mt-10">
            {highlights.map((item) => (
              <Card
                key={item.title}
                title={item.title}
                description={item.description}
                accentHover
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="relative bg-brand-800 py-12 text-white sm:py-14 lg:py-16">
        <Container className="text-center">
          <div className="hydro-section-title !mb-6">
            <h2 className="!text-white">Ready to get started?</h2>
            <span className="line-bar !text-white/30">...</span>
          </div>
          <p className="mx-auto max-w-xl text-sm text-white/90 sm:text-base">
            Schedule a consultation and take the next step toward smarter
            financial decisions.
          </p>
          <div className="mt-8">
            <button type="button" onClick={openModal} className="hydro-btn">
              Book Free Consultation
            </button>
          </div>
        </Container>
      </section>

      <ConsultationSection />
    </>
  )
}

export default Home
