import Container from '../components/Container'
import PageHeader from '../components/PageHeader'
import PageSection from '../components/PageSection'
import ConsultationCta from '../components/ConsultationCta'
import { aboutPageMeta, aboutSections, aboutThemes } from '../data/about'

function About() {
  return (
    <>
      <PageHeader title={aboutPageMeta.title} subtitle={aboutPageMeta.subtitle} />

      <PageSection>
        <Container>
          <div className="hydro-section-title">
            <h2>Our Story</h2>
            <span className="line-bar">...</span>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-[#334155] sm:text-base">
              We are committed to guiding your financial journey with clarity,
              confidence, and smart strategies — helping you achieve financial
              independence through expert advice in investments, insurance, and
              retirement planning.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {aboutSections.map((section) => (
              <article key={section.id} className="hydro-card rounded-xl p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                  {section.title}
                </p>
                <p className="mt-3 text-base font-medium leading-relaxed text-brand-700 sm:text-lg">
                  {section.intro}
                </p>
                <ul className="mt-5 space-y-3">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2.5 text-sm leading-relaxed text-[#334155] sm:text-base"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </PageSection>

      <section className="bg-brand-50 py-12 sm:py-14 lg:py-16">
        <Container>
          <div className="hydro-section-title">
            <h2>What We Stand For</h2>
            <span className="line-bar">...</span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aboutThemes.map((theme) => (
              <div
                key={theme.label}
                className="premium-interactive-card group p-5 sm:p-6"
              >
                <h3 className="text-sm font-semibold text-white transition-colors duration-300 group-hover:text-brand-900 sm:text-base">
                  {theme.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/90 transition-colors duration-300 group-hover:text-brand-900">
                  {theme.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <ConsultationCta />
    </>
  )
}

export default About
