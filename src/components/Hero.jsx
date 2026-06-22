import { Link } from 'react-router-dom'
import Container from './Container'
import { useConsultation } from '../context/ConsultationContext'
import { heroContent, heroStats } from '../data/hero'
import { siteInfo } from '../data/navigation'
import bhushanPhoto from '../assets/bhushan.jpg'

function Hero() {
  const { openModal } = useConsultation()

  return (
    <section className="hero-section relative overflow-hidden bg-brand-50">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-brand-100/70" />
        <div className="hero-dot-pattern absolute inset-0 opacity-80" />
      </div>

      <Container className="relative pt-6 pb-9 sm:pt-8 sm:pb-11 lg:pt-10 lg:pb-12">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="order-1 hero-animate-in lg:pr-4">
            <p className="inline-flex rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 sm:text-sm">
              {heroContent.tagline}
            </p>

            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-brand-800 sm:text-5xl lg:text-6xl">
              {heroContent.heading}
            </h1>

            <p className="mt-3 text-xl font-semibold text-brand-700 sm:text-2xl">
              {heroContent.subheading}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#334155] sm:text-base">
              {heroContent.description}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={openModal} className="hydro-btn">
                Book Free Consultation
              </button>
              <Link to="/services" className="hydro-btn-secondary">
                Explore Services
              </Link>
            </div>

            <div className="mt-6 inline-flex items-center gap-4 text-[#334155]">
              <span className="text-sm font-medium">
                CALL US {siteInfo.phone}
                <small className="mt-0.5 block text-xs text-[#64748b]">
                  For any inquiry
                </small>
              </span>
            </div>
          </div>

          <div className="order-2 hero-animate-in hero-animate-delay flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
              <div
                className="hydro-card relative overflow-hidden rounded-xl p-2"
                aria-hidden="false"
              >
                <img
                  src={bhushanPhoto}
                  alt="Mr. Bhushan Gajare"
                  className="block h-auto max-h-80 w-full rounded-xl object-contain sm:max-h-96 lg:max-h-[28rem]"
                  width={560}
                  height={700}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-animate-in hero-animate-delay-2 mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6 lg:mt-10">
          {heroStats.map((stat) => (
            <div
              key={stat.id}
              className="hydro-card rounded-xl px-5 py-5 text-center transition-transform duration-500 hover:-translate-y-0.5 sm:text-left"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                {stat.label}
              </p>
              <p className="mt-1 text-lg font-medium text-brand-800">{stat.value}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Hero
