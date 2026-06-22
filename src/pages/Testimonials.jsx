import Container from '../components/Container'
import PageHeader from '../components/PageHeader'
import PageSection from '../components/PageSection'
import Card from '../components/Card'

function Testimonials() {
  const testimonials = [
    {
      name: 'Client A',
      role: 'Investor',
      quote:
        'Excellent guidance on demat account setup. Professional and responsive throughout the process.',
    },
    {
      name: 'Client B',
      role: 'Business Owner',
      quote:
        'Clear financial advice that helped our business plan investments more effectively.',
    },
    {
      name: 'Client C',
      role: 'Retiree',
      quote:
        'Trustworthy advisory with a personal touch. Highly recommend for retirement planning.',
    },
  ]

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="What clients say about working with Bhushan Gajare."
      />
      <PageSection className="bg-brand-50">
        <Container>
          <p className="max-w-3xl text-[#334155]">
            Placeholder content: Real client testimonials from bhushangajare.com
            will replace these sample entries.
          </p>
          <div className="mt-6 grid gap-6 sm:mt-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} accentHover>
                <p className="italic text-white/90 transition-colors duration-300 group-hover:text-brand-900">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-4 border-t border-white/20 pt-4 transition-colors duration-300 group-hover:border-brand-900/20">
                  <p className="font-semibold text-white transition-colors duration-300 group-hover:text-brand-900">{item.name}</p>
                  <p className="text-sm text-white/80 transition-colors duration-300 group-hover:text-brand-900">{item.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </PageSection>
    </>
  )
}

export default Testimonials
