import Container from './Container'

function PageHeader({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-brand-800" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_55%)]" aria-hidden="true" />

      <Container className="relative py-5 sm:py-6 lg:py-8">
        <div className="hydro-section-title !mb-0 !text-left">
          <p className="page-kicker !text-white/75">
            Bhushan Gajare
          </p>
          <h1 className="page-hero-title !text-white">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="page-hero-description !mt-2 !max-w-2xl !text-white/90">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  )
}

export default PageHeader
