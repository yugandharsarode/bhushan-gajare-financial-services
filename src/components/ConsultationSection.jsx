import Container from './Container'
import ConsultationForm from './ConsultationForm'

function ConsultationSection({ className = '' }) {
  return (
    <section className={`relative bg-brand-50 py-12 sm:py-14 lg:py-16 ${className}`}>
      <Container className="relative">
        <div className="hydro-section-title">
          <h2>Contact us</h2>
          <span className="line-bar">...</span>
        </div>
        <ConsultationForm variant="section" />
      </Container>
    </section>
  )
}

export default ConsultationSection
