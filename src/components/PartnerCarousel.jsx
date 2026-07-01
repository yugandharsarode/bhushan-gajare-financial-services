import Container from './Container'
import { partnerLogos } from '../data/partnerLogos'

function PartnerLogo({ src, alt }) {
  return (
    <div className="partner-logo-card group shrink-0">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="partner-logo-image"
        draggable="false"
      />
    </div>
  )
}

function PartnerCarousel() {
  if (partnerLogos.length === 0) {
    return null
  }

  const scrollingLogos = [...partnerLogos, ...partnerLogos]

  return (
    <section
      className="partner-carousel-section relative overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
      aria-label="Associated financial partners"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent"
        aria-hidden="true"
      />

      <Container>
        <div className="hydro-section-title partner-section-title">
          <p className="page-kicker !text-brand-600">Our Network</p>
          <h2>
            Associated <span className="text-[#d4af37]">With</span>
          </h2>
          <span className="line-bar">...</span>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#334155] sm:text-base">
            Trusted Investment &amp; Financial Partners
          </p>
        </div>
      </Container>

      <div className="partner-carousel-viewport mt-8 sm:mt-10">
        <div className="partner-carousel-track">
          {scrollingLogos.map((logo, index) => (
            <PartnerLogo
              key={`${logo.src}-${index}`}
              src={logo.src}
              alt={logo.alt}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PartnerCarousel
