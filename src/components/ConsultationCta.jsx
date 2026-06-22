import Container from './Container'
import { useConsultation } from '../context/ConsultationContext'

function ConsultationCta({ className = '' }) {
  const { openModal } = useConsultation()

  return (
    <section className={`relative bg-brand-800 py-12 text-white sm:py-14 lg:py-16 ${className}`}>
      <Container className="text-center">
        <div className="hydro-section-title !mb-5">
          <h2 className="!text-white">Need Personalized Financial Guidance?</h2>
          <span className="line-bar !text-white/30">...</span>
        </div>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          Whether it is stock market investments, mutual funds, insurance, child
          education, retirement planning, or complete family financial planning —
          we help you build a secure and prosperous future.
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={openModal}
            className="hydro-btn !px-8 !py-4 !text-base"
          >
            Book Free Consultation
          </button>
        </div>
      </Container>
    </section>
  )
}

export default ConsultationCta
